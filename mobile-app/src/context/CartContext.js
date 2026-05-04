import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [rentalDates, setRentalDates] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem('cart');
      const storedDates = await AsyncStorage.getItem('rentalDates');
      if (storedCart) setCartItems(JSON.parse(storedCart));
      if (storedDates) setRentalDates(JSON.parse(storedDates));
    } catch (err) {
      console.error('Failed to load cart', err);
    }
  };

  const saveCart = async (newCart, newDates = rentalDates) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(newCart));
      await AsyncStorage.setItem('rentalDates', JSON.stringify(newDates));
    } catch (err) {
      console.error('Failed to save cart', err);
    }
  };

  const addToCart = (item, type, mode = 'buy', quantity = 1) => {
    const cartId = `${type}-${item._id}-${mode}`;
    
    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(i => i.cartId === cartId);
      let updatedCart;
      
      if (existingItemIndex > -1) {
        updatedCart = [...prev];
        const newQty = updatedCart[existingItemIndex].quantity + quantity;
        // Cap quantity at stock level if available
        updatedCart[existingItemIndex].quantity = item.stockQuantity !== undefined 
          ? Math.min(newQty, item.stockQuantity) 
          : newQty;
      } else {
        updatedCart = [...prev, {
          cartId,
          itemId: item._id,
          name: item.name,
          price: mode === 'buy' ? item.salePrice : item.rentalPrice,
          type,
          mode,
          quantity,
          stockQuantity: item.stockQuantity, // Store stock count
          image: item.imageUrl || item.images?.[0] || item.image
        }];
      }
      saveCart(updatedCart);
      return updatedCart;
    });
  };

  const updateQuantity = (cartId, delta) => {
    setCartItems(prev => {
      const updatedCart = prev.map(item => {
        if (item.cartId === cartId) {
          let newQty = item.quantity + delta;
          // Cap at stockQuantity if it exists, otherwise just ensure at least 1
          if (item.stockQuantity !== undefined) {
            newQty = Math.min(newQty, item.stockQuantity);
          }
          newQty = Math.max(1, newQty);
          return { ...item, quantity: newQty };
        }
        return item;
      });
      saveCart(updatedCart);
      return updatedCart;
    });
  };

  const removeFromCart = (cartId) => {
    const updatedCart = cartItems.filter(item => item.cartId !== cartId);
    setCartItems(updatedCart);
    saveCart(updatedCart);
  };

  const clearCart = () => {
    setCartItems([]);
    setRentalDates({ startDate: '', endDate: '' });
    saveCart([], { startDate: '', endDate: '' });
  };

  const updateRentalDates = (dates) => {
    setRentalDates(dates);
    saveCart(cartItems, dates);
  };

  const getCartTotal = () => {
    let days = 1;
    if (rentalDates.startDate && rentalDates.endDate) {
      const start = new Date(rentalDates.startDate);
      const end = new Date(rentalDates.endDate);
      const diffTime = Math.abs(end - start);
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    }

    return cartItems.reduce((total, item) => {
      const itemTotal = item.mode === 'rent' 
        ? item.price * item.quantity * days 
        : item.price * item.quantity;
      return total + itemTotal;
    }, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      rentalDates, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      getCartTotal, 
      updateQuantity, 
      updateRentalDates 
    }}>
      {children}
    </CartContext.Provider>
  );
};
