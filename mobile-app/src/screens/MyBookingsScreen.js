import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Shadows } from '../theme/shadows';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const MyBookingsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [activeTab, setActiveTab] = useState('active');
  
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };
  
  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchBookings().then(() => setRefreshing(false));
  }, []);

  const fetchBookings = async () => {
    try {
      // Fetch Campsite Bookings
      const resRes = await apiClient.get('/reservations/myreservations');
      const campData = resRes.data.map(item => ({
        ...item,
        type: 'Campsite',
        name: item.campsite?.name || 'Campsite Booking',
        targetId: item.campsite?._id || item.campsiteId,
        targetName: item.campsite?.name || 'Campsite Booking',
        targetType: 'Campsite',
        date: new Date(item.checkInDate).toLocaleDateString(),
        displayAmount: `LKR ${item.totalPrice}`,
        status: item.status === 'Payment Confirmed' ? 'Confirmed' : item.status
      }));

      // Fetch Guide Bookings
      const guideRes = await apiClient.get('/guide-bookings/my-customer-bookings');
      const guideData = guideRes.data.map(item => ({
          ...item,
          type: 'Guide',
          name: item.guideName || 'Guide Booking',
          targetId: item.guideId,
          targetName: item.guideName || 'Guide Booking',
          targetType: 'Guide',
          guidePhoto: item.guidePhoto,
          numberOfGuests: item.numberOfGuests,
          date: item.startDate ? new Date(item.startDate).toLocaleDateString() : 'No date',
          displayAmount: `LKR ${item.amount}`,
          status: item.status
        }));

      // Fetch Equipment Purchases/Rentals
      const equipRes = await apiClient.get('/purchases/my');
      const equipData = equipRes.data.map(item => ({
        ...item,
        type: 'Equipment',
        name: item.items?.length > 0 ? item.items[0].name : 'Equipment Purchase',
        targetId: item.items?.length > 0 ? item.items[0].equipmentId : null,
        targetName: item.items?.length > 0 ? item.items[0].name : 'Equipment Purchase',
        targetType: 'Equipment',
        date: new Date(item.createdAt).toLocaleDateString(),
        displayAmount: `LKR ${item.totalPrice}`,
        status: item.status === 'paid' ? 'Confirmed' : (item.status === 'pending' ? 'Pending' : item.status)
      }));

      const allBookings = [...campData, ...guideData, ...equipData].sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate));
      setBookings(allBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
      } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = (item) => {
    const bookingDate = new Date(item.startDate || item.checkInDate || item.createdAt);
    const today = new Date();
    
    console.log("[DELETE] Booking Date:", bookingDate);
    console.log("[DELETE] Today:", today);
    console.log("[DELETE] Is Future:", bookingDate > today);

    // Only allow deletion if the booking is in the future
    if (bookingDate <= today && item.type !== 'Equipment') {
      Alert.alert(
        'Cannot Cancel',
        'This booking has already started or is in the past. You can only cancel upcoming bookings.'
      );
      return;
    }

    const performDelete = async () => {
      try {
        console.log(`[DELETE] Starting API call for ${item.type}: ${item._id}`);
        let res;
        if (item.type === 'Campsite') {
          res = await apiClient.delete(`/reservations/${item._id}`);
        } else if (item.type === 'Guide') {
          res = await apiClient.delete(`/guide-bookings/cancel/${item._id}`);
        } else if (item.type === 'Equipment') {
          res = await apiClient.delete(`/purchases/${item._id}`);
        }

        console.log(`[DELETE] API Response:`, res?.status);
        if (res && (res.status === 200 || res.status === 201 || res.data.message)) {
          showToast('Your booking has been cancelled successfully.');
          fetchBookings();
        } else {
          showToast('We could not cancel your booking at this time.', 'error');
        }
      } catch (error) {
        console.error('[DELETE] API Error:', error.response?.data || error.message);
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'An error occurred while deleting the booking.';
        showToast(errorMsg, 'error');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to cancel your ${item.type} booking for ${item.name}?`);
      if (confirmed) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Cancel Booking',
        `Are you sure you want to cancel your ${item.type} booking for ${item.name}?`,
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes, Cancel', style: 'destructive', onPress: performDelete }
        ]
      );
    }
  };
Line: 144


  const filteredBookings = useMemo(() => {
    return bookings.filter(item => {
      const status = item.status?.toLowerCase() || '';
      const isCompleted = status === 'completed' || status === 'paid' || status === 'rejected' || status === 'cancelled';
      return activeTab === 'completed' ? isCompleted : !isCompleted;
    });
  }, [bookings, activeTab]);

  const stats = useMemo(() => {
    const active = bookings.filter(b => {
      const s = b.status?.toLowerCase() || '';
      return s !== 'completed' && s !== 'paid' && s !== 'rejected' && s !== 'cancelled';
    }).length;
    const completed = bookings.filter(b => {
      const s = b.status?.toLowerCase() || '';
      return s === 'completed' || s === 'paid' || s === 'rejected' || s === 'cancelled';
    }).length;
    return { active, completed };
  }, [bookings]);

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('confirm') || s.includes('paid') || s.includes('complete')) return '#10b981';
    if (s.includes('pending') || s === 'confirmed') return '#f59e0b';
    if (s.includes('cancel') || s.includes('reject')) return '#ef4444';
    return '#3b82f6';
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'Campsite': return { name: 'map-marker-radius', color: '#3b82f6' };
      case 'Equipment': return { name: 'tent', color: '#10b981' };
      case 'Guide': return { name: 'compass-outline', color: '#8b5cf6' };
      default: return { name: 'calendar-check', color: '#64748b' };
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Active</Text>
            <Text style={styles.summaryValue}>{stats.active}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Completed</Text>
            <Text style={styles.summaryValue}>{stats.completed}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>Completed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item }) => {
    const categoryInfo = getCategoryIcon(item.type);
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBg, { backgroundColor: categoryInfo.color + '15' }]}>
            <MaterialCommunityIcons name={categoryInfo.name} size={24} color={categoryInfo.color} />
          </View>
          <View style={styles.mainInfo}>
            <Text style={styles.bookingType}>{item.type?.toUpperCase()}</Text>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.statusTag, { backgroundColor: statusColor + '15' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{(item.status || 'Active').toUpperCase()}</Text>
            </View>
            
            {/* Delete Button (Visible for all non-final bookings) */}
            {item.status?.toLowerCase() !== 'completed' && 
             item.status?.toLowerCase() !== 'rejected' && 
             item.status?.toLowerCase() !== 'cancelled' && (
              <TouchableOpacity 
                onPress={() => {
                  console.log("[DELETE] Clicked booking:", item._id);
                  handleDeleteBooking(item);
                }}
                style={styles.trashIcon}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={14} color="#64748b" />
              <Text style={styles.infoText}>{item.date}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="wallet-outline" size={14} color="#64748b" />
              <Text style={styles.infoText}>{item.displayAmount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          {(item.status?.toLowerCase() === 'confirmed' || 
            item.status?.toLowerCase() === 'completed' || 
            item.status?.toLowerCase() === 'paid') && (
            <TouchableOpacity 
              style={styles.reviewBtn}
              onPress={() => navigation.navigate('AddFeedback', { booking: item })}
            >
              <Ionicons name="star-outline" size={16} color={Colors.primary} />
              <Text style={styles.reviewBtnText}>Leave a Review</Text>
            </TouchableOpacity>
          )}

          {item.type === 'Guide' && item.status === 'Confirmed' && (
            <TouchableOpacity 
              style={styles.payNowBtn}
              onPress={() => {
                const paymentItem = { _id: item.guideId, name: item.guideName, profilePhoto: item.guidePhoto };
                navigation.navigate('Payment', { 
                  item: paymentItem,
                  type: 'guide',
                  mode: 'rent',
                  startDate: item.startDate,
                  endDate: item.endDate,
                  totalAmount: item.amount,
                  guests: item.numberOfGuests || 1,
                  bookingId: item._id
                });
              }}
            >
              <Text style={styles.payNowText}>Pay</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          )}


        </View>

      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSubtitle}>Manage your upcoming adventures</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your trips...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
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
                <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyTitle}>No Bookings Found</Text>
              <Text style={styles.emptySubtitle}>Ready to start your next journey? Discover amazing campsites near you.</Text>
              <TouchableOpacity 
                style={styles.exploreBtn}
                onPress={() => navigation.navigate('Main')}
              >
                <Text style={styles.exploreBtnText}>Book Your First Trip</Text>
              </TouchableOpacity>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 25,
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
  backBtn: {
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
    backgroundColor: 'rgba(22, 101, 52, 0.9)', // Forest Green Glass
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
        elevation: 10,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
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
    fontSize: 22,
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
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
      web: { boxShadow: '0px 8px 16px rgba(0,0,0,0.06)' },
      default: { elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8 }
    })
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  mainInfo: {
    flex: 1,
  },
  bookingType: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 2,
  },
  itemName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBody: {
    marginBottom: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  infoText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  reviewBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 8,
  },
  payNowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    marginLeft: 12,
  },
  payNowText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 6,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    borderRadius: 14,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ef4444',
    marginLeft: 8,
  },
  trashIcon: {
    padding: 8,
    marginLeft: 5,
    zIndex: 100,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
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
  exploreBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 18,
  },
  exploreBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerContainer: {
    backgroundColor: '#f8fafc',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  activeTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.small,
  },
  tabText: {
    fontSize: 14,
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

export default MyBookingsScreen;
