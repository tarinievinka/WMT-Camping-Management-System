import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../theme/colors';
import Header from '../../../components/Header';
import apiClient from '../../../api/apiClient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../context/AuthContext';



const MyTicketsScreen = ({ navigation, route, isEmbedded = false, refreshSignal = null }) => {

  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    try {
      const response = await apiClient.get('/tickets/my-tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(response.data.data);

    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [token])
  );

  useEffect(() => {
    if (refreshSignal) {
      fetchTickets();
    }
  }, [refreshSignal]);

  useEffect(() => {
    if (route?.params?.refreshAt) {
      fetchTickets();
    }
  }, [route?.params?.refreshAt]);
  const getDisplayStatus = (status) => status || 'open';



  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#64748b';
      case 'open': return '#10b981';
      case 'approved': return '#059669';
      case 'rejected': return '#dc2626';
      case 'in-progress': return '#fbbf24';
      case 'closed': return '#0f172a';
      default: return '#64748b';
    }
  };


  const handleDelete = (id) => {
    console.log('[FRONTEND] Delete button pressed for ticket ID:', id);
    const ticketId = id != null ? String(id) : '';
    if (!ticketId) {
      console.error('[FRONTEND] Delete failed: Invalid ID');
      Alert.alert('Error', 'Invalid ticket.');
      return;
    }

    const performDelete = async () => {
      console.log('[FRONTEND] Proceeding with deletion of ID:', ticketId);
      try {
        const deleteUrl = `/tickets/delete/${encodeURIComponent(ticketId)}`;
        console.log('[FRONTEND] Sending DELETE request to:', deleteUrl);
        
        await apiClient.delete(deleteUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('[FRONTEND] Deletion successful on server');
        setTickets((prev) => prev.filter((ticket) => ticket._id !== id));
        Alert.alert('Deleted', 'Support ticket has been removed.');

      } catch (error) {
        console.error('[FRONTEND] Deletion error:', error?.response?.data || error.message);
        const message = error?.response?.data?.error || 'Failed to delete ticket';
        Alert.alert('Error', message);
      }
    };

    if (Platform.OS === 'web') {
      console.log('[FRONTEND] Web detected, using window.confirm');
      if (window.confirm('Are you sure you want to delete this ticket?')) {
        performDelete();
      } else {
        console.log('[FRONTEND] Delete cancelled via browser confirm');
      }
    } else {
      console.log('[FRONTEND] Mobile detected, using Alert.alert');
      Alert.alert('Delete Ticket', 'Are you sure you want to delete this ticket?', [
        { text: 'Cancel', style: 'cancel', onPress: () => console.log('[FRONTEND] Delete cancelled') },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: performDelete
        }
      ]);
    }
  };

  const renderTicket = ({ item }) => (
    <View style={styles.ticketCard}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => navigation.navigate('TicketDetails', { ticketId: item._id })}
      >
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketTitle} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(getDisplayStatus(item.status)) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(getDisplayStatus(item.status)) }]}>
              {getDisplayStatus(item.status).toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.ticketDesc} numberOfLines={2}>{item.description}</Text>

        <View style={styles.ticketFooter}>
          <View style={styles.priorityGroup}>
            <Ionicons name="flag" size={14} color={item.priority === 'high' ? '#ef4444' : '#64748b'} />
            <Text style={styles.footerText}>{item.priority.toUpperCase()} PRIORITY</Text>
          </View>
          <Text style={styles.footerText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('CreateTicket', { editTicket: item })}
        >
          <Ionicons name="create-outline" size={18} color={Colors.primary} />
          <Text style={[styles.actionText, { color: Colors.primary }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDelete(item._id)}
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
          <Text style={[styles.actionText, { color: "#ef4444" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      {!isEmbedded && <Header />}
      <View style={[styles.content, isEmbedded && { padding: 15 }]}>
        {!isEmbedded && (
          <View style={styles.pageHeader}>
            <Text style={styles.title}>My Support Tickets</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('CreateTicket')}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {isEmbedded && (
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.title}>My Tickets</Text>
              <Text style={styles.subtitle}>Track your support requests</Text>
            </View>
            <TouchableOpacity 
              style={styles.headerAddBtn}
              onPress={() => navigation.navigate('CreateTicket')}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.headerAddText}>New</Text>
            </TouchableOpacity>
          </View>
        )}


        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={tickets}
            keyExtractor={(item) => item._id}
            renderItem={renderTicket}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={Colors.primary} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="ticket-outline" size={64} color="#e2e8f0" />
                <Text style={styles.emptyTitle}>No tickets found</Text>
                <Text style={styles.emptyText}>Need help? Create a support ticket and we'll get back to you.</Text>
                <TouchableOpacity
                  style={styles.createBtn}
                  onPress={() => navigation.navigate('CreateTicket')}
                >
                  <Text style={styles.createBtnText}>Create Ticket</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  content: {
    flex: 1,
    padding: 20,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  headerAddBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  headerAddText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  ticketDesc: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  priorityGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '500',
  },
  priorityTextActive: {
    color: '#fff',
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    marginTop: 12,
    justifyContent: 'flex-end',
    gap: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 24,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  embeddedAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    gap: 8,
  },
  embeddedAddText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  }
});


export default MyTicketsScreen;
