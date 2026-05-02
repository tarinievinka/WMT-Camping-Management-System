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
  Alert,
  Modal,
  TextInput
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
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const [newStatus, setNewStatus] = useState('');


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
      case 'approved': return '#84cc16';
      case 'rejected': return '#ef4444';
      case 'in-progress': return '#fbbf24';
      case 'closed': return '#64748b';
      case 'pending': return '#64748b';
      default: return Colors.gray;
    }
  };

  const handleAdminAction = async () => {
    if (!adminReply) {
      Alert.alert('Error', 'Please provide a reply/note');
      return;
    }

    try {
      const response = await apiClient.put(`/tickets/admin/reply/${selectedTicket._id}`, {
        status: newStatus,
        adminReply
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTickets((prev) =>
        prev.map((ticket) => (ticket._id === selectedTicket._id ? response.data.data : ticket))
      );
      Alert.alert('Success', `Ticket ${newStatus} successfully`);
      setReplyModalVisible(false);
      setAdminReply('');
    } catch (error) {
      const message = error?.response?.data?.error || 'Failed to update ticket';
      Alert.alert('Error', message);
    }
  };

  const openReplyModal = (ticket, status) => {
    setSelectedTicket(ticket);
    setNewStatus(status);
    setAdminReply(ticket.adminReply || '');
    setReplyModalVisible(true);
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
            setTickets((prev) => prev.filter((ticket) => ticket._id !== id));
          } catch (error) {
            const message = error?.response?.data?.error || 'Failed to delete ticket';
            Alert.alert('Error', message);
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

        <View style={styles.adminActionRow}>
          <TouchableOpacity 
            style={[styles.adminBtn, { backgroundColor: '#84cc16' }]}
            onPress={() => openReplyModal(item, 'approved')}
          >
            <Text style={styles.adminBtnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.adminBtn, { backgroundColor: '#ef4444' }]}
            onPress={() => openReplyModal(item, 'rejected')}
          >
            <Text style={styles.adminBtnText}>Reject</Text>
          </TouchableOpacity>
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

      <Modal
        visible={replyModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Admin Reply & {newStatus.toUpperCase()}</Text>
            <Text style={styles.modalSubtitle}>Ticket: {selectedTicket?.title}</Text>
            
            <TextInput
              style={styles.replyInput}
              placeholder="Enter your reply or reason..."
              multiline
              numberOfLines={4}
              value={adminReply}
              onChangeText={setAdminReply}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelBtn}
                onPress={() => setReplyModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmBtn, { backgroundColor: newStatus === 'approved' ? '#84cc16' : '#ef4444' }]}
                onPress={handleAdminAction}
              >
                <Text style={styles.confirmBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  adminActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  adminBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  adminBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 20,
  },
  replyInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 120,
    textAlignVertical: 'top',
    fontSize: 15,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: Colors.gray,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});


export default AdminTicketsScreen;
