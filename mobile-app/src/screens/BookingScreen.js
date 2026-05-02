import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Pressable
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Shadows } from '../theme/shadows';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

const BookingScreen = ({ route, navigation }) => {
  const { item, type, mode } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [guests, setGuests] = useState('1');
  const [bookedDates, setBookedDates] = useState({});
  const [bookingStatus, setBookingStatus] = useState(null);

  React.useEffect(() => {
    if (type === 'campsite') {
      fetchBookedDates();
    }
  }, [item._id]);

  const fetchBookedDates = async () => {
    try {
      const response = await apiClient.get(`/reservations/campsite/${item._id}/bookeddates`);
      const bookings = response.data;
      const disabled = {};
      
      bookings.forEach(booking => {
        let start = new Date(booking.checkInDate);
        let end = new Date(booking.checkOutDate);
        while (start <= end) {
          const dateStr = start.toISOString().split('T')[0];
          disabled[dateStr] = { 
            disabled: true, 
            disableTouchEvent: true, 
            textColor: '#d1d5db',
            color: '#f1f5f9'
          };
          start.setDate(start.getDate() + 1);
        }
      });
      setBookedDates(disabled);
      setMarkedDates(disabled);
    } catch (error) {
      console.error('Error fetching booked dates:', error);
    }
  };

  const onDayPress = (day) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day.dateString);
      setEndDate('');
      setMarkedDates({
        ...bookedDates,
        [day.dateString]: { startingDay: true, color: Colors.primary, textColor: 'white' }
      });
    } else if (startDate && !endDate) {
      if (day.dateString <= startDate) {
        // Reset or update start date if user picks a date before or same as current start
        setStartDate(day.dateString);
        setMarkedDates({
          ...bookedDates,
          [day.dateString]: { startingDay: true, color: Colors.primary, textColor: 'white' }
        });
      } else {
        setEndDate(day.dateString);
        
        // Fill in the range
        let range = {};
        let start = new Date(startDate);
        let end = new Date(day.dateString);
        
        while (start <= end) {
          const dateStr = start.toISOString().split('T')[0];
          range[dateStr] = {
            color: dateStr === startDate || dateStr === day.dateString ? Colors.primary : '#e0f2f1',
            textColor: dateStr === startDate || dateStr === day.dateString ? 'white' : Colors.primary,
            startingDay: dateStr === startDate,
            endingDay: dateStr === day.dateString
          };
          start.setDate(start.getDate() + 1);
        }
        setMarkedDates({ ...bookedDates, ...range });
      }
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const getPrice = () => {
    if (type === 'campsite') return item.pricePerNight || 0;
    if (type === 'guide') return item.dailyRate || 0;
    if (type === 'equipment') {
      return mode === 'buy' ? (item.salePrice || 0) : (item.rentalPrice || 0);
    }
    return 0;
  };

  const totalDays = mode === 'buy' ? 1 : calculateDays();
  const price = getPrice();
  const subtotal = price * parseInt(guests || 1) * totalDays;
  const serviceFee = 250;

  const handleConfirmBooking = async () => {
    if (mode !== 'buy' && (!startDate || !endDate)) {
      Alert.alert('Error', 'Please enter both check-in and check-out dates');
      return;
    }

    setLoading(true);
    try {
      let endpoint = '';
      let bookingData = {};

      if (type === 'campsite') {
        endpoint = '/reservations';
        bookingData = { 
          campsite: item._id, 
          checkInDate: startDate,
          checkOutDate: endDate,
          numberOfGuests: guests,
          totalPrice: subtotal + serviceFee
        };
      } else if (type === 'guide') {
        endpoint = '/guide-bookings/add';
        bookingData = { 
          guideId: item._id, 
          guideName: item.name,
          startDate,
          endDate,
          amount: subtotal + serviceFee,
          customerName: user?.name,
          userId: user?._id,
          status: 'Pending'
        };
      } else {
        endpoint = '/purchases';
        bookingData = {
          items: [{
            equipmentId: item._id,
            name: item.name,
            quantity: parseInt(guests || 1),
            price: price
          }],
          totalPrice: subtotal + serviceFee,
          shippingAddress: mode === 'buy' ? 'Customer Address' : 'To be collected at site'
        };
      }

      const response = await apiClient.post(endpoint, bookingData);
      setLoading(false);
      
      navigation.navigate('Payment', { 
        item, 
        type, 
        mode, 
        startDate: startDate, 
        endDate: endDate, 
        totalAmount: subtotal + serviceFee,
        guests,
        bookingId: response.data._id
      });
    } catch (error) {
      setLoading(false);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to process booking.';
      console.error('Booking error:', error.response?.data || error);
      Alert.alert('Booking Failed', errorMsg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.itemCard}>
          <Text style={styles.itemType}>{type.toUpperCase()}</Text>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>Rs. {price} / {mode === 'buy' ? 'unit' : 'day'}</Text>
        </View>

        <View style={styles.form}>
          {mode !== 'buy' ? (
            <View style={styles.calendarContainer}>
              <Text style={styles.label}>Select Dates</Text>
              <Calendar
                onDayPress={onDayPress}
                markedDates={markedDates}
                markingType={'period'}
                theme={{
                  calendarBackground: '#f8fafc',
                  selectedDayBackgroundColor: Colors.primary,
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: Colors.primary,
                  dayTextColor: Colors.text,
                  textDisabledColor: '#cbd5e1',
                  monthTextColor: Colors.text,
                  indicatorColor: Colors.primary,
                  textDayFontWeight: '500',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: 'bold',
                }}
                style={styles.calendar}
              />
              <View style={styles.dateDisplay}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>Check-in</Text>
                  <Text style={styles.dateValue}>{startDate || 'Select Date'}</Text>
                </View>
                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>Check-out</Text>
                  <Text style={styles.dateValue}>{endDate || 'Select Date'}</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.buyNote}>Direct purchase - No date range required.</Text>
          )}

          <Text style={styles.label}>{type === 'equipment' && mode === 'buy' ? 'Quantity' : 'Number of Guests / Quantity'}</Text>
          <TextInput 
            style={styles.input}
            keyboardType="numeric"
            value={guests}
            onChangeText={setGuests}
          />

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {mode === 'buy' ? 'Item Price' : `Price x ${totalDays} days`}
              </Text>
              <Text style={styles.summaryValue}>Rs. {subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service Fee</Text>
              <Text style={styles.summaryValue}>Rs. {serviceFee}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>Rs. {subtotal + serviceFee}</Text>
            </View>
          </View>
        </View>

        {type === 'guide' && bookingStatus === 'pending' && (
          <View style={styles.pendingMessageContainer}>
            <Ionicons name="time-outline" size={20} color="#d97706" />
            <Text style={styles.pendingMessage}>Your request has been sent to the guide.</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[
            styles.confirmButton, 
            (loading || (type === 'guide' && bookingStatus === 'pending')) && styles.disabledButton,
            type === 'guide' && bookingStatus === 'pending' && { backgroundColor: '#fef3c7' }
          ]} 
          onPress={handleConfirmBooking}
          disabled={loading || (type === 'guide' && bookingStatus === 'pending')}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[
              styles.confirmButtonText,
              type === 'guide' && bookingStatus === 'pending' && { color: '#d97706' }
            ]}>
              {type === 'guide' ? (bookingStatus === 'pending' ? 'Booking Pending' : 'Book Now') : 'Confirm and Pay'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  itemCard: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
  },
  itemType: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 5,
  },
  itemName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    color: Colors.gray,
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  calendarContainer: {
    marginBottom: 20,
  },
  calendar: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 15,
  },
  dateDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  dateBox: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 10,
    color: Colors.gray,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flex: 1,
  },
  buyNote: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  summary: {
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: Colors.gray,
  },
  summaryValue: {
    fontWeight: '600',
    color: Colors.text,
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    ...Shadows.primary(Colors.primary),
  },
  disabledButton: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pendingMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fefce8',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#fef08a',
  },
  pendingMessage: {
    fontSize: 14,
    color: '#d97706',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default BookingScreen;
