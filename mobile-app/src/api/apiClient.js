import axios from 'axios';
import { Platform } from 'react-native';

// FOR PHYSICAL DEVICES: Replace with your machine's IP (e.g. 'http://192.168.1.5:5000')
// FOR EMULATOR: 10.0.2.2 is the alias for localhost
// FOR WEB: localhost works normally
export const BASE_URL = 'http://172.28.4.122:5000';

const API_BASE_URL = `${BASE_URL}/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
});

export const getImageUrl = (path) => {
  if (!path) return null;
  
  // Handle case where path is an array (multi-image support)
  const imagePath = Array.isArray(path) ? path[0] : path;
  
  if (typeof imagePath !== 'string') return null;
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
  return `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

export default apiClient;
