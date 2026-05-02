import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import apiClient from '../../api/apiClient';

const { width } = Dimensions.get('window');

const PaymentHistoryScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPayments().then(() => setRefreshing(false));
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await apiClient.get('/payment/my-payments');
      setPayments(Array.isArray(response.data) ? response.data : (response.data.data || []));
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = payments.reduce((acc, curr) => 
      curr.paymentStatus === 'success' ? acc + (parseFloat(curr.amount) || 0) : acc, 0);
    const pendingCount = payments.filter(p => p.paymentStatus === 'pending').length;
    return { total, pendingCount };
  }, [payments]);

  const handleCancelPayment = (id) => {
    const performCancel = async () => {
      try {
        await apiClient.delete(`/payment/delete/${id}`);
        setPayments(payments.filter(p => p._id !== id));
        if (Platform.OS === 'web') {
          alert('Your pending payment record has been removed.');
        } else {
          Alert.alert('Cancelled', 'Your pending payment record has been removed.');
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to cancel payment. It may have already been processed.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to cancel this pending payment record? This will remove the transaction record.')) {
        performCancel();
      }
    } else {
      Alert.alert(
        'Cancel Payment',
        'Are you sure you want to cancel this pending payment record? This will remove the transaction record.',
        [
          { text: 'No, Keep it', style: 'cancel' },
          { text: 'Yes, Cancel', style: 'destructive', onPress: performCancel }
        ]
      );
    }
  };

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'paid':
        return { color: '#10b981', label: 'Completed', icon: 'checkmark-circle' };
      case 'pending':
        return { color: '#f59e0b', label: 'Pending', icon: 'time' };
      case 'failed':
        return { color: '#ef4444', label: 'Failed', icon: 'close-circle' };
      default:
        return { color: '#64748b', label: status || 'Unknown', icon: 'help-circle' };
    }
  };

  const getTypeIcon = (type) => {
    const name = type?.toLowerCase() || '';
    if (name.includes('campsite')) return { name: 'map-marker-radius', color: '#3b82f6' };
    if (name.includes('equipment')) return { name: 'tent', color: '#10b981' };
    if (name.includes('guide')) return { name: 'compass-outline', color: '#8b5cf6' };
    return { name: 'credit-card-outline', color: '#64748b' };
  };

  const renderHeader = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={styles.summaryValue}>LKR {stats.total.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>{stats.pendingCount}</Text>
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.paymentStatus);
    const typeIcon = getTypeIcon(item.bookingType);
    const date = new Date(item.createdAt);

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.iconBg, { backgroundColor: typeIcon.color + '15' }]}>
            <MaterialCommunityIcons name={typeIcon.name} size={24} color={typeIcon.color} />
          </View>
          <View style={styles.mainInfo}>
            <Text style={styles.cardType}>{item.bookingType?.replace('Booking', '') || 'Service Payment'}</Text>
            <Text style={styles.cardDate}>
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={[styles.statusTag, { backgroundColor: statusInfo.color + '15' }]}>
            <Ionicons name={statusInfo.icon} size={12} color={statusInfo.color} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBottom}>
          <View>
            <Text style={styles.metaLabel}>Payment Method</Text>
            <View style={styles.methodRow}>
              <Ionicons name="card-outline" size={14} color="#64748b" />
              <Text style={styles.methodText}>{(item.paymentMethod || 'Online').toUpperCase().replace('-', ' ')}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.metaLabel}>Total Amount</Text>
            <Text style={styles.amountText}>LKR {item.amount}</Text>
          </View>
        </View>

        {item.paymentStatus === 'pending' && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelPayment(item._id)}
          >
            <Feather name="x-circle" size={14} color="#ef4444" />
            <Text style={styles.cancelText}>Cancel Transaction</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Transaction History</Text>
          <Text style={styles.headerSubtitle}>View and manage your payments</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching history...</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="receipt-outline" size={48} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyTitle}>No Transactions Yet</Text>
              <Text style={styles.emptySubtitle}>Your payment records will appear here once you make a booking.</Text>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Equipment')}
              >
                <Text style={styles.exploreButtonText}>Start Exploring</Text>
              </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 50,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(241, 245, 249, 0.5)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }
    })
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  summaryContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(22, 101, 52, 0.9)', // Transparent Forest Green
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(8px)',
      },
      default: {
        elevation: 8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      }
    })
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' },
      default: { elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }
    })
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mainInfo: {
    flex: 1,
  },
  cardType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  cardDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 15,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginLeft: 5,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: '#fff1f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  cancelText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 60,
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
    color: Colors.text,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  exploreButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  exploreButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default PaymentHistoryScreen;
