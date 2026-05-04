import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform, 
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { useFocusEffect } from '@react-navigation/native';

const GuideEarningsScreen = () => {
  const { user } = useAuth();
  const [completedTrips, setCompletedTrips] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchEarnings();
    }, [])
  );

  const fetchEarnings = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/guide-bookings/my-bookings');
      const bookings = response.data || [];
      
      // Filter only completed trips
      const completed = bookings.filter(b => b.status === 'Completed' || b.status === 'paid');
      
      // Calculate total income
      const income = completed.reduce((sum, b) => sum + (b.amount || 0), 0);
      
      setCompletedTrips(completed.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
      setTotalIncome(income);
    } catch (err) {
      console.error("[GUIDE_EARNINGS] Fetch failed:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEarnings();
  };

  const renderTripItem = ({ item }) => (
    <View style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <View style={styles.tripIconBg}>
          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
        </View>
        <View style={styles.tripInfo}>
          <Text style={styles.customerName}>{item.customerName || 'Customer'}</Text>
          <Text style={styles.tripDate}>
            {new Date(item.startDate).toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amountText}>+LKR {item.amount?.toLocaleString()}</Text>
          <Text style={styles.statusLabel}>EARNED</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
        <Text style={styles.headerSubtitle}>Your track record of success</Text>
      </View>

      <View style={styles.incomeCard}>
        <View style={styles.incomeHeader}>
          <Text style={styles.incomeLabel}>TOTAL EARNINGS</Text>
          <MaterialCommunityIcons name="piggy-bank-outline" size={24} color="rgba(255,255,255,0.6)" />
        </View>
        <Text style={styles.incomeValue}>LKR {totalIncome.toLocaleString()}</Text>
        <View style={styles.incomeFooter}>
          <View style={styles.badge}>
            <Ionicons name="trending-up" size={14} color="#fff" />
            <Text style={styles.badgeText}>{completedTrips.length} Trips Completed</Text>
          </View>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Earnings History</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Calculating your earnings...</Text>
        </View>
      ) : (
        <FlatList
          data={completedTrips}
          renderItem={renderTripItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="cash-outline" size={48} color="#94a3b8" />
              </View>
              <Text style={styles.emptyTitle}>No earnings yet</Text>
              <Text style={styles.emptySubtitle}>
                Complete your first trip to start earning with CampTrail 360!
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#064e3b',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  incomeCard: {
    backgroundColor: '#064e3b',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 25,
    elevation: 8,
    shadowColor: '#064e3b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  incomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  incomeLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  incomeValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 15,
  },
  incomeFooter: {
    flexDirection: 'row',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  tripInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  tripDate: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10b981',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    overflow: 'hidden',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default GuideEarningsScreen;
