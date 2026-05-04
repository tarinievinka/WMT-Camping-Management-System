import { Platform } from 'react-native';

// FOR PHYSICAL DEVICES: Replace with your machine's IP (e.g. 'http://192.168.1.5:5000')
// FOR EMULATOR: 10.0.2.2 is the alias for localhost
// FOR WEB: localhost works normally
<<<<<<< HEAD
export const BASE_URL = 'http://172.28.4.122:5000';
=======
export const BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000' 
  : 'http://172.29.146.225:5000';
>>>>>>> 62f5f3323d328e9d8b5095180a339c2fe359b4b9

export const API_URL = BASE_URL;

export default {
  BASE_URL,
  API_URL
};
