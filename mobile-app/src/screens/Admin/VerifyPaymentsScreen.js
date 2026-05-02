import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image, Modal } from 'react-native';
import { Colors } from '../../theme/colors';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { Ionicons } from '@expo/vector-icons';

const VerifyPaymentsScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/payment/display`);
      // Filter for bank deposits and pending status if needed, or show all
      setPayments(response.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (id, status) => {
    try {
      await axios.patch(`${API_URL}/api/payment/${id}/status`, { paymentStatus: status });
      setPayments(payments.map(p => p._id === id ? { ...p, paymentStatus: status } : p));
      Alert.alert('Success', `Payment ${status}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update payment status');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.bookingType}</Text>
        <Text style={[styles.statusText, { color: item.paymentStatus === 'success' ? '#10b981' : '#f59e0b' }]}>
          {item.paymentStatus.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.cardDetail}>Amount: LKR {item.amount}</Text>
      <Text style={styles.cardDetail}>Method: {item.paymentMethod}</Text>
      
      {item.receiptUrl && (
        <TouchableOpacity 
          style={styles.receiptPreview}
          onPress={() => setSelectedImage(item.receiptUrl)}
        >
          <Image source={{ uri: item.receiptUrl }} style={styles.receiptThumb} />
          <Text style={styles.receiptLink}>View Receipt</Text>
        </TouchableOpacity>
      )}

      {item.paymentStatus === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => verifyPayment(item._id, 'success')}
          >
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => verifyPayment(item._id, 'failed')}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Verify Payments</Text>
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
          ListEmptyComponent={<Text style={styles.empty}>No payments to verify.</Text>}
        />
      )}

      <Modal visible={!!selectedImage} transparent={true}>
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
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDetail: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  receiptPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
  },
  receiptThumb: {
    width: 40,
    height: 40,
    borderRadius: 5,
  },
  receiptLink: {
    marginLeft: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#10b981',
    marginRight: 10,
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
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
    width: '90%',
    height: '70%',
  },
  loader: {
    marginTop: 50,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: Colors.textLight,
  },
});

export default VerifyPaymentsScreen;
