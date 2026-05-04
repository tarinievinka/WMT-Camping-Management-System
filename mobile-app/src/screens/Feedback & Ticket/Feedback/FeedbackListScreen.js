import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../theme/colors';
import apiClient, { getImageUrl } from '../../../api/apiClient';
import { useAuth } from '../../../context/AuthContext';

const FeedbackListScreen = ({ navigation, refreshSignal }) => {
  const { user, token } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (user) fetchFeedbacks();
  }, [user, refreshSignal, activeCategory]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const query = isAdmin ? '' : `userId=${user._id || user.id}`;
      const response = await apiClient.get(`/feedback/display?${query}`);
      setFeedbacks(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter(fb => {
    if (activeCategory === 'All') return true;
    return fb.targetType === activeCategory;
  });

  const handleDelete = async (id) => {
    if (isAdmin) return;
    
    const confirmDelete = async () => {
      try {
        await apiClient.delete(`/feedback/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchFeedbacks();
      } catch (error) {
        console.error('Error deleting feedback:', error);
        const msg = error.response?.data?.error || 'Failed to delete feedback';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to delete this feedback?")) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        "Delete Feedback",
        "Are you sure you want to delete this feedback?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: confirmDelete }
        ]
      );
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.target}>{item.targetName || 'Campsite'}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.targetType || 'Campsite'}</Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.star}>⭐</Text>
          <Text style={styles.rating}>{item.rating}/5</Text>
        </View>
      </View>
      
      {isAdmin && (
        <Text style={styles.userName}>By: {item.userId?.name || item.userName || 'Anonymous User'}</Text>
      )}
      
      <Text style={styles.comment}>"{item.comment}"</Text>
      
      {item.imageUrls && item.imageUrls.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImages}>
          {item.imageUrls.map((img, i) => (
            <Image 
              key={i} 
              source={{ uri: getImageUrl(img) }} 
              style={styles.reviewImage} 
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        {!isAdmin && (
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => navigation.navigate('AddFeedback', { booking: item, editMode: true })}
            >
              <Ionicons name="create-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>

          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>{isAdmin ? 'Manage Reviews' : 'My Feedbacks'}</Text>
            <Text style={styles.subtitle}>
              {isAdmin ? 'View and monitor all community reviews' : 'Your shared experiences'}
            </Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          {['All', 'Campsite', 'Equipment', 'Guide'].map((cat) => (
            <TouchableOpacity 
              key={cat}
              style={[styles.tab, activeCategory === cat && styles.activeTab]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.tabText, activeCategory === cat && styles.activeTabText]}>
                {cat === 'All' ? 'All' : cat + 's'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredFeedbacks}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No reviews found.</Text>
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
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
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
  headerText: {
    flex: 1,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
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
  categoryBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 10,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  star: {
    fontSize: 12,
    marginRight: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400e',
  },
  comment: {
    fontSize: 14,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 12,
  },
  date: {
    fontSize: 11,
    color: '#94a3b8',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 15,
  },
  actionBtn: {
    padding: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#64748b',
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 8,
    flexWrap: 'wrap',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#fff',
  },
  reviewImages: {
    marginTop: 8,
    flexDirection: 'row',
    marginBottom: 10,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#f1f5f9',
  }
});

export default FeedbackListScreen;
