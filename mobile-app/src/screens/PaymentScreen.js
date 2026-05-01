import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
// Import DateTimePicker dynamically for mobile only
const DateTimePicker = Platform.OS !== 'web' ? require('@react-native-community/datetimepicker').default : null;
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Shadows } from '../theme/shadows';
import { BASE_URL } from '../api/apiClient';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

const PaymentScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const { item, type, mode, startDate: rawStartDate, endDate: rawEndDate, totalAmount, guests, bookingId } = route.params;
  const startDate = new Date(rawStartDate).toISOString().split('T')[0];
  const endDate = new Date(rawEndDate).toISOString().split('T')[0];
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [receiptImage, setReceiptImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Card States
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [cvv, setCvv] = useState('');
  const [showExpiry, setShowExpiry] = useState(false);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0]);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'deposit' && !receiptImage) {
      Alert.alert('Receipt Required', 'Please upload your bank transfer receipt to continue.');
      return;
    }

    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        Alert.alert('Invalid Card', 'Card number must be 16 digits.');
        return;
      }
      if (cvv.length !== 3) {
        Alert.alert('Invalid CVV', 'CVV must be 3 digits.');
        return;
      }
    }

    setLoading(true);
    try {
      if (paymentMethod === 'deposit') {
        // Handle Bank Deposit with Receipt Upload
        const formData = new FormData();
        formData.append('bookingId', bookingId || item._id);
        formData.append('bookingType', type === 'guide' ? 'GuideBooking' : type === 'equipment' ? 'EquipmentBooking' : 'CampsiteBooking');
        formData.append('amount', totalAmount);
        formData.append('paymentMethod', 'bank-deposit');
        formData.append('userId', user?._id);
        
        if (receiptImage) {
          const uri = receiptImage.uri;
          const name = uri.split('/').pop();
          const match = /\.(\w+)$/.exec(name);
          const type = match ? `image/${match[1]}` : `image`;
          
          formData.append('receipt', { uri, name, type });
        }

        await apiClient.post('/payment/add', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setLoading(false);
        navigation.navigate('PaymentSuccess', { type, pending: true });
      } else {
        // Handle other payment methods (simulated)
        setTimeout(() => {
          setLoading(false);
          navigation.navigate('PaymentSuccess', { type, pending: false });
        }, 2000);
        return; // Exit here since we set timeout
      }
    } catch (error) {
      console.error('Payment Error:', error);
      Alert.alert('Error', 'Something went wrong during the payment process.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Procedure</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={true}
      >
        {/* Order Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <Image 
              source={{ uri: getImageUrl(item.image || item.imageUrl || item.profilePhoto || item.profileImage) || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=60' }} 
              style={styles.summaryImage}
              resizeMode="cover"
            />
            <View style={styles.summaryInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemType}>{type?.toUpperCase() || 'BOOKING'} - {mode === 'buy' ? 'PURCHASE' : 'RENTAL'}</Text>
              {mode !== 'buy' && (
                <Text style={styles.itemDates}>{startDate} to {endDate}</Text>
              )}
              <Text style={styles.itemGuests}>{guests} {type === 'equipment' ? 'Units' : 'Guests'}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>Rs. {totalAmount}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          
          {/* Card Option */}
          <TouchableOpacity 
            style={[styles.methodItem, paymentMethod === 'card' && styles.methodItemSelected]}
            onPress={() => setPaymentMethod('card')}
          >
            <View style={styles.methodLeft}>
              <View style={[styles.methodIcon, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="card" size={20} color="#2563eb" />
              </View>
              <Text style={styles.methodLabel}>Credit / Debit Card</Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'card' && styles.radioSelected]} />
          </TouchableOpacity>

          {/* Google Pay Option */}
          <TouchableOpacity 
            style={[styles.methodItem, paymentMethod === 'gpay' && styles.methodItemSelected]}
            onPress={() => setPaymentMethod('gpay')}
          >
            <View style={styles.methodLeft}>
              <View style={[styles.methodIcon, { backgroundColor: '#f8fafc' }]}>
                <FontAwesome5 name="google-pay" size={24} color="#5f6368" />
              </View>
              <Text style={styles.methodLabel}>Google Pay</Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'gpay' && styles.radioSelected]} />
          </TouchableOpacity>

          {/* Deposit Option */}
          <TouchableOpacity 
            style={[styles.methodItem, paymentMethod === 'deposit' && styles.methodItemSelected]}
            onPress={() => setPaymentMethod('deposit')}
          >
            <View style={styles.methodLeft}>
              <View style={[styles.methodIcon, { backgroundColor: '#f0fdf4' }]}>
                <MaterialCommunityIcons name="bank" size={22} color="#166534" />
              </View>
              <Text style={styles.methodLabel}>Bank Deposit</Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'deposit' && styles.radioSelected]} />
          </TouchableOpacity>
        </View>

        {/* Card Details (Show if card selected) */}
        {paymentMethod === 'card' && (
          <View style={styles.cardForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card Number</Text>
              <TextInput 
                style={styles.input}
                placeholder="XXXX XXXX XXXX XXXX"
                keyboardType="numeric"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(text.replace(/[^0-9]/g, '').substring(0, 16))}
                maxLength={16}
              />
            </View>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Expiry Date</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="month"
                    value={`${expiryDate.getFullYear()}-${(expiryDate.getMonth() + 1).toString().padStart(2, '0')}`}
                    onChange={(e) => {
                      const [y, m] = e.target.value.split('-');
                      setExpiryDate(new Date(parseInt(y), parseInt(m) - 1));
                    }}
                    style={{
                      padding: 15,
                      borderRadius: 12,
                      border: '1px solid #f1f5f9',
                      backgroundColor: '#f8fafc',
                      fontSize: 16,
                      width: '100%',
                      fontFamily: 'inherit'
                    }}
                  />
                ) : (
                  <>
                    <TouchableOpacity style={styles.input} onPress={() => setShowExpiry(true)}>
                      <Text>{(expiryDate.getMonth() + 1).toString().padStart(2, '0')}/{expiryDate.getFullYear().toString().substring(2)}</Text>
                    </TouchableOpacity>
                    {showExpiry && (
                      <DateTimePicker
                        value={expiryDate}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowExpiry(false);
                          if (selectedDate) setExpiryDate(selectedDate);
                        }}
                      />
                    )}
                  </>
                )}
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="XXX"
                  keyboardType="numeric"
                  secureTextEntry
                  value={cvv}
                  onChangeText={(text) => setCvv(text.replace(/[^0-9]/g, '').substring(0, 3))}
                  maxLength={3}
                />
              </View>
            </View>
          </View>
        )}

         {/* Deposit Info (Show if deposit selected) */}
         {paymentMethod === 'deposit' && (
           <View style={styles.depositInfo}>
             <Text style={styles.depositText}>Please transfer the total amount to:</Text>
             <View style={styles.bankDetails}>
               <Text style={styles.bankLabel}>Bank:</Text>
               <Text style={styles.bankValue}>Camping Trust Bank</Text>
               <Text style={styles.bankLabel}>Account:</Text>
               <Text style={styles.bankValue}>004-928374-123</Text>
               <Text style={styles.bankLabel}>Reference:</Text>
               <Text style={styles.bankValue}>CAMP-{Math.floor(Math.random() * 10000)}</Text>
             </View>
             
             <View style={styles.uploadSection}>
               <Text style={styles.uploadTitle}>Upload Payment Receipt</Text>
               <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                 {receiptImage ? (
                   <Image source={{ uri: receiptImage.uri }} style={styles.previewImage} />
                 ) : (
                   <View style={styles.uploadPlaceholder}>
                     <Ionicons name="cloud-upload-outline" size={32} color={Colors.primary} />
                     <Text style={styles.uploadText}>Select Receipt Image</Text>
                   </View>
                 )}
               </TouchableOpacity>
               {receiptImage && (
                 <TouchableOpacity onPress={() => setReceiptImage(null)} style={styles.removeBtn}>
                   <Text style={styles.removeText}>Remove & Re-upload</Text>
                 </TouchableOpacity>
               )}
             </View>

             <Text style={styles.depositNote}>* Your booking will remain "Pending" until the admin approves your slip.</Text>
           </View>
         )}

        <TouchableOpacity 
          style={[styles.payButton, loading && styles.disabledButton]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>
              {paymentMethod === 'deposit' ? 'Confirm Booking' : `Pay Rs. ${totalAmount}`}
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
    ...Platform.select({
      web: {
        height: '100vh',
        overflow: 'auto',
      }
    })
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
    paddingBottom: 150,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    ...Shadows.small,
  },
  summaryImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  summaryInfo: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  itemType: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  itemDates: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 2,
  },
  itemGuests: {
    fontSize: 11,
    color: Colors.gray,
  },
  priceContainer: {
    alignItems: 'flex-end',
    borderLeftWidth: 1,
    borderLeftColor: '#e2e8f0',
    paddingLeft: 15,
  },
  totalLabel: {
    fontSize: 10,
    color: Colors.gray,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  methodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  methodItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#f0fdf4',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  methodLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  radioSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  cardForm: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.gray,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  depositInfo: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
  },
  depositText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 15,
  },
  bankDetails: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bankLabel: {
    fontSize: 10,
    color: Colors.gray,
    marginTop: 5,
  },
  bankValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  depositNote: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 15,
    fontStyle: 'italic',
  },
  uploadSection: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  uploadBox: {
    height: 150,
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  removeBtn: {
    marginTop: 10,
    alignItems: 'center',
  },
  removeText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    ...Shadows.primary(Colors.primary),
  },
  disabledButton: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;
