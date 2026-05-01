import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';

import { LogBox, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Ignore non-critical library warnings from react-native-web/react-navigation
LogBox.ignoreLogs([
  'props.pointerEvents is deprecated',
  'Blocked aria-hidden on an element',
  'shadow* style props are deprecated'
]);

// Aggressive suppression for Web console to hide library-level deprecations
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root, [data-reactroot] {
      height: 100% !important;
      overflow: auto !important;
      display: flex !important;
      flex-direction: column !important;
    }
    #root > div {
      flex: 1 !important;
      display: flex !important;
      flex-direction: column !important;
    }
  `;
  document.head.appendChild(style);

  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      args[0] && 
      typeof args[0] === 'string' && 
      (args[0].includes('pointerEvents') || 
       args[0].includes('aria-hidden') || 
       args[0].includes('shadow*') ||
       args[0].includes('Intervention'))
    ) {
      return;
    }
    originalWarn(...args);
  };
  
  // Also suppress console.error for the same aria-hidden issue which sometimes logs as error
  const originalError = console.error;
  console.error = (...args) => {
    if (
      args[0] && 
      typeof args[0] === 'string' && 
      (args[0].includes('aria-hidden') || args[0].includes('retained focus'))
    ) {
      return;
    }
    originalError(...args);
  };
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
