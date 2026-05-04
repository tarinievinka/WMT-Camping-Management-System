import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add an interceptor to handle 401 Unauthorized errors
    const interceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.log('[AUTH] 401 Unauthorized detected, logging out...');
          await logout();
        }
        return Promise.reject(error);
      }
    );

    // Load stored user data on app start
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('token');
        
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          // Set default authorization header
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/login', { email, password });
      const { token, user: userData } = response.data;

      // Persist data
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // Update state
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      setToken(token);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await apiClient.post('/register', { 
        name, 
        email, 
        password,
        role: 'camper'
      });
      const { token, user: userData } = response.data;

      // Persist data
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // Update state
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      setToken(token);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let interval;
    if (user && user.email) {
      fetchUnreadCount();
      interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
    } else {
      setUnreadCount(0);
    }
    return () => clearInterval(interval);
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user || !user.email) return;
    try {
      const res = await apiClient.get(`/customer-notifications/user/${user.email}`);
      const unread = res.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('[AUTH] Failed to fetch unread count:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      delete apiClient.defaults.headers.common['Authorization'];
      setUser(null);
      setToken(null);
      setUnreadCount(0);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, isLoading, unreadCount, fetchUnreadCount, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
