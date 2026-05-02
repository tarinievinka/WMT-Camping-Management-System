import React, { useState, useEffect } from 'react';
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
  Alert
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import apiClient from '../../api/apiClient';

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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'paid':
        return '#16a34a';
      case 'pending':
        return '#ca8a04';
      case 'failed':
        return '#dc2626';
      default:
        return '#64748b';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.id}>Invoice #{item._id?.substring(0, 8).toUpperCase()}</Text>
          <Text style={styles.typeText}>{item.bookingType?.replace('Booking', '') || 'Payment'}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.paymentStatus) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.paymentStatus) }]}>
              {(item.paymentStatus || 'Pending').toUpperCase()}
            </Text>
          </View>
          {item.paymentStatus === 'pending' && (
            <TouchableOpacity 
              style={styles.cancelBtn}
              onPress={() => handleCancelPayment(item._id)}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Method</Text>
          <Text style={styles.methodText}>{(item.paymentMethod || 'Unknown').replace('-', ' ').toUpperCase()}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.label}>Amount Paid</Text>
          <Text style={styles.amount}>Rs. {item.amount}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Payment History</Text>
          <Text style={styles.subtitle}>Track and manage your transactions</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={60} color="#cbd5e1" />
              <Text style={styles.emptyText}>No payment history found.</Text>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusSection: {
    alignItems: 'flex-end',
  },
  id: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  date: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fff1f2',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  cancelBtnText: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  label: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  methodText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 15,
    color: '#64748b',
    fontSize: 16,
  }
});

export default PaymentHistoryScreen;
