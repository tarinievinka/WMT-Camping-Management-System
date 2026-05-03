import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ScrollView, 
  ActivityIndicator, 
  FlatList, 
  Platform, 
  StatusBar 
=======
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Platform,
  StatusBar
>>>>>>> c5b4ed2900f304953efeb3507c49ee1fa6308035
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import apiClient, { BASE_URL, getImageUrl } from '../../api/apiClient';
<<<<<<< HEAD
import axios from 'axios';
import { API_URL } from '../../api/config';
=======
>>>>>>> c5b4ed2900f304953efeb3507c49ee1fa6308035

const ProfileScreen = ({ route, navigation }) => {
  const { user: authUser, logout } = useAuth();
  const authorId = route?.params?.authorId;
  const isOwnProfile = !authorId || authorId === (authUser?._id || authUser?.id);

  const [profileData, setProfileData] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const user = {
    name: authUser?.name || 'Happy Camper',
    email: authUser?.email || 'camper@example.com',
    avatar: authUser?.profilePicture
      ? (authUser.profilePicture.startsWith('http') ? authUser.profilePicture : `${BASE_URL}${authUser.profilePicture}`)
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
  };

  useEffect(() => {
    fetchProfileData();
  }, [authorId, authUser]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      if (isOwnProfile) {
        setProfileData(authUser);
      } else {
<<<<<<< HEAD
        const blogRes = await axios.get(`${API_URL}/api/blogs`);
        const authorBlog = blogRes.data.find(b => (b.author?._id || b.author) === authorId);
        if (authorBlog) {
          setProfileData({
            _id: authorId,
            name: authorBlog.authorName || authorBlog.author?.name,
            role: authorBlog.authorRole || authorBlog.author?.role,
            email: 'author@camptrail360.com',
            profilePicture: authorBlog.authorAvatar || authorBlog.author?.profilePicture
=======
        const response = await apiClient.get('/blogs');
        const blogs = response.data.data || response.data;
        const authorBlog = blogs.find(b => (b.author?._id || b.author) === authorId);
        if (authorBlog) {
          setProfileData({
            _id: authorId,
            name: authorBlog.authorName || (authorBlog.author?.name),
            role: authorBlog.authorRole || (authorBlog.author?.role),
            email: 'author@camptrail360.com',
            profilePicture: authorBlog.authorAvatar
>>>>>>> c5b4ed2900f304953efeb3507c49ee1fa6308035
          });
        }
      }

<<<<<<< HEAD
      const response = await axios.get(`${API_URL}/api/blogs`);
      const blogs = Array.isArray(response.data) ? response.data : (response.data.data || []);
=======
      const response = await apiClient.get('/blogs');
      const blogs = response.data.data || response.data;
>>>>>>> c5b4ed2900f304953efeb3507c49ee1fa6308035
      const filtered = blogs.filter(b => (b.author?._id || b.author) === (authorId || authUser?._id || authUser?.id));
      setUserBlogs(filtered);
    } catch (err) {
      console.error('Error fetching profile data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const userDisplayName = profileData?.name || authUser?.name || 'Happy Camper';
  const userEmail = profileData?.email || authUser?.email || 'camper@example.com';
<<<<<<< HEAD
  const userAvatar = profileData?.profilePicture 
    ? (profileData.profilePicture.startsWith('http') ? profileData.profilePicture : `${BASE_URL}${profileData.profilePicture}`)
    : authUser?.profilePicture 
    ? (authUser.profilePicture.startsWith('http') ? authUser.profilePicture : `${BASE_URL}${authUser.profilePicture}`)
    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
=======
  const userAvatar = getImageUrl(profileData?.profilePicture) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
>>>>>>> c5b4ed2900f304953efeb3507c49ee1fa6308035

  const menuItems = [
    { icon: 'bookmark-outline', label: 'My Bookings', action: () => navigation.navigate('MyBookings') },
    { icon: 'heart-outline', label: 'Favorites', action: () => Alert.alert('Coming Soon', 'Feature in development!') },
    { icon: 'card-outline', label: 'Payment History', action: () => navigation.navigate('PaymentHistory') },
    { icon: 'settings-outline', label: 'Settings', action: () => Alert.alert('Coming Soon', 'Feature in development!') },
    { icon: 'help-circle-outline', label: 'Help Center', action: () => Alert.alert('Coming Soon', 'Feature in development!') },
  ];

  const renderBlogItem = ({ item }) => (
    <TouchableOpacity
      style={styles.blogCard}
      onPress={() => navigation.navigate('BlogDetail', { blog: item })}
    >
      <Image
        source={{ uri: getImageUrl(item.image) || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600' }}
        style={styles.blogThumb}
      />
      <View style={styles.blogInfo}>
        <Text style={styles.blogCategory}>{item.category?.toUpperCase()}</Text>
        <Text style={styles.blogTitle} numberOfLines={1}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
<<<<<<< HEAD
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Camptrail 360 Green Header */}
      <View style={styles.greenHeader}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {!isOwnProfile && (
=======
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      {isOwnProfile ? (
        <Header />
      ) : (
        <View style={styles.greenHeader}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
>>>>>>> c5b4ed2900f304953efeb3507c49ee1fa6308035
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Ionicons name="leaf" size={20} color="#fff" />
              <Text style={styles.headerBrand}>CAMPTRAIL 360</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerIcon}><Ionicons name="search" size={22} color="#fff" /></TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon}><Ionicons name="person-circle" size={24} color="#fff" /></TouchableOpacity>
            </View>
          </View>
        </View>
      )}

<<<<<<< HEAD
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: userAvatar }} 
            style={styles.avatar} 
          />
          <Text style={styles.userName}>{userDisplayName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
          
=======
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <Image source={{ uri: userAvatar }} style={styles.avatar} />
          <Text style={styles.userName}>{userDisplayName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>

            {isOwnProfile && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Ionicons name="pencil-sharp" size={16} color="#fff" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>

>>>>>>> c5b4ed2900f304953efeb3507c49ee1fa6308035
          {isOwnProfile && (
            <View style={styles.menuContainer}>
              {menuItems.map((item, index) => (
                <TouchableOpacity key={index} style={styles.menuItem} onPress={item.action}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name={item.icon} size={22} color={Colors.text} />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    {item.count && <Text style={styles.badge}>{item.count}</Text>}
                    <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.blogsSection}>
            <Text style={styles.sectionTitle}>{isOwnProfile ? 'My Publications' : `Blogs by ${userDisplayName}`}</Text>
            {userBlogs.length > 0 ? (
              userBlogs.map(item => (
                <React.Fragment key={item._id || Math.random().toString()}>
                  {renderBlogItem({ item })}
                </React.Fragment>
              ))
            ) : (
              <Text style={styles.emptyText}>No blogs found.</Text>
            )}
          </View>

          {isOwnProfile && (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={logout}
            >
              <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          )}
<<<<<<< HEAD
        </View>

        {isOwnProfile && (
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.action}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon} size={22} color={Colors.text} />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <View style={styles.menuItemRight}>
                  <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.blogsSection}>
          <Text style={styles.sectionTitle}>{isOwnProfile ? 'My Publications' : `Blogs by ${userDisplayName}`}</Text>
          {userBlogs.length > 0 ? (
            userBlogs.map(item => (
              <React.Fragment key={item._id}>
                {renderBlogItem({ item })}
              </React.Fragment>
            ))
          ) : (
            <Text style={styles.emptyText}>No blogs found.</Text>
          )}
        </View>

        {isOwnProfile && (
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
=======
        </ScrollView>
      </View>
    );
};

      const styles = StyleSheet.create({
>>>>>>> c5b4ed2900f304953efeb3507c49ee1fa6308035
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  greenHeader: {
    backgroundColor: '#065f46',
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 40) + 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBrand: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#f1f5f9',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 16,
    marginLeft: 15,
    color: '#334155',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#065f46',
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 10,
  },
  blogsSection: {
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  blogCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  blogThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  blogInfo: {
    flex: 1,
    marginLeft: 15,
  },
  blogCategory: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 2,
  },
  blogTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
    paddingVertical: 15,
  },
  logoutText: {
    color: Colors.danger,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 10,
  },
});

      export default ProfileScreen;
