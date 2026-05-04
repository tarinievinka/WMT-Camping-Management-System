import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Alert, Platform, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';
import { useCart } from '../context/CartContext';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import apiClient, { getImageUrl } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

const CartScreen = ({ navigation }) => {
  const { cartItems, rentalDates, updateQuantity, removeFromCart, updateRentalDates, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);

  const rentalItems = cartItems.filter(item => item.mode === 'rent');
  const purchaseItems = cartItems.filter(item => item.mode === 'buy');

  const onDayPress = (day) => {
    if (!rentalDates.startDate || (rentalDates.startDate && rentalDates.endDate)) {
      updateRentalDates({ startDate: day.dateString, endDate: '' });
    } else {
      if (day.dateString <= rentalDates.startDate) {
        updateRentalDates({ startDate: day.dateString, endDate: '' });
      } else {
        updateRentalDates({ ...rentalDates, endDate: day.dateString });
        setShowCalendar(false);
      }
    }
  };

  const calculateDays = () => {
    if (!rentalDates.startDate || !rentalDates.endDate) return 1;
    const start = new Date(rentalDates.startDate);
    const end = new Date(rentalDates.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const days = calculateDays();
  const subtotal = getCartTotal();
  const serviceFee = subtotal > 0 ? 250 : 0;
  const totalAmount = subtotal + serviceFee;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    if (rentalItems.length > 0 && (!rentalDates.startDate || !rentalDates.endDate)) {
      Alert.alert('Selection Required', 'Please select rental duration dates before proceeding.');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        items: cartItems.map(item => ({
          equipmentId: item.itemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          bookingType: item.mode
        })),
        totalPrice: totalAmount,
        startDate: rentalDates.startDate || null,
        endDate: rentalDates.endDate || null,
        shippingAddress: purchaseItems.length > 0 ? 'Collect at Basecamp' : 'Reserved for pickup'
      };

      const response = await apiClient.post('/purchases', bookingData);
      
      navigation.navigate('Payment', { 
        totalAmount: totalAmount,
        bookingId: response.data._id,
        item: cartItems[0], // Simplified for Payment screen context
        type: 'equipment',
        mode: 'bulk'
      });
      
      // We don't clear cart here, only after successful payment confirmation in PaymentScreen if needed
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Failed to process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMarkedDates = () => {
    let marked = {};
    try {
      if (rentalDates?.startDate) {
        marked[rentalDates.startDate] = { startingDay: true, color: Colors.primary, textColor: 'white' };
      }
      if (rentalDates?.endDate) {
        marked[rentalDates.endDate] = { endingDay: true, color: Colors.primary, textColor: 'white' };
        
        let start = new Date(rentalDates.startDate);
        let end = new Date(rentalDates.endDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          start.setDate(start.getDate() + 1);
          while (start < end) {
            const dateStr = start.toISOString().split('T')[0];
            marked[dateStr] = { color: '#e0f2f1', textColor: Colors.primary };
            start.setDate(start.getDate() + 1);
          }
        }
      }
    } catch (err) {
      console.error('Error marking dates:', err);
    }
    return marked;
  };

  const getGearImage = (imagePath) => {
    return getImageUrl(imagePath) || 'https://images.unsplash.com/photo-1504215680045-29eee485e9be?auto=format&fit=crop&w=200&q=80';
  };

  const renderGearItem = (item) => {
    if (!item) return null;
    return (
      <View key={item.cartId} style={styles.gearCard}>
        <Image source={{ uri: getGearImage(item.image) }} style={styles.gearImage} />
        <View style={styles.gearInfo}>
          <View style={styles.gearHeader}>
            <Text style={styles.gearName}>{item.name || 'Equipment'}</Text>
            <View style={[styles.modeBadge, { backgroundColor: item.mode === 'rent' ? '#f0fdf4' : '#eff6ff' }]}>
              <Text style={[styles.modeBadgeText, { color: item.mode === 'rent' ? Colors.primary : '#2563eb' }]}>
                {(item.mode || 'buy').toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.gearCategory}>Camping Gear • {item.mode === 'rent' ? 'Fair condition' : 'Brand New'}</Text>
          <View style={styles.gearFooter}>
            <View style={styles.qtyControl}>
              <TouchableOpacity 
                onPress={() => updateQuantity(item.cartId, -1)} 
                style={[styles.qtyBtn, (item.quantity <= 1) && { opacity: 0.5 }]}
                disabled={item.quantity <= 1}
              >
                <Feather name="minus" size={14} color={(item.quantity <= 1) ? Colors.gray : Colors.text} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity || 1}</Text>
              <TouchableOpacity 
                onPress={() => updateQuantity(item.cartId, 1)} 
                style={[styles.qtyBtn, item.quantity >= item.stockQuantity && { opacity: 0.5 }]}
                disabled={item.quantity >= item.stockQuantity}
              >
                <Feather name="plus" size={14} color={item.quantity >= item.stockQuantity ? Colors.gray : Colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.gearPrice}>
              LKR {item.price || 0}
              {item.mode === 'rent' && <Text style={styles.gearUnit}>/day</Text>}
            </Text>
            <TouchableOpacity onPress={() => removeFromCart(item.cartId)} style={styles.removeBtn}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Review Your Booking</Text>
        <TouchableOpacity onPress={clearCart}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitleMain}>Booking Summary</Text>
        <Text style={styles.sectionSubtitle}>Please review your selected gear and rental duration before confirming your adventure.</Text>

        {/* Rental Duration Section */}
        {rentalItems?.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={20} color="#2563eb" />
              <Text style={styles.sectionTitle}>Rental Duration</Text>
            </View>
            
            <View style={styles.dateContainer}>
              <TouchableOpacity style={styles.dateBox} onPress={() => setShowCalendar(!showCalendar)}>
                <Text style={styles.dateLabel}>PICK UP</Text>
                <Text style={styles.dateValue}>{rentalDates?.startDate || 'Select Date'}</Text>
                <Text style={styles.dateTime}>09:00 AM</Text>
              </TouchableOpacity>
              
              <Ionicons name="arrow-forward" size={20} color="#cbd5e1" style={{ marginHorizontal: 10 }} />
              
              <TouchableOpacity style={styles.dateBox} onPress={() => setShowCalendar(!showCalendar)}>
                <Text style={styles.dateLabel}>RETURN</Text>
                <Text style={styles.dateValue}>{rentalDates?.endDate || 'Select Date'}</Text>
                <Text style={styles.dateTime}>05:00 PM</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.totalNights}>Total: {days} Nights / {days + 1} Days</Text>

            {showCalendar && (
              <View style={styles.calendarWrapper}>
                <Calendar
                  onDayPress={onDayPress}
                  markedDates={getMarkedDates()}
                  markingType={'period'}
                  theme={{
                    selectedDayBackgroundColor: Colors.primary,
                    todayTextColor: Colors.primary,
                    arrowColor: Colors.primary,
                  }}
                />
              </View>
            )}
          </View>
        )}

        {/* Selected Gear Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="briefcase-outline" size={20} color="#ef4444" />
            <Text style={styles.sectionTitle}>Selected Gear</Text>
            <Text style={styles.itemCount}>{(cartItems?.length || 0)} Item{(cartItems?.length || 0) !== 1 ? 's' : ''}</Text>
          </View>

          {cartItems?.length > 0 ? (
            cartItems.map(renderGearItem)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No items in your cart.</Text>
            </View>
          )}
        </View>

        {/* Payment Details Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={20} color="#2563eb" />
            <Text style={styles.sectionTitle}>Payment Details</Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Gear Total</Text>
            <Text style={styles.paymentValue}>LKR {subtotal}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Service Fee (Fixed)</Text>
            <Text style={styles.paymentValue}>LKR {serviceFee}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Insurance (Optional)</Text>
            <Text style={[styles.paymentValue, { color: Colors.primary }]}>LKR 0.00</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
              <Text style={styles.totalValueLarge}>LKR {totalAmount}</Text>
              {rentalItems.length > 0 && <Text style={styles.rentalNote}>Rental total for {days + 1} days</Text>}
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.payButton, (cartItems.length === 0 || loading) && styles.disabledButton]} 
            onPress={handleCheckout}
            disabled={cartItems.length === 0 || loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payButtonText}>Pay Now</Text>}
          </TouchableOpacity>
          
          <Text style={styles.termsText}>By clicking proceed, you agree to the Rental Terms & Conditions</Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  sectionTitleMain: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 25,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(0,0,0,0.05)' },
      default: { elevation: 2 }
    })
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 10,
    flex: 1,
  },
  itemCount: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  dateLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  dateTime: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  totalNights: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 5,
  },
  calendarWrapper: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 15,
  },
  gearCard: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  gearImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  gearInfo: {
    flex: 1,
    marginLeft: 15,
  },
  gearHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gearName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modeBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  gearCategory: {
    fontSize: 12,
    color: '#64748b',
    marginVertical: 4,
  },
  gearFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 2,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginHorizontal: 12,
    color: Colors.text,
  },
  gearPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  gearUnit: {
    fontSize: 10,
    fontWeight: 'normal',
    color: '#94a3b8',
  },
  removeBtn: {
    padding: 5,
  },
  removeText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 15,
  },
  totalRow: {
    marginBottom: 25,
  },
  totalLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  totalValueLarge: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  rentalNote: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  payButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  termsText: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: '#94a3b8',
  }
});

export default CartScreen;
