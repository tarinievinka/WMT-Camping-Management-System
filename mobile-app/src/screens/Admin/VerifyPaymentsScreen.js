import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Image, 
  Modal,
  TextInput,
  ScrollView,
  Platform 
} from 'react-native';
import { Colors } from '../../theme/colors';
import apiClient, { getImageUrl } from '../../api/apiClient';
import { Ionicons, Feather } from '@expo/vector-icons';

const VerifyPaymentsScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Edit Modal States
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await apiClient.get('/payment/display');
      setPayments(response.data);
    } catch (err) {
      console.error('Fetch payments error:', err);
      Alert.alert('Error', 'Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (id, status) => {
    try {
      await apiClient.patch(`/payment/${id}/status`, { status });
      setPayments(payments.map(p => p._id === id ? { ...p, paymentStatus: status } : p));
      Alert.alert('Success', `Payment ${status === 'success' ? 'Approved' : 'Rejected'}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update payment status');
    }
  };

  const deletePayment = (id) => {
    console.log('[DEBUG] Admin attempting to delete payment ID:', id);
    
    const performDelete = async () => {
      try {
        console.log('[DEBUG] Deletion confirmed, calling API...');
        const response = await apiClient.delete(`/payment/delete/${id}`);
        console.log('[DEBUG] Delete response:', response.data);
        setPayments(payments.filter(p => p._id !== id));
        if (Platform.OS === 'web') {
          alert('Payment record has been removed.');
        } else {
          Alert.alert('Deleted', 'Payment record has been removed.');
        }
      } catch (err) {
        console.error('[DEBUG] Delete error:', err.response?.data || err.message);
        Alert.alert('Error', 'Failed to delete payment record');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to remove this payment record? This will not cancel the booking itself.')) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Record',
        'Are you sure you want to remove this payment record? This will not cancel the booking itself.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete }
        ]
      );
    }
  };

  const openEditModal = (payment) => {
    setEditingPayment(payment);
    setEditAmount(payment.amount.toString());
    setIsEditModalVisible(true);
  };

  const handleUpdateDetails = async () => {
    if (!editAmount || isNaN(editAmount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid numeric amount.');
      return;
    }

    try {
      const response = await apiClient.put(`/payment/update/${editingPayment._id}`, {
        amount: parseFloat(editAmount)
      });
      setPayments(payments.map(p => p._id === editingPayment._id ? response.data : p));
      setIsEditModalVisible(false);
      Alert.alert('Updated', 'Transaction details have been updated.');
    } catch (err) {
      Alert.alert('Error', 'Failed to update transaction details');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success': return '#10b981';
      case 'failed': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{item.bookingType?.replace('Booking', '') || 'Payment'}</Text>
          <Text style={styles.cardId}>ID: {item._id?.slice(-8).toUpperCase()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.paymentStatus) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.paymentStatus) }]}>
            {(item.paymentStatus || 'Pending').toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Ionicons name="wallet-outline" size={16} color={Colors.gray} />
          <Text style={styles.cardDetail}>Amount: LKR {item.amount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="card-outline" size={16} color={Colors.gray} />
          <Text style={styles.cardDetail}>Method: {item.paymentMethod?.toUpperCase()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
          <Text style={styles.cardDetail}>Date: {new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      </View>
      
      {item.receiptUrl && (
        <TouchableOpacity 
          style={styles.receiptPreview}
          onPress={() => setSelectedImage(getImageUrl(item.receiptUrl))}
        >
          <Image source={{ uri: getImageUrl(item.receiptUrl) }} style={styles.receiptThumb} />
          <View style={styles.receiptInfo}>
            <Text style={styles.receiptLink}>View Bank Slip</Text>
            <Text style={styles.receiptSubtext}>Tap to enlarge</Text>
          </View>
          <Ionicons name="eye-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      )}

      <View style={styles.footerActions}>
        {item.paymentStatus === 'pending' && (
          <View style={styles.mainActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => verifyPayment(item._id, 'success')}
            >
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.buttonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => verifyPayment(item._id, 'failed')}
            >
              <Ionicons name="close-circle" size={18} color="#fff" />
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.secondaryActions}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => openEditModal(item)}
          >
            <Feather name="edit-2" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => deletePayment(item._id)}
          >
            <Feather name="trash-2" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Management</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={payments}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={60} color="#cbd5e1" />
              <Text style={styles.empty}>No payments found.</Text>
            </View>
          }
        />
      )}

      {/* Bank Slip Modal */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalClose}
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close" size={32} color={Colors.white} />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />
          )}
        </View>
      </Modal>

      {/* Edit Details Modal */}
      <Modal visible={isEditModalVisible} transparent={true} animationType="slide">
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Update Transaction</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.editForm}>
              <Text style={styles.inputLabel}>AMOUNT (LKR)</Text>
              <TextInput 
                style={styles.input}
                value={editAmount}
                onChangeText={setEditAmount}
                keyboardType="numeric"
                placeholder="Enter new amount"
              />
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleUpdateDetails}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
      web: { boxShadow: '0px 4px 6px rgba(0,0,0,0.05)' },
      default: { elevation: 2 }
    })
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  cardId: {
    fontSize: 10,
    color: Colors.gray,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardBody: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardDetail: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 8,
  },
  receiptPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 15,
  },
  receiptThumb: {
    width: 45,
    height: 45,
    borderRadius: 8,
  },
  receiptInfo: {
    flex: 1,
    marginLeft: 12,
  },
  receiptLink: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  receiptSubtext: {
    fontSize: 10,
    color: Colors.gray,
    marginTop: 2,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 15,
  },
  mainActions: {
    flexDirection: 'row',
    flex: 1,
  },
  secondaryActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 6,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  modalImage: {
    width: '95%',
    height: '80%',
  },
  loader: {
    marginTop: 50,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  empty: {
    textAlign: 'center',
    marginTop: 15,
    color: Colors.gray,
    fontSize: 16,
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  editModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  editForm: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.gray,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default VerifyPaymentsScreen;
