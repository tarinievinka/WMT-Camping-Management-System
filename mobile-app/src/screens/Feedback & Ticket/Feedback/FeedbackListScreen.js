import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Colors } from '../../../theme/colors';
import apiClient from '../../../api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

import React, { useState, useCallback } from 'react';



const FeedbackListScreen = ({ navigation, isEmbedded = false }) => {

  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchFeedbacks();
    }
  }, [isFocused]);



  const fetchFeedbacks = async () => {
    try {
      const response = await apiClient.get('/feedback/display');
      // Filter feedbacks for current user if not admin
      const allData = response.data.data || [];
      if (user?.role === 'admin') {
        setFeedbacks(allData);
      } else {
        setFeedbacks(allData.filter(f => f.userId === user?._id || f.userId?._id === user?._id));
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Feedback', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/feedback/delete/${id}`);
            fetchFeedbacks();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        }
      }
    ]);
  };


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.target}>{item.targetName || 'Campsite'}</Text>
          <Text style={styles.targetType}>{item.targetType}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.star}>⭐</Text>
          <Text style={styles.rating}>{item.rating}/5</Text>
        </View>
      </View>
      <Text style={styles.comment}>"{item.comment}"</Text>
      <View style={styles.footerRow}>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
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
          <Text style={styles.subtitle}>Your shared experiences</Text>
        </View>
      )}

      {isEmbedded && (
        <View style={styles.embeddedHeader}>
          <TouchableOpacity 
            style={styles.submitBtn}
            onPress={() => navigation.navigate('Guides')} // Redirect to guides to pick someone to feedback
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
            <Text style={styles.emptyText}>No feedbacks yet.</Text>
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
    backgroundColor: Colors.white,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    elevation: 1,
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
    color: Colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef9c3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  star: {
    fontSize: 12,
    marginRight: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#854d0e',
  },
  comment: {
    fontSize: 14,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  date: {
    fontSize: 11,
    color: '#94a3b8',
  },
  targetType: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#64748b',
    fontSize: 16,
  },
  embeddedHeader: {
    padding: 15,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
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
  }
});


export default FeedbackListScreen;
