import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image, Platform, Animated, TouchableWithoutFeedback, StatusBar } from 'react-native';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from '../../api/apiClient';


const ManageBlogsScreen = ({ navigation }) => {
  const { token, user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my'); // 'my' or 'user'
  
  const [refreshing, setRefreshing] = useState(false);
  const tabAnim = useRef(new Animated.Value(0)).current;

  const fetchBlogs = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setIsLoading(true);
    
    try {
      const response = await axios.get(`${API_URL}/api/blogs?t=${Date.now()}`); // Cache busting
      setBlogs(response.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch blogs');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBlogs();
    }, [])
  );

  useEffect(() => {
    Animated.spring(tabAnim, {
      toValue: activeTab === 'my' ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
      tension: 50
    }).start();
  }, [activeTab]);

  const deleteBlog = (id) => {
    const executeDelete = async () => {
      try {
        await axios.delete(`${API_URL}/api/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBlogs(prevBlogs => prevBlogs.filter(b => b._id !== id));
        const successMsg = 'Blog deleted successfully';
        if (Platform.OS === 'web') window.alert(successMsg);
        else Alert.alert('Success', successMsg);
      } catch (err) {
        const errorMsg = 'Failed to delete blog';
        if (Platform.OS === 'web') window.alert(errorMsg);
        else Alert.alert('Error', errorMsg);
      }
    };

    const confirmMsg = 'Are you sure you want to delete this blog?';
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) executeDelete();
    } else {
      Alert.alert('Delete Blog', confirmMsg, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: executeDelete }
      ]);
    }
  };

  const myBlogs = blogs.filter(b => (b.author?._id || b.author) === (user?._id || user?.id));
  const userBlogs = blogs.filter(b => (b.author?._id || b.author) !== (user?._id || user?.id));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={'#0f172a'} />
          </TouchableOpacity>
          <Text style={styles.title}>Manage Blogs</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateBlog')}>
            <Ionicons name="add" size={20} color={Colors.white} />
            <Text style={styles.addBtnText}>New</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('my')}>
            <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>My Blogs</Text>
            {myBlogs.length > 0 && <View style={styles.countBadge}><Text style={styles.countText}>{myBlogs.length}</Text></View>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('user')}>
            <Text style={[styles.tabText, activeTab === 'user' && styles.tabTextActive]}>User Blogs</Text>
            {userBlogs.length > 0 && <View style={[styles.countBadge, {backgroundColor: '#64748b'}]}><Text style={styles.countText}>{userBlogs.length}</Text></View>}
          </TouchableOpacity>
          <Animated.View style={[styles.tabIndicator, { 
            left: tabAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '50%'] }) 
          }]} />
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={activeTab === 'my' ? myBlogs : userBlogs}
          renderItem={({ item }) => <BlogCard item={item} user={user} navigation={navigation} onDelete={deleteBlog} />}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => fetchBlogs(true)}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="documents-outline" size={60} color="#cbd5e1" />
              <Text style={styles.empty}>No blogs found in this category.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const BlogCard = ({ item, user, navigation, onDelete }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isOwner = (item.author?._id || item.author) === (user?._id || user?.id);

  return (
    <TouchableWithoutFeedback onPress={() => navigation.navigate('BlogDetail', { blog: item })}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.cardImageContainer}>
          <Image 
            source={{ uri: getImageUrl(item.images && item.images.length > 0 ? item.images[0] : item.image) || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400' }} 
            style={styles.cardImage} 
          />

          <View style={styles.cardCategoryBadge}>
            <Text style={styles.cardCategoryText}>{item.category || 'General'}</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.cardMeta}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.cardSubtitle}>By {item.authorName}</Text>
              {isOwner && (
                <View style={styles.adminBadge}>
                  <Ionicons name="shield-checkmark" size={10} color={Colors.white} />
                  <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>
        
        {isOwner && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('CreateBlog', { blog: item })}>
              <Ionicons name="pencil" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => onDelete(item._id)}>
              <Ionicons name="trash" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '900', color: '#0f172a', letterSpacing: 0.5 },
  backBtn: { padding: 5 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: Colors.white, fontWeight: 'bold', marginLeft: 2, fontSize: 14 },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
    position: 'relative',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabText: { fontSize: 15, fontWeight: '700', color: '#94a3b8' },
  tabTextActive: { color: Colors.primary },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '40%',
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 3,
    marginHorizontal: '5%',
  },
  countBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  countText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  list: { padding: 20 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardImageContainer: { position: 'relative' },
  cardImage: { width: '100%', height: 160 },
  cardCategoryBadge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  cardCategoryText: { color: Colors.white, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  cardContent: { padding: 15 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardSubtitle: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  adminBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary,
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 8, marginLeft: 6,
  },
  adminBadgeText: { color: Colors.white, fontSize: 8, fontWeight: 'bold', marginLeft: 2 },
  cardDate: { fontSize: 11, color: '#94a3b8' },
  actions: {
    position: 'absolute', top: 10, right: 10,
    flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 15, padding: 4,
  },
  actionButton: { padding: 6, marginHorizontal: 2, backgroundColor: Colors.white, borderRadius: 12 },
  loader: { marginTop: 50 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  empty: { textAlign: 'center', marginTop: 15, color: '#94a3b8', fontSize: 16 },
});

export default ManageBlogsScreen;
