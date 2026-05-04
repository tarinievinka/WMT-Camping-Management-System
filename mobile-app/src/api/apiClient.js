import axios from 'axios';
import { Platform } from 'react-native';

// FOR PHYSICAL DEVICES: Replace with your machine's IP (e.g. 'http://192.168.1.5:5000')
// FOR EMULATOR: 10.0.2.2 is the alias for localhost
// FOR WEB: localhost works normally
<<<<<<< HEAD
export const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000'
  : 'http://192.168.1.8:5000';
=======
export const BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000' 
  : 'http://172.29.146.155:5000';
>>>>>>> fc79bfabdd368186735bbd07a72c60072eb1e5d4

const API_BASE_URL = `${BASE_URL}/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,

  headers: {
    'Accept': 'application/json',
  },
});

export const getImageUrl = (path) => {
  if (!path) return null;
  if (typeof path !== 'string') return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default apiClient;
