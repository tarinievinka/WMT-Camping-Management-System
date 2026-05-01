import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../theme/colors';
import apiClient from '../../../api/apiClient';
import { useAuth } from '../../../context/AuthContext';

const FeedbackListScreen = ({ navigation, isEmbedded = false }) => {
  const { user, token } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const fetchFeedbacks = async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/feedback/all' : '/feedback/my-feedback';
      const response = await apiClient.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      // Alert.alert('Error', 'Failed to fetch feedbacks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchFeedbacks();
    }
  }, [isFocused]);

  const handleDelete = (id) => {
    Alert.alert('Delete Feedback', 'Are you sure you want to delete this feedback?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/feedback/delete/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            fetchFeedbacks();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete feedback');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.target}>{item.targetName || 'General Feedback'}</Text>
          <Text style={styles.targetType}>{item.targetType}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#854d0e" />
          <Text style={styles.rating}>{item.rating}/5</Text>
        </View>
      </View>
      <Text style={styles.comment}>"{item.comment || item.message}"</Text>
      <View style={styles.footerRow}>
        <Text style={styles.date}>
          {item.sessionDate ? new Date(item.sessionDate).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
        </Text>
        {user?.role !== 'admin' && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => navigation.navigate('AddFeedback', { booking: item, editMode: true })}>
              <Ionicons name="create-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item._id)}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {!isEmbedded && (
        <View style={styles.header}>
          <Text style={styles.title}>My Feedbacks</Text>
          <Text style={styles.subtitle}>Your shared adventures and reviews</Text>
        </View>
      )}

      {isEmbedded && (
        <View style={styles.embeddedHeader}>
          <TouchableOpacity 
            style={styles.submitBtn}
            onPress={() => navigation.navigate('AddFeedback')} 
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
            <Text style={styles.submitBtnText}>Share New Feedback</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={feedbacks}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbox-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>No feedbacks yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#15803d',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  target: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  targetType: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef9c3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#854d0e',
  },
  comment: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  date: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
  },
  embeddedHeader: {
    padding: 15,
  },
  submitBtn: {
    backgroundColor: '#15803d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 16,
  },
});

export default FeedbackListScreen;
