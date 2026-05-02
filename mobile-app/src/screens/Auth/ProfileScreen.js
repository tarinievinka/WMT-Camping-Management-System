import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import apiClient, { BASE_URL } from '../../api/apiClient';

const ProfileScreen = ({ route, navigation }) => {
  const { user: authUser, logout, token } = useAuth();
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
        const response = await apiClient.get('/blogs');
        const blogs = response.data.data || response.data;
        const authorBlog = blogs.find(b => b.author?._id === authorId || b.author === authorId);
        if (authorBlog) {
          setProfileData({
            name: authorBlog.authorName || (authorBlog.author?.name),
            role: authorBlog.authorRole || (authorBlog.author?.role),
            email: 'author@camptrail360.com'
          });
        }
      }

      const response = await apiClient.get('/blogs');
      const blogs = response.data.data || response.data;
      const filtered = blogs.filter(b => (b.author?._id || b.author) === (authorId || authUser?._id || authUser?.id));
      setUserBlogs(filtered);
    } catch (err) {
      console.error('Error fetching profile data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { icon: 'bookmark-outline', label: 'My Bookings', count: isOwnProfile ? 2 : null, action: () => navigation.navigate('MyBookings') },
    { icon: 'heart-outline', label: 'Favorites', action: () => Alert.alert('Coming Soon', 'Feature in development!') },
    { icon: 'card-outline', label: 'Payment Methods', action: () => Alert.alert('Coming Soon', 'Feature in development!') },
    { icon: 'settings-outline', label: 'Settings', action: () => Alert.alert('Coming Soon', 'Feature in development!') },
    { icon: 'help-circle-outline', label: 'Help Center', action: () => Alert.alert('Coming Soon', 'Feature in development!') },
  ];

  const renderBlogItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.blogCard}
      onPress={() => navigation.navigate('BlogDetail', { blog: item })}
    >
      <Image 
        source={{ uri: item.image?.startsWith('http') ? item.image : `${BASE_URL}${item.image}` }} 
        style={styles.blogThumb} 
      />
      <View style={styles.blogInfo}>
        <Text style={styles.blogCategory}>{item.category?.toUpperCase()}</Text>
        <Text style={styles.blogTitle} numberOfLines={1}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  const userAvatar = profileData?.profilePicture 
    ? (profileData.profilePicture.startsWith('http') ? profileData.profilePicture : `${BASE_URL}${profileData.profilePicture}`)
    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200';

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <Image source={{ uri: userAvatar }} style={styles.avatar} />
          <Text style={styles.userName}>{profileData?.name || 'Happy Camper'}</Text>
          <Text style={styles.userEmail}>{profileData?.email || 'camper@example.com'}</Text>
          
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

        <View style={styles.blogsSection}>
          <Text style={styles.sectionTitle}>{isOwnProfile ? 'My Publications' : `Blogs by ${profileData?.name}`}</Text>
          <FlatList
            data={userBlogs}
            renderItem={renderBlogItem}
            keyExtractor={item => item._id || Math.random().toString()}
            scrollEnabled={false}
            ListEmptyComponent={<Text style={styles.emptyText}>No blogs found.</Text>}
          />
        </View>

        {isOwnProfile && (
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 60 },
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
  badge: { backgroundColor: Colors.primary, color: '#fff', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginRight: 10 },
  blogsSection: { padding: 20, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  blogCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  blogThumb: { width: 60, height: 60, borderRadius: 8 },
  blogInfo: { flex: 1, marginLeft: 15 },
  blogCategory: { fontSize: 10, fontWeight: 'bold', color: Colors.primary, marginBottom: 2 },
  blogTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, paddingVertical: 15 },
  logoutText: { color: Colors.danger, fontSize: 16, fontWeight: '600', marginLeft: 10 },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 10 },
});

export default ProfileScreen;
