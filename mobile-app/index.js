// Suppress noisy library warnings before any modules evaluate
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

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
