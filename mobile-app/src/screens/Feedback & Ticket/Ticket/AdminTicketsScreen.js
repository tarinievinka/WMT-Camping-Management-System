import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
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


const AdminTicketsScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    try {
      const response = await apiClient.get('/tickets/all', {
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
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#10b981';
      case 'in-progress': return '#fbbf24';
      case 'closed': return '#64748b';
      default: return Colors.gray;
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Ticket', 'Are you sure you want to delete this ticket?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/tickets/delete/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            fetchTickets();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete ticket');
          }
        }

      }
    ]);
  };

  const renderTicket = ({ item }) => (
    <View style={styles.ticketCard}>
      <TouchableOpacity
        style={styles.ticketContent}
        onPress={() => navigation.navigate('TicketDetails', { ticketId: item._id })}
      >
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketTitle} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.userText}>By: {item.createdBy?.name || 'Unknown'}</Text>
        <Text style={styles.ticketDesc} numberOfLines={2}>{item.description}</Text>

        <View style={styles.ticketFooter}>
          <View style={styles.priorityGroup}>
            <Ionicons name="flag" size={14} color={item.priority === 'high' ? '#ef4444' : '#64748b'} />
            <Text style={styles.footerText}>{item.priority.toUpperCase()}</Text>
          </View>
          <Text style={styles.footerText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDelete(item._id)}
      >
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.title}>All Support Tickets</Text>

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
                <Text style={styles.emptyTitle}>No tickets to manage</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  ticketContent: {
    flex: 1,
    padding: 16,
  },
  deleteBtn: {
    padding: 16,
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#f1f5f9',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 10,
  },
  userText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 8,
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 20,
  }
});

export default AdminTicketsScreen;
