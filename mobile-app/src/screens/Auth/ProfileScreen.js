<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../api/config';

const ProfileScreen = ({ route, navigation }) => {
  const { user: authUser, logout, token } = useAuth();
  const authorId = route?.params?.authorId;
  const isOwnProfile = !authorId || authorId === authUser?._id;

  const [profileData, setProfileData] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, [authorId, authUser]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      // 1. Set the user basic info
      if (isOwnProfile) {
        setProfileData(authUser);
      } else {
        // In a real app, fetch user by ID. For now, we find them from the blogs list
        const blogRes = await axios.get(`${API_URL}/api/blogs`);
        const authorBlog = blogRes.data.find(b => b.author === authorId);
        if (authorBlog) {
          setProfileData({
            name: authorBlog.authorName,
            role: authorBlog.authorRole,
            email: 'author@camptrail360.com' // Placeholder for privacy
          });
        }
      }

      // 2. Fetch all blogs by this user
      const response = await axios.get(`${API_URL}/api/blogs`);
      const filtered = response.data.filter(b => b.author === (authorId || authUser?._id));
      setUserBlogs(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
=======
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import { BASE_URL } from '../../api/apiClient';

const ProfileScreen = ({ navigation }) => {
  const { user: authUser, logout } = useAuth();
  
  const user = {
    name: authUser?.name || 'Happy Camper',
    email: authUser?.email || 'camper@example.com',
    avatar: authUser?.profilePicture 
      ? (authUser.profilePicture.startsWith('http') ? authUser.profilePicture : `${BASE_URL}${authUser.profilePicture}`)
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
>>>>>>> 0e5e60ea9d644b65fa53668e7d4d60869fdc8c50
  };

  const menuItems = [
    { icon: 'bookmark-outline', label: 'My Bookings', count: isOwnProfile ? 2 : null, action: () => navigation.navigate('MyBookings') },
    { icon: 'heart-outline', label: 'Favorites', count: isOwnProfile ? 5 : null, action: () => Alert.alert('Favorites', 'Feature coming soon!') },
    { icon: 'card-outline', label: 'Payment Methods', action: () => Alert.alert('Payments', 'Feature coming soon!') },
    { icon: 'settings-outline', label: 'Settings', action: () => Alert.alert('Settings', 'Feature coming soon!') },
    { icon: 'help-circle-outline', label: 'Help Center', action: () => Alert.alert('Help Center', 'Feature coming soon!') },
  ];

  const renderBlogItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.blogCard}
      onPress={() => navigation.navigate('BlogDetail', { blog: item })}
    >
      <Image source={{ uri: item.image }} style={styles.blogThumb} />
      <View style={styles.blogInfo}>
        <Text style={styles.blogCategory}>{item.category?.toUpperCase()}</Text>
        <Text style={styles.blogTitle} numberOfLines={1}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#065f46" /></View>;
  }

  return (
    <View style={styles.container}>
<<<<<<< HEAD
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' }} 
            style={styles.avatar} 
          />
          <Text style={styles.userName}>{profileData?.name || 'Happy Camper'}</Text>
          <Text style={styles.userEmail}>{profileData?.email || 'camper@example.com'}</Text>
        </View>

        {/* Menu Options (Only for own profile) */}
        {isOwnProfile && (
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.action}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon} size={22} color="#334155" />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <View style={styles.menuItemRight}>
                  {item.count && <Text style={styles.badge}>{item.count}</Text>}
                  <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Author's Blogs Section */}
        <View style={styles.blogsSection}>
          <Text style={styles.sectionTitle}>{isOwnProfile ? 'My Publications' : `Blogs by ${profileData?.name}`}</Text>
          <FlatList
            data={userBlogs}
            renderItem={renderBlogItem}
            keyExtractor={item => item._id}
            scrollEnabled={false}
            ListEmptyComponent={<Text style={styles.emptyText}>No blogs found.</Text>}
          />
        </View>

        {isOwnProfile && (
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
=======
      <Header />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileSection}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="pencil-sharp" size={16} color="#fff" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem}
              onPress={item.action}
            >
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

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
>>>>>>> 0e5e60ea9d644b65fa53668e7d4d60869fdc8c50
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenHeader: {
    backgroundColor: '#065f46',
    paddingTop: 60,
    paddingBottom: 20,
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
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 15,
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
<<<<<<< HEAD
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
=======
  scrollContent: {
    paddingBottom: 100,
>>>>>>> 0e5e60ea9d644b65fa53668e7d4d60869fdc8c50
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
<<<<<<< HEAD
    marginTop: 20,
=======
    marginTop: 40,
    marginBottom: 20,
>>>>>>> 0e5e60ea9d644b65fa53668e7d4d60869fdc8c50
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
});

export default ProfileScreen;
