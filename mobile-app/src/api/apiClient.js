import axios from 'axios';
import { Platform } from 'react-native';

// FOR PHYSICAL DEVICES: Replace with your machine's IP (e.g. 'http://192.168.1.5:5000/api')
// FOR EMULATOR: 10.0.2.2 is the alias for localhost
// FOR WEB: localhost works normally
<<<<<<< HEAD
export const BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:5000' 
  : 'http://127.0.0.1:5000';
=======
export const BASE_URL = 'http://172.28.21.64:5000';
>>>>>>> f2ca66c5d095caae7da6519b6f3697a2aa8ded8d

const API_BASE_URL = `${BASE_URL}/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default apiClient;
