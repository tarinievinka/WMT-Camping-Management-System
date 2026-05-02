import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image, Platform, Animated, TouchableWithoutFeedback } from 'react-native';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { Ionicons } from '@expo/vector-icons';

const ManageBlogsScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchBlogs();
    }, [])
  );

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/blogs`);
      setBlogs(response.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch blogs');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBlog = (id) => {
    const executeDelete = async () => {
      try {
        await axios.delete(`${API_URL}/api/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBlogs(prevBlogs => prevBlogs.filter(b => b._id !== id));
        if (Platform.OS === 'web') {
          window.alert('Blog deleted successfully');
        } else {
          Alert.alert('Success', 'Blog deleted successfully');
        }
      } catch (err) {
        if (Platform.OS === 'web') {
          window.alert('Failed to delete blog');
        } else {
          Alert.alert('Error', 'Failed to delete blog');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this blog?')) {
        executeDelete();
      }
    } else {
      Alert.alert(
        'Delete Blog',
        'Are you sure you want to delete this blog?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: executeDelete
          }
        ]
      );
    }
  };

  const AnimatedBlogCard = ({ item }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [isPressed, setIsPressed] = useState(false);

    const handlePressIn = () => {
      setIsPressed(true);
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 20,
      }).start();
    };

    const handlePressOut = () => {
      setIsPressed(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 12,
      }).start();
    };

    return (
      <TouchableWithoutFeedback 
        onPress={() => navigation.navigate('BlogDetail', { blog: item })}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View 
          style={[
            styles.card, 
            { transform: [{ scale: scaleAnim }] },
            isPressed && { borderColor: Colors.primary }
          ]}
        >
          <View style={styles.cardImageContainer}>
            <Image source={{ uri: item.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=60' }} style={styles.cardImage} />
            <View style={styles.cardCategoryBadge}>
              <Text style={styles.cardCategoryText}>{item.category || 'General'}</Text>
            </View>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.cardMeta}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.cardSubtitle}>By {item.authorName}</Text>
                {item.authorRole === 'admin' && (
                  <View style={styles.adminBadge}>
                    <Ionicons name="shield-checkmark" size={10} color={Colors.white} />
                    <Text style={styles.adminBadgeText}>Added by Admin</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('CreateBlog', { blog: item })}
            >
              <Ionicons name="pencil" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => deleteBlog(item._id)}
            >
              <Ionicons name="trash" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  const renderItem = ({ item }) => <AnimatedBlogCard item={item} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={'#0f172a'} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Blogs</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateBlog')}>
          <Ionicons name="add" size={20} color={Colors.white} />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={blogs}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No blogs found.</Text>}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 10,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  backBtn: {
    padding: 5,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnText: {
    color: Colors.white,
    fontWeight: 'bold',
    marginLeft: 2,
    fontSize: 14,
  },
  list: {
    padding: 20,
  },
  card: {
    flexDirection: 'column',
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardCategoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  cardCategoryText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    lineHeight: 24,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  adminBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  cardDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  actions: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  actionButton: {
    padding: 8,
    marginHorizontal: 2,
    backgroundColor: Colors.white,
    borderRadius: 15,
  },
  loader: {
    marginTop: 50,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: Colors.textLight,
  },
});

export default ManageBlogsScreen;
