import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl, Platform, Dimensions, TextInput, Animated, StatusBar, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { getImageUrl } from '../../api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const BlogCard = ({ item, index, navigation, isBookmarked, onBookmark }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay: index * 100, useNativeDriver: true })
    ]).start();
  }, []);

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.bookmarkCard}
        onPress={() => navigation.navigate('BlogDetail', { blog: item })}
      >
        <Image source={{ uri: item.image }} style={styles.bookmarkThumb} />
        <View style={styles.bookmarkInfo}>
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{(item.category || 'General').toUpperCase()}</Text>
          </View>
          <Text style={styles.bookmarkTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.authorText}>By {item.authorName || 'Anonymous'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.closeBtn}
          onPress={() => onBookmark(item._id)}
        >
          <Ionicons 
            name={isBookmarked ? "bookmark" : "bookmark-outline"} 
            size={22} 
            color={isBookmarked ? "#065f46" : "#666"} 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CollectionCard = ({ item, isSelected, onSelect }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.collectionCard,
          isSelected && styles.collectionCardSelected
        ]}
        onPress={() => onSelect(item.name)}
      >
        <Image source={{ uri: item.image }} style={styles.collectionImage} />
        <View style={[styles.collectionOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
          <Text style={styles.collectionLabel}>
            {item.name.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const BlogListScreen = ({ navigation }) => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const { user } = useAuth();

  const scrollY = useRef(new Animated.Value(0)).current;
  const searchWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadBookmarks();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [])
  );

  const loadBookmarks = async () => {
    try {
      const stored = await AsyncStorage.getItem('blog_bookmarks');
      if (stored) setBookmarkedIds(JSON.parse(stored));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleBookmark = async (id) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to bookmark posts.');
      return;
    }
    try {
      let newBookmarks = [...bookmarkedIds];
      if (newBookmarks.includes(id)) {
        newBookmarks = newBookmarks.filter(item => item !== id);
      } else {
        newBookmarks.push(id);
      }
      setBookmarkedIds(newBookmarks);
      await AsyncStorage.setItem('blog_bookmarks', JSON.stringify(newBookmarks));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isSearchActive) {
      Animated.spring(searchWidth, { toValue: width - 40, friction: 8, tension: 40, useNativeDriver: false }).start();
    } else {
      Animated.timing(searchWidth, { toValue: 0, duration: 250, useNativeDriver: false }).start();
    }
  }, [isSearchActive]);

  const categories = [
    { name: 'All', color: '#1a1a1a', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800' },
    { name: 'Smart Gear', color: '#1e3a8a', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800' },
    { name: 'Destinations', color: '#065f46', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800' },
    { name: 'Campfire Recipes', color: '#92400e', image: 'https://images.unsplash.com/photo-1681400798468-d738a42c7faa?w=800' },
    { name: 'Eco Camping', color: '#166534', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800' },
    { name: 'Safety & Tips', color: '#3730a3', image: 'https://images.unsplash.com/photo-1600966114525-bec6bb8e5a80?w=800' }
  ];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBlogs();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [selectedCategory, searchQuery]);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/blogs`, {
        params: {
          category: selectedCategory === 'All' ? '' : selectedCategory,
          search: searchQuery
        }
      });
      setBlogs(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBlogs();
  };

  const renderBlogItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.blogCard}
      onPress={() => navigation.navigate('BlogDetail', { blog: item })}
    >
      <Image source={{ uri: getImageUrl(item.image) || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=500' }} style={styles.blogImage} />
      <View style={styles.blogContent}>
        <View style={styles.tagRow}>
          {item.tags?.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.blogTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.authorRow}>
          <Ionicons name="person-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.authorName}>{item.authorName}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.leafBox}>
            <Ionicons name="leaf" size={18} color="#065f46" />
          </View>
          <Text style={styles.headerBrand}>CAMPTRAIL 360</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => setIsSearchActive(!isSearchActive)}>
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {isSearchActive && (
        <Animated.View style={[styles.searchOverlay, { width: searchWidth }]}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search blogs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <TouchableOpacity onPress={() => { setIsSearchActive(false); setSearchQuery(''); }}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        </Animated.View>
      )}

      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBlogs(); }} />}
      >
        <Animated.View style={{
          paddingTop: 20,
          opacity: scrollY.interpolate({ inputRange: [0, 50], outputRange: [1, 0.8], extrapolate: 'clamp' }),
          transform: [{ translateY: scrollY.interpolate({ inputRange: [0, 100], outputRange: [0, -10], extrapolate: 'clamp' }) }]
        }}>
          <Text style={styles.mainHeading}>Collections</Text>
          <FlatList
            data={categories}
            renderItem={({ item }) => (
              <CollectionCard 
                item={item} 
                isSelected={selectedCategory === item.name} 
                onSelect={setSelectedCategory} 
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.name}
            contentContainerStyle={styles.horizontalGrid}
          />
        </Animated.View>

        <View style={styles.bookmarksSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'All' ? 'Latest bookmarks' : `${selectedCategory} Blogs`}
          </Text>

          {isLoading ? (
            <ActivityIndicator size="large" color="#065f46" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={blogs}
              renderItem={({ item, index }) => (
                <BlogCard 
                  item={item} 
                  index={index} 
                  navigation={navigation} 
                  isBookmarked={bookmarkedIds.includes(item._id)}
                  onBookmark={toggleBookmark}
                />
              )}
              keyExtractor={item => item._id}
              scrollEnabled={false}
              contentContainerStyle={styles.bookmarksList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="document-text-outline" size={50} color="#ccc" />
                  <Text style={styles.emptyText}>No blogs found in this collection.</Text>
                </View>
              }
            />
          )}
        </View>
        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {user && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateBlog')}>
          <Ionicons name="add" size={30} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    backgroundColor: '#065f46',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 40) + 15,
    paddingBottom: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  leafBox: { backgroundColor: '#fff', padding: 6, borderRadius: 8, marginRight: 10 },
  headerBrand: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { marginLeft: 15 },
  searchOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : (StatusBar.currentHeight || 40) + 80,
    left: 20, right: 20, zIndex: 1000,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, height: 50,
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1a1a1a', height: '100%' },
  mainHeading: { fontSize: 34, fontWeight: 'bold', color: '#1a1a1a', paddingHorizontal: 20, marginBottom: 20 },
  horizontalGrid: { paddingLeft: 20, paddingBottom: 30 },
  collectionCard: {
    width: 160, height: 160, borderRadius: 20, marginRight: 16, overflow: 'hidden',
    backgroundColor: '#f5f5f5', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  collectionCardSelected: {
    borderWidth: 4, borderColor: '#065f46', transform: [{ scale: 1.05 }],
    elevation: 12, shadowColor: '#065f46', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 12, zIndex: 10,
  },
  collectionImage: { width: '100%', height: '100%' },
  collectionOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  collectionLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1.5, textAlign: 'center', paddingHorizontal: 10 },
  bookmarksSection: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 20 },
  bookmarkCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, backgroundColor: '#fff' },
  bookmarkThumb: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#E8E8E8' },
  bookmarkInfo: { flex: 1, marginLeft: 16, paddingRight: 10 },
  tagContainer: { alignSelf: 'flex-start', backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 6 },
  tagText: { fontSize: 10, fontWeight: 'bold', color: '#6B7280' },
  bookmarkTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', lineHeight: 22, marginBottom: 2 },
  authorText: { fontSize: 12, color: '#6B7280', fontStyle: 'italic' },
  closeBtn: { padding: 5 },
  fab: {
    position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#065f46', justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, zIndex: 101,
  },
  emptyContainer: { alignItems: 'center', marginTop: 40, padding: 20 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 15, fontSize: 16 },
  bookmarksList: { paddingBottom: 20 }
});

export default BlogListScreen;
