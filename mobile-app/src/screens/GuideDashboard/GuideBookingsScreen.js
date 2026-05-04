import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';

const GuideBookingsScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(item => {
    const isPast = item.status === 'Completed' || item.status === 'Rejected' || item.status === 'Cancelled' || item.status === 'paid';
    return activeTab === 'completed' ? isPast : !isPast;
  });

  const fetchBookings = async () => {
    try {
      const response = await apiClient.get('/guide-bookings/my-bookings');
      setBookings(response.data || []);
    } catch (err) {
      console.error("[GUIDE_BOOKINGS] Fetch failed:", err);
      showToast("Failed to load bookings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (id, newStatus) => {
    try {
      console.log(`[GUIDE_BOOKINGS] Updating booking ${id} to ${newStatus}`);
      const response = await apiClient.put(`/guide-bookings/update/${id}`, { status: newStatus });
      
      const actionText = newStatus === 'Rejected' ? 'rejected' : 
                         newStatus === 'Confirmed' ? 'confirmed' : 'completed';
      
      showToast(`Booking has been ${actionText} successfully.`);
      fetchBookings(); // Refresh list
    } catch (err) {
      console.error("[GUIDE_BOOKINGS] Update failed:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to update booking status.";
      showToast(errorMsg, "error");
    }
  };


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.customerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.customerName?.charAt(0) || 'C'}</Text>
          </View>
          <View>
            <Text style={styles.customerName}>{item.customerName || 'Anonymous'}</Text>
            <Text style={styles.dateText}>{item.startDate ? new Date(item.startDate).toLocaleDateString() : 'No date'}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 'Confirmed' ? '#dcfce7' : 
                           item.status === 'Completed' ? '#d1fae5' :
                           item.status === 'Pending' ? '#fef3c7' : '#fee2e2' 
        }]}>
          <Text style={[styles.statusText, { 
            color: item.status === 'Confirmed' ? '#166534' : 
                   item.status === 'Completed' ? '#059669' :
                   item.status === 'Pending' ? '#d97706' : '#dc2626' 
          }]}>
            {item.status || 'Pending'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={16} color="#64748b" />
          <Text style={styles.detailText}>LKR {item.amount?.toLocaleString()}</Text>
        </View>
        <View style={[styles.detailItem, { marginTop: 8 }]}>
          <Ionicons name="people-outline" size={16} color="#64748b" />
          <Text style={styles.detailText}>{item.numberOfGuests || 1} {item.numberOfGuests === 1 ? 'Guest' : 'Guests'}</Text>
        </View>
      </View>

      {item.status === 'Pending' && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.confirmButton]} 
            onPress={() => updateBookingStatus(item._id, 'Confirmed')}
          >
            <Text style={styles.actionButtonText}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]} 
            onPress={() => {
              const handleReject = () => updateBookingStatus(item._id, 'Rejected');
              
              if (Platform.OS === 'web') {
                if (window.confirm("Are you sure you want to reject this booking?")) {
                  handleReject();
                }
              } else {
                Alert.alert(
                  "Reject Booking",
                  "Are you sure you want to reject this booking?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Reject", style: "destructive", onPress: handleReject }
                  ]
                );
              }
            }}
          >
            <Text style={[styles.actionButtonText, { color: '#dc2626' }]}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'Confirmed' && (
        <TouchableOpacity 
          style={[styles.actionButton, styles.confirmButton, { flex: 1, width: '100%' }]} 
          onPress={() => {
            const handleComplete = () => updateBookingStatus(item._id, 'Completed');
            
            if (Platform.OS === 'web') {
              if (window.confirm("Are you sure this trip is completed?")) {
                handleComplete();
              }
            } else {
              Alert.alert(
                "Complete Trip",
                "Are you sure you want to mark this trip as completed?",
                [
                  { text: "No", style: "cancel" },
                  { text: "Yes, Complete", onPress: handleComplete }
                ]
              );
            }
          }}
        >
          <Text style={styles.actionButtonText}>Complete Trip</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity onPress={fetchBookings}>
          <Ionicons name="refresh" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>Completed</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={60} color="#cbd5e1" />
              <Text style={styles.emptyText}>No bookings found</Text>
            </View>
          }
        />
      )}

      {toast.visible && (
        <View style={[styles.toastContainer, { backgroundColor: toast.type === 'success' ? '#059669' : '#dc2626' }]}>
          <Ionicons 
            name={toast.type === 'success' ? 'checkmark-circle' : 'alert-circle'} 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#064e3b',
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 15,
  },
  details: {
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 8,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#166534',
  },
  rejectButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 10,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  activeTab: {
    backgroundColor: '#064e3b',
    borderColor: '#064e3b',
  },
  tabText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748b',
  },
  activeTabText: {
    color: '#fff',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    ...Shadows.medium,
    zIndex: 9999,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default GuideBookingsScreen;
