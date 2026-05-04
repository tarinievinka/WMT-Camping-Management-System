import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ScrollView, 
  ActivityIndicator, 
<<<<<<< HEAD
=======
  FlatList, 
>>>>>>> 62f5f3323d328e9d8b5095180a339c2fe359b4b9
  Platform, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../api/config';
import Header from '../../components/Header';
<<<<<<< HEAD
import { getImageUrl } from '../../api/apiClient';
=======
import apiClient, { BASE_URL, getImageUrl } from '../../api/apiClient';
import axios from 'axios';
import { API_URL } from '../../api/config';
>>>>>>> 62f5f3323d328e9d8b5095180a339c2fe359b4b9

const ProfileScreen = ({ route, navigation }) => {
  const { user: authUser, logout } = useAuth();
  const authorId = route?.params?.authorId;
  const isOwnProfile = !authorId || authorId === (authUser?._id || authUser?.id);

  const [profileData, setProfileData] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        const response = await axios.get(`${API_URL}/api/blogs`);
        const blogs = response.data;
=======
        const blogRes = await axios.get(`${API_URL}/api/blogs`);
        const blogs = Array.isArray(blogRes.data) ? blogRes.data : (blogRes.data.data || []);
>>>>>>> 62f5f3323d328e9d8b5095180a339c2fe359b4b9
        const authorBlog = blogs.find(b => (b.author?._id || b.author) === authorId);
        if (authorBlog) {
          setProfileData({
            _id: authorId,
            name: authorBlog.authorName || authorBlog.author?.name,
            role: authorBlog.authorRole || authorBlog.author?.role,
            email: 'author@camptrail360.com',
            profilePicture: authorBlog.authorAvatar || authorBlog.author?.profilePicture
          });
        }
      }

<<<<<<< HEAD
      const response = await axios.get(`${API_URL}/api/blogs?t=${Date.now()}`);
      const filtered = response.data.filter(b => {
        const blogAuthorId = (b.author && typeof b.author === 'object') ? b.author._id : b.author;
        const currentUserId = authorId || authUser?._id || authUser?.id;
        return blogAuthorId && currentUserId && blogAuthorId.toString() === currentUserId.toString();
      });
=======
      const response = await axios.get(`${API_URL}/api/blogs`);
      const blogs = Array.isArray(response.data) ? response.data : (response.data.data || []);
      const filtered = blogs.filter(b => (b.author?._id || b.author) === (authorId || authUser?._id || authUser?.id));
>>>>>>> 62f5f3323d328e9d8b5095180a339c2fe359b4b9
      setUserBlogs(filtered);
    } catch (err) {
      console.error('Error fetching profile data:', err);
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  const user = {
    name: profileData?.name || authUser?.name || 'Happy Camper',
    email: profileData?.email || authUser?.email || 'camper@example.com',
    avatar: getImageUrl(profileData?.profilePicture || authUser?.profilePicture) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
  };
=======
  const userDisplayName = profileData?.name || authUser?.name || 'Happy Camper';
  const userEmail = profileData?.email || authUser?.email || 'camper@example.com';
  const userAvatar = profileData?.profilePicture 
    ? (profileData.profilePicture.startsWith('http') ? profileData.profilePicture : `${BASE_URL}${profileData.profilePicture}`)
    : authUser?.profilePicture 
    ? (authUser.profilePicture.startsWith('http') ? authUser.profilePicture : `${BASE_URL}${authUser.profilePicture}`)
    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
>>>>>>> 62f5f3323d328e9d8b5095180a339c2fe359b4b9

  const menuItems = [
    { icon: 'bookmark-outline', label: 'My Bookings', count: isOwnProfile ? null : null, action: () => navigation.navigate('MyBookings') },
    { icon: 'heart-outline', label: 'Favorites', action: () => Alert.alert('Coming Soon', 'Feature in development!') },
    { icon: 'card-outline', label: 'Payment History', action: () => navigation.navigate('PaymentHistory') },
    { icon: 'settings-outline', label: 'Settings', action: () => Alert.alert('Coming Soon', 'Feature in development!') },
    { icon: 'help-circle-outline', label: 'Help Center', action: () => Alert.alert('Coming Soon', 'Feature in development!') },
  ];

<<<<<<< HEAD
  const renderBlogItem = (item) => (
    <TouchableOpacity
      key={item._id}
      style={styles.blogCard}
      onPress={() => navigation.navigate('BlogDetail', { blog: item })}
    >
      <Image source={{ uri: item.image || (item.images && item.images[0]) }} style={styles.blogThumb} />
=======
  const renderBlogItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.blogCard}
      onPress={() => navigation.navigate('BlogDetail', { blog: item })}
    >
      <Image 
        source={{ uri: item.image?.startsWith('http') ? item.image : `${BASE_URL}${item.image}` }} 
        style={styles.blogThumb} 
      />
>>>>>>> 62f5f3323d328e9d8b5095180a339c2fe359b4b9
      <View style={styles.blogInfo}>
        <Text style={styles.blogCategory}>{item.category?.toUpperCase() || 'GENERAL'}</Text>
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
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
<<<<<<< HEAD
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: user.avatar }} 
            style={styles.avatar} 
          />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
=======
      
      {/* Camptrail 360 Green Header */}
      <View style={styles.greenHeader}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {!isOwnProfile && (
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            <Ionicons name="leaf" size={20} color="#fff" />
            <Text style={styles.headerBrand}>CAMPTRAIL 360</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon}><Ionicons name="search" size={22} color="#fff" /></TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}><Ionicons name="person-circle" size={24} color="#fff" /></TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: userAvatar }} 
            style={styles.avatar} 
          />
          <Text style={styles.userName}>{userDisplayName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
>>>>>>> 62f5f3323d328e9d8b5095180a339c2fe359b4b9
          
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
<<<<<<< HEAD
          <Text style={styles.sectionTitle}>{isOwnProfile ? 'My Publications' : `Blogs by ${user.name}`}</Text>
          {userBlogs.length > 0 ? (
            userBlogs.map(item => renderBlogItem(item))
=======
          <Text style={styles.sectionTitle}>{isOwnProfile ? 'My Publications' : `Blogs by ${userDisplayName}`}</Text>
          {userBlogs.length > 0 ? (
            userBlogs.map(item => (
              <React.Fragment key={item._id || Math.random().toString()}>
                {renderBlogItem({ item })}
              </React.Fragment>
            ))
>>>>>>> 62f5f3323d328e9d8b5095180a339c2fe359b4b9
          ) : (
            <Text style={styles.emptyText}>No blogs found.</Text>
          )}
        </View>

        {isOwnProfile && (
<<<<<<< HEAD
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
=======
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
>>>>>>> 62f5f3323d328e9d8b5095180a339c2fe359b4b9
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 100 },
  profileSection: { alignItems: 'center', paddingVertical: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15, borderWidth: 3, borderColor: '#f1f5f9' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  userEmail: { fontSize: 14, color: '#64748b', marginTop: 4, marginBottom: 20 },
  editButton: { flexDirection: 'row', backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  editButtonText: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  menuContainer: { paddingHorizontal: 20 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuLabel: { fontSize: 16, marginLeft: 15, color: '#334155' },
  menuItemRight: { flexDirection: 'row', alignItems: 'center' },
  blogsSection: { padding: 20, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  blogCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  blogThumb: { width: 60, height: 60, borderRadius: 8 },
  blogInfo: { flex: 1, marginLeft: 15 },
  blogCategory: { fontSize: 10, fontWeight: 'bold', color: Colors.primary, marginBottom: 2 },
  blogTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 40, marginBottom: 20, paddingVertical: 15 },
  logoutText: { color: Colors.danger, fontSize: 16, fontWeight: '600', marginLeft: 10 },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 10 },
=======
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  greenHeader: {
    backgroundColor: '#065f46',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 25,
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
    color: '#065f46',
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
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 10,
  },
>>>>>>> 62f5f3323d328e9d8b5095180a339c2fe359b4b9
});

export default ProfileScreen;
