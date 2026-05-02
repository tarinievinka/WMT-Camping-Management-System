import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import Header from '../components/Header';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

const MyBookingsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // Fetch Campsite Bookings
      const resRes = await apiClient.get('/reservations/myreservations');
      const campData = resRes.data.map(item => ({
        ...item,
        type: 'Campsite',
        name: item.campsite?.name || 'Campsite Booking',
        date: new Date(item.checkInDate).toLocaleDateString(),
        displayAmount: `Rs. ${item.totalPrice}`,
        status: item.status
      }));

      // Fetch Guide Bookings
      const guideRes = await apiClient.get('/guide-bookings/my-customer-bookings');
      const guideData = guideRes.data.map(item => ({
          ...item,
          type: 'Guide',
          name: item.guideName || 'Guide Booking',
<<<<<<< HEAD
          date: item.startDate ? new Date(item.startDate).toLocaleDateString() : 'No date',
          amount: `Rs. ${item.amount}`,
=======
          date: new Date(item.startDate).toLocaleDateString(),
          displayAmount: `Rs. ${item.amount}`,
>>>>>>> f2ca66c5d095caae7da6519b6f3697a2aa8ded8d
          status: item.status
        }));

      setBookings([...campData, ...guideData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.itemName}>{item.name || item.campsiteId?.name || 'Booking'}</Text>
          <Text style={styles.itemType}>{item.type || 'Reservation'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Completed' ? '#f0fdf4' : '#eff6ff' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Completed' ? Colors.primary : '#2563eb' }]}>
            {item.status || 'Active'}
          </Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Ionicons name="calendar-outline" size={14} color={Colors.gray} />
          <Text style={styles.detailText}>{item.date || new Date(item.startDate).toLocaleDateString()}</Text>
        </View>
        <View style={styles.detail}>
          <Ionicons name="wallet-outline" size={14} color={Colors.gray} />
          <Text style={styles.detailText}>{item.displayAmount || `Rs. ${item.totalPrice || item.amount}`}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.feedbackBtn}
          onPress={() => navigation.navigate('AddFeedback', { booking: item })}
        >
          <Ionicons name="star-outline" size={16} color={Colors.primary} />
          <Text style={styles.feedbackBtnText}>Review</Text>
        </TouchableOpacity>

        {item.type === 'Guide' && (item.status?.toLowerCase() === 'confirmed' || item.status?.toLowerCase() === 'pending') && (
          <TouchableOpacity 
            style={[styles.feedbackBtn, { backgroundColor: Colors.primary, borderColor: Colors.primary, marginLeft: 10, flex: 2 }]}
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
            <Ionicons name="card-outline" size={16} color="#fff" />
            <Text style={[styles.feedbackBtnText, { color: '#fff' }]}>Pay Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>My Bookings</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={bookings}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No bookings found.</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  itemType: {
    fontSize: 12,
    color: Colors.gray,
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
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  detailText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 6,
  },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  feedbackBtnText: {
    marginLeft: 8,
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: Colors.gray,
    fontSize: 16,
  }
});

export default MyBookingsScreen;
