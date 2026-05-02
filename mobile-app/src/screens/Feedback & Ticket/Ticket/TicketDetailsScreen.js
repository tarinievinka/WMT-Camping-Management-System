import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../theme/colors';
import Header from '../../../components/Header';
import apiClient from '../../../api/apiClient';
import { useAuth } from '../../../context/AuthContext';

const TicketDetailsScreen = ({ route, navigation }) => {
  const { ticketId } = route.params;
  const { user, token } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [adminReply, setAdminReply] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const fetchTicketDetails = async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/tickets/all' : '/tickets/my-tickets';
      const response = await apiClient.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const found = response.data.data.find(t => t._id === ticketId);
      setTicket(found);

    } catch (error) {
      console.error('Error fetching ticket details:', error);
      Alert.alert('Error', 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const handleStatusUpdate = async (status) => {
    if (status === 'approved' || status === 'rejected') {
      setNewStatus(status);
      setAdminReply(ticket.adminReply || '');
      setReplyModalVisible(true);
      return;
    }

    setUpdating(true);
    try {
      await apiClient.put(`/tickets/update/${ticketId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Success', `Ticket status updated to ${status}`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAdminReplySubmit = async () => {
    if (!adminReply) {
      Alert.alert('Error', 'Please provide a reply/note');
      return;
    }

    setUpdating(true);
    try {
      await apiClient.put(`/tickets/admin/reply/${ticketId}`, {
        status: newStatus,
        adminReply
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('Success', `Ticket ${newStatus} successfully`);
      setReplyModalVisible(false);
      navigation.goBack();
    } catch (error) {
      const message = error?.response?.data?.error || 'Failed to update ticket';
      Alert.alert('Error', message);
    } finally {
      setUpdating(false);
    }
  };

  const displayStatus = ticket?.status || 'open';


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.center}>
        <Text>Ticket not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: Colors.primary, marginTop: 10 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Ticket Details</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.ticketTitle}>{ticket.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(displayStatus) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(displayStatus) }]}>
                {displayStatus.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Priority</Text>
              <Text style={[styles.metaValue, { color: ticket.priority === 'high' ? '#ef4444' : Colors.text }]}>
                {ticket.priority.toUpperCase()}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Created On</Text>
              <Text style={styles.metaValue}>{new Date(ticket.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{ticket.description}</Text>

          {ticket.adminReply && (
            <>
              <View style={styles.divider} />
              <View style={styles.adminReplyCard}>
                <Text style={styles.sectionLabel}>Admin Response</Text>
                <Text style={styles.adminReplyText}>{ticket.adminReply}</Text>
              </View>
            </>
          )}


          {ticket.createdBy && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>User Information</Text>
              <Text style={styles.userInfo}>{ticket.createdBy.name}</Text>
              <Text style={styles.userEmail}>{ticket.createdBy.email}</Text>
            </>
          )}
        </View>


        {user.role === 'admin' && ticket.status !== 'approved' && ticket.status !== 'rejected' && (
          <View style={styles.adminActions}>
            <Text style={styles.sectionLabel}>Update Status</Text>
            <View style={styles.statusButtons}>
              {['open', 'in-progress', 'approved', 'rejected', 'closed'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusBtn,
                    ticket.status === s && styles.statusBtnActive,
                    updating && styles.disabledBtn,
                    (s === 'approved' || s === 'rejected') && { borderColor: s === 'approved' ? '#84cc16' : '#ef4444' }
                  ]}
                  onPress={() => handleStatusUpdate(s)}
                  disabled={updating || ticket.status === s}
                >
                  <Text style={[
                    styles.statusBtnText, 
                    ticket.status === s && styles.statusBtnTextActive,
                    (s === 'approved' || s === 'rejected') && { color: ticket.status === s ? '#fff' : (s === 'approved' ? '#84cc16' : '#ef4444') }
                  ]}>
                    {s.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={replyModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Admin Reply & {newStatus.toUpperCase()}</Text>
            <Text style={styles.modalSubtitle}>Ticket: {ticket?.title}</Text>
            
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
                onPress={handleAdminReplySubmit}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    marginRight: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.gray,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
  },
  userInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 2,
  },
  adminReplyCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#84cc16',
  },
  adminReplyText: {
    fontSize: 15,
    color: Colors.text,
    fontStyle: 'italic',
  },
  adminActions: {

    marginTop: 30,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statusBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.gray,
  },
  statusBtnTextActive: {
    color: '#fff',
  },
  disabledBtn: {
    opacity: 0.5,
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

export default TicketDetailsScreen;
