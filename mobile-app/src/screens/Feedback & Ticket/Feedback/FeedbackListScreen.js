import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Colors } from '../../../theme/colors';
import apiClient from '../../../api/apiClient';

const FeedbackListScreen = ({ navigation }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await apiClient.get('/feedback/display');
      setFeedbacks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.target}>{item.targetName || 'Campsite'}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.star}>⭐</Text>
          <Text style={styles.rating}>{item.rating}/5</Text>
        </View>
      </View>
      <Text style={styles.comment}>"{item.comment}"</Text>
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Feedbacks</Text>
        <Text style={styles.subtitle}>Your shared experiences</Text>
      </View>

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
    backgroundColor: '#f8fafc',
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
    marginTop: 12,
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#64748b',
    fontSize: 16,
  }
});

export default FeedbackListScreen;
