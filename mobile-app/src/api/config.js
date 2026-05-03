import { Platform } from 'react-native';

// FOR PHYSICAL DEVICES: Replace with your machine's IP (e.g. 'http://192.168.1.5:5000')
// FOR EMULATOR: 10.0.2.2 is the alias for localhost
// FOR WEB: localhost works normally
export const BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000' 
  : 'http://172.29.146.155:5000';

export const API_URL = BASE_URL;

export default {
  BASE_URL,
  API_URL
};
