import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

const NotificationsScreen = ({ navigation }) => {
  const { user, fetchUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    if (!user || !user.email) return;
    try {
      const res = await apiClient.get(`/customer-notifications/user/${user.email}`);
      setNotifications(res.data);
      fetchUnreadCount(); // Update global count
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id) => {
    try {
      await apiClient.patch(`/customer-notifications/read/${id}`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      fetchUnreadCount(); // Update global count
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const renderItem = ({ item }) => {
    const isPositive = 
      item.title.includes('Success') || 
      item.title.includes('Approved') || 
      item.title.includes('Confirmed') || 
      item.title.includes('Completed') || 
      item.title.includes('Paid');

    return (
      <TouchableOpacity 
        style={[styles.card, !item.read && styles.unreadCard]} 
        onPress={() => markAsRead(item._id)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.iconBg, { backgroundColor: isPositive ? '#ecfdf5' : '#fef2f2' }]}>
            <Ionicons 
              name={isPositive ? "checkmark-circle" : "alert-circle"} 
              size={24} 
              color={isPositive ? '#10b981' : '#ef4444'} 
            />
          </View>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.body}>{item.body}</Text>
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>Stay updated with your bookings</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={48} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyTitle}>No Notifications Yet</Text>
              <Text style={styles.emptySubtitle}>We'll notify you here when your booking status updates.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 25,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  unreadCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#dcfce7',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  time: {
    fontSize: 11,
    color: '#94a3b8',
    marginLeft: 8,
  },
  body: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 80,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;
