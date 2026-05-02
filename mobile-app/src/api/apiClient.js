import axios from 'axios';
import { Platform } from 'react-native';

<<<<<<< HEAD
// FOR PHYSICAL DEVICES: Replace with your machine's IP (e.g. 'http://192.168.x.x:5000')
// FOR EMULATOR: 10.0.2.2 is the alias for localhost on Android
// FOR WEB/LOCAL: localhost is generally most compatible
export const BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5000'
  : 'http://localhost:5000';
=======
// FOR PHYSICAL DEVICES: Replace with your machine's IP (e.g. 'http://192.168.1.5:5000')
// FOR EMULATOR: 10.0.2.2 is the alias for localhost
// FOR WEB: localhost works normally
export const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000'
  : 'http://172.29.146.225:5000';
>>>>>>> 01ada11721e5deb8afbcc489420db66c68a07190

const API_BASE_URL = `${BASE_URL}/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getImageUrl = (path) => {
  if (!path) return null;
  if (typeof path !== 'string') return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default apiClient;
