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
  Platform, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../api/config';
import Header from '../../components/Header';
import { getImageUrl } from '../../api/apiClient';

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
        const response = await axios.get(`${API_URL}/api/blogs`);
        const blogs = response.data;
        const authorBlog = blogs.find(b => (b.author?._id || b.author) === authorId);
        if (authorBlog) {
          setProfileData({
            _id: authorId,
            name: authorBlog.authorName || (authorBlog.author?.name),
            role: authorBlog.authorRole || (authorBlog.author?.role),
            email: 'author@camptrail360.com',
            profilePicture: authorBlog.authorAvatar
          });
        }
      }

      const response = await axios.get(`${API_URL}/api/blogs?t=${Date.now()}`);
      const filtered = response.data.filter(b => {
        const blogAuthorId = (b.author && typeof b.author === 'object') ? b.author._id : b.author;
        const currentUserId = authorId || authUser?._id || authUser?.id;
        return blogAuthorId && currentUserId && blogAuthorId.toString() === currentUserId.toString();
      });
      setUserBlogs(filtered);
    } catch (err) {
      console.error('Error fetching profile data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const user = {
    name: profileData?.name || authUser?.name || 'Happy Camper',
    email: profileData?.email || authUser?.email || 'camper@example.com',
    avatar: getImageUrl(profileData?.profilePicture || authUser?.profilePicture) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
  };

  const menuItems = [
    { icon: 'bookmark-outline', label: 'My Bookings', action: () => navigation.navigate('MyBookings') },
    { icon: 'heart-outline', label: 'Favorites', action: () => Alert.alert('Coming Soon', 'Feature in development!') },
    { icon: 'card-outline', label: 'Payment History', action: () => navigation.navigate('PaymentHistory') },
    { icon: 'settings-outline', label: 'Settings', action: () => Alert.alert('Coming Soon', 'Feature in development!') },
    { icon: 'help-circle-outline', label: 'Help Center', action: () => Alert.alert('Coming Soon', 'Feature in development!') },
  ];

  const renderBlogItem = (item) => (
    <TouchableOpacity
      key={item._id}
      style={styles.blogCard}
      onPress={() => navigation.navigate('BlogDetail', { blog: item })}
    >
      <Image source={{ uri: item.image || (item.images && item.images[0]) }} style={styles.blogThumb} />
      <View style={styles.blogInfo}>
        <Text style={styles.blogCategory}>{item.category?.toUpperCase() || 'GENERAL'}</Text>
        <Text style={styles.blogTitle} numberOfLines={1}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: user.avatar }} 
            style={styles.avatar} 
          />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
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
          <Text style={styles.sectionTitle}>{isOwnProfile ? 'My Publications' : `Blogs by ${user.name}`}</Text>
          {userBlogs.length > 0 ? (
            userBlogs.map(item => renderBlogItem(item))
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default ProfileScreen;
