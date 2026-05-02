import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl, Platform, Dimensions, SafeAreaView, TextInput, Animated } from 'react-native';
import { Colors } from '../../theme/colors';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const BlogCard = ({ item, index, navigation }) => {
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
        <View style={styles.closeBtn}>
          <Ionicons name="bookmark-outline" size={22} color="#666" />
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
  const { user } = useAuth();

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const searchWidth = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for search icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (isSearchActive) {
      Animated.spring(searchWidth, {
        toValue: width - 40,
        friction: 8,
        tension: 40,
        useNativeDriver: false
      }).start();
    } else {
      Animated.timing(searchWidth, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false
      }).start();
    }
  }, [isSearchActive]);

  // Mapping categories to specific styles and images
  const categories = [
    { name: 'All', color: '#1a1a1a', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400' },
    { name: 'Smart Gear', color: '#1e3a8a', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400' },
    { name: 'Destinations', color: '#065f46', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400' },
    { name: 'Campfire Recipes', color: '#92400e', image: 'https://images.unsplash.com/photo-1523906630133-f753f0607440?w=400' },
    { name: 'Eco Camping', color: '#166534', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400' },
    { name: 'Safety & Tips', color: '#3730a3', image: 'https://images.unsplash.com/photo-1533675114185-f25417f607bb?w=400' }
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

  const renderCollectionCard = ({ item }) => (
    <TouchableOpacity
      style={styles.collectionCard}
      onPress={() => setSelectedCategory(item.name)}
    >
      <Image source={{ uri: item.image }} style={styles.collectionImage} />
      <View style={[styles.collectionOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
        <Text style={styles.collectionLabel}>{item.name.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        {isSearchActive ? (
          <Animated.View style={[styles.searchContainer, { width: searchWidth }]}>
            <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search blogs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => {
              setIsSearchActive(false);
              setSearchQuery('');
            }}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="menu-outline" size={30} color="#1a1a1a" />
            </TouchableOpacity>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => setIsSearchActive(true)}
              >
                <Ionicons name="search-outline" size={26} color="#1a1a1a" />
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Animated.View style={{
          opacity: scrollY.interpolate({
            inputRange: [0, 50],
            outputRange: [1, 0.8],
            extrapolate: 'clamp'
          }),
          transform: [{
            translateY: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [0, -10],
              extrapolate: 'clamp'
            })
          }]
        }}>
          <Text style={styles.mainHeading}>Collections</Text>

          {/* Horizontal Collections Grid */}
          <FlatList
            data={categories}
            renderItem={renderCollectionCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.name}
            contentContainerStyle={styles.horizontalGrid}
          />
        </Animated.View>

        <View style={styles.bookmarksSection}>
          <Text style={styles.sectionTitle}>Latest bookmarks</Text>

          {isLoading ? (
            <ActivityIndicator size="large" color="#1a1a1a" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={blogs}
              renderItem={({ item, index }) => (
                <BlogCard item={item} index={index} navigation={navigation} />
              )}
              keyExtractor={item => item._id}
              scrollEnabled={false}
              contentContainerStyle={styles.bookmarksList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="document-text-outline" size={50} color="#ccc" />
                  <Text style={styles.emptyText}>No blogs found in this collection.</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={fetchBlogs}>
                    <Text style={styles.retryText}>Retry Connection</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          )}
        </View>
        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* FAB for creation (Admin/Auth users) */}
      {user && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateBlog')}
        >
          <Ionicons name="add" size={30} color="#FFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: Platform.OS === 'android' ? 30 : 0,
  },
  headerBtn: {
    padding: 5,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
    marginHorizontal: 5,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    height: '100%',
  },
  mainHeading: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  horizontalGrid: {
    paddingLeft: 20,
    paddingBottom: 30,
  },
  collectionCard: {
    width: 160,
    height: 160,
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  collectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  bookmarksSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#444',
    marginBottom: 20,
  },
  bookmarkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  bookmarkThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E8E8E8',
  },
  bookmarkInfo: {
    flex: 1,
    marginLeft: 16,
    paddingRight: 10,
  },
  tagContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 2,
  },
  authorText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  closeBtn: {
    padding: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 101,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 15,
    fontSize: 16,
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  bookmarksList: {
    paddingBottom: 20,
  }
});

export default BlogListScreen;
