import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

const PaymentSuccessScreen = ({ route, navigation }) => {
  const { type, pending } = route.params || {};
  const scaleAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconCircle, { 
          transform: [{ scale: scaleAnim }],
          backgroundColor: pending ? '#f59e0b' : Colors.primary 
        }]}>
          <Ionicons 
            name={pending ? "time" : "checkmark-circle"} 
            size={100} 
            color={Colors.white} 
          />
        </Animated.View>

        <Text style={styles.title}>
          {type === 'guide' ? 'Request Sent' : (pending ? 'Booking Pending' : 'Payment Successful!')}
        </Text>
        <Text style={styles.subtitle}>
          {type === 'guide' 
            ? 'Your booking request has been sent to the guide. Please wait for their approval before proceeding with the payment.'
            : (pending 
                ? 'Your receipt has been uploaded. Your booking will be confirmed once the admin approves your bank slip.'
                : `Your booking for the ${type || 'campsite'} has been confirmed. A confirmation email has been sent to your registered address.`)
          }
        </Text>

        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, { color: (pending || type === 'guide') ? '#f59e0b' : Colors.primary }]}>
              {type === 'guide' ? 'Waiting for Guide' : (pending ? 'Pending Approval' : 'Confirmed')}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Transaction ID</Text>
            <Text style={styles.infoValue}>#TXN-{Math.floor(Math.random() * 1000000)}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={styles.buttonText}>Go to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Text style={styles.secondaryButtonText}>View My Bookings</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  iconCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    ...Platform.select({
      web: {
        boxShadow: `0px 10px 20px ${Colors.primary}4D`,
      },
      default: {
        elevation: 10,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 20,
    marginBottom: 40,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoLabel: {
    color: Colors.gray,
    fontSize: 14,
  },
  infoValue: {
    fontWeight: 'bold',
    color: Colors.text,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 5,
  },
  button: {
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentSuccessScreen;
