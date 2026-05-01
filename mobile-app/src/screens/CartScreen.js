import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

const CartScreen = ({ navigation }) => {
  const { cartItems, removeFromCart, clearCart, getCartTotal } = useCart();

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigation.navigate('Payment', { 
      totalAmount: getCartTotal(),
      isCart: true 
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.type}>{item.type.toUpperCase()}</Text>
        <Text style={styles.price}>LKR {item.price}</Text>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item.id)}>
        <Ionicons name="trash-outline" size={24} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>My Cart</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cart-outline" size={80} color="#cbd5e1" />
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => navigation.navigate('Main')}
            >
              <Text style={styles.shopButtonText}>Start Exploring</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>LKR {getCartTotal()}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>Checkout Now</Text>
          </TouchableOpacity>
        </View>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  clearText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  list: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  content: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  type: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 4,
  },
  footer: {
    backgroundColor: Colors.white,
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    ...Platform.select({
      web: {
        boxShadow: '0px -5px 10px rgba(0,0,0,0.1)',
      },
      default: {
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
    }),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.textLight,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  checkoutText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#94a3b8',
    marginTop: 20,
  },
  shopButton: {
    marginTop: 30,
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});

export default CartScreen;
