import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ActivityIndicator, 
  SafeAreaView 
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../api/config';

const BlogDetailScreen = ({ route, navigation }) => {
  const { blog: initialBlog } = route.params;
  const [blog, setBlog] = useState(initialBlog);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    checkBookmarkStatus();
  }, [blog._id]);

  const checkBookmarkStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem('blog_bookmarks');
      if (stored) {
        const bookmarks = JSON.parse(stored);
        setIsBookmarked(bookmarks.includes(blog._id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to bookmark posts');
      return;
    }
    try {
      const stored = await AsyncStorage.getItem('blog_bookmarks');
      let bookmarks = stored ? JSON.parse(stored) : [];
      
      if (bookmarks.includes(blog._id)) {
        bookmarks = bookmarks.filter(id => id !== blog._id);
        setIsBookmarked(false);
      } else {
        bookmarks.push(blog._id);
        setIsBookmarked(true);
      }
      
      await AsyncStorage.setItem('blog_bookmarks', JSON.stringify(bookmarks));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to like this post');
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/api/blogs/${blog._id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlog(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to comment');
      return;
    }
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/api/blogs/${blog._id}/comment`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBlog(response.data);
      setComment('');
    } catch (err) {
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Blog',
      'Are you sure you want to delete this blog post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/api/blogs/${blog._id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              Alert.alert('Success', 'Blog deleted successfully');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete blog');
            }
          }
        }
      ]
    );
  };

  const canEdit = user && (user._id === blog.author || user.role === 'admin');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blog Details</Text>
        <TouchableOpacity onPress={toggleBookmark}>
          <Ionicons 
            name={isBookmarked ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isBookmarked ? Colors.primary : Colors.text} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <Image source={{ uri: blog.image }} style={styles.image} />
        
        <View style={styles.content}>
          <Text style={styles.category}>{blog.category || 'General'}</Text>
          <Text style={styles.title}>{blog.title}</Text>
          
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>By {blog.authorName}</Text>
            <Text style={styles.date}>{new Date(blog.createdAt).toLocaleDateString()}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
              <Ionicons 
                name={blog.likes?.includes(user?._id) ? "heart" : "heart-outline"} 
                size={24} 
                color={blog.likes?.includes(user?._id) ? Colors.danger : Colors.text} 
              />
              <Text style={styles.actionText}>{blog.likes?.length || 0} Likes</Text>
            </TouchableOpacity>

            {canEdit && (
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('CreateBlog', { blog })}
                  style={styles.actionBtn}
                >
                  <Ionicons name="create-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={24} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={styles.blogContent}>{blog.content}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Comments ({blog.comments?.length || 0})</Text>
          
          {blog.comments?.map((c, index) => (
            <View key={index} style={styles.commentCard}>
              <Text style={styles.commentUser}>{c.name}</Text>
              <Text style={styles.commentText}>{c.text}</Text>
              <Text style={styles.commentDate}>{new Date(c.date).toLocaleDateString()}</Text>
            </View>
          ))}

          {user?.role !== 'admin' && (
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                value={comment}
                onChangeText={setComment}
                multiline
              />
              <TouchableOpacity 
                style={[styles.commentBtn, !comment.trim() && styles.disabledBtn]}
                onPress={handleComment}
                disabled={isSubmitting || !comment.trim()}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.commentBtnText}>Post</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  category: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  authorName: {
    color: '#666',
    fontStyle: 'italic',
  },
  date: {
    color: '#999',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 8,
    color: Colors.text,
    fontWeight: '600',
  },
  blogContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 30,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  commentCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  commentUser: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: Colors.text,
  },
  commentText: {
    color: '#555',
    marginBottom: 5,
  },
  commentDate: {
    fontSize: 10,
    color: '#999',
  },
  commentInputContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  commentBtn: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  commentBtnText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  disabledBtn: {
    opacity: 0.5,
  },
});

export default BlogDetailScreen;
