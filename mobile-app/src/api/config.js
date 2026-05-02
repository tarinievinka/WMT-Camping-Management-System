import { Platform } from 'react-native';

// FOR PHYSICAL DEVICES: Replace with your machine's IP (e.g. 'http://192.168.x.x:5000')
// FOR EMULATOR: 10.0.2.2 is the alias for localhost on Android
// FOR WEB/LOCAL: localhost is generally most compatible
export const BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:5000' 
  : 'http://localhost:5000';

export const API_URL = BASE_URL;

export default {
  BASE_URL,
  API_URL
};
