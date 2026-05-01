import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../api/config';

const BlogDetailScreen = ({ route, navigation }) => {
  const { blog: initialBlog } = route.params;
  const [blog, setBlog] = useState(initialBlog);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleLike = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/blogs/${blog._id}/like`);
      setBlog(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/api/blogs/${blog._id}/comment`, { text: comment });
      setBlog(response.data);
      setComment('');
    } catch (err) {
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Image source={{ uri: blog.image }} style={styles.headerImage} />
        </View>

        <View style={styles.content}>
          <View style={styles.authorSection}>
            <View style={styles.authorInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{blog.authorName?.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.authorName}>{blog.authorName}</Text>
                <Text style={styles.date}>{new Date(blog.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
              <Ionicons 
                name={blog.likes?.includes(user?._id) ? "heart" : "heart-outline"} 
                size={24} 
                color={blog.likes?.includes(user?._id) ? "#ef4444" : "#64748b"} 
              />
              <Text style={styles.likeCount}>{blog.likes?.length || 0}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{blog.title}</Text>
          
          <View style={styles.tagRow}>
            {blog.tags?.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.blogText}>{blog.content}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Comments ({blog.comments?.length || 0})</Text>

          {blog.comments?.map((c, index) => (
            <View key={index} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentUser}>{c.name}</Text>
                <Text style={styles.commentDate}>{new Date(c.date).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.commentText}>{c.text}</Text>
            </View>
          ))}

          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, !comment.trim() && styles.disabledButton]}
              onPress={handleComment}
              disabled={isSubmitting || !comment.trim()}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Ionicons name="send" size={20} color={Colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    marginTop: -20,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  authorSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  date: {
    fontSize: 12,
    color: '#94a3b8',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  likeCount: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
    lineHeight: 32,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    marginRight: 10,
  },
  tagText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  blogText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 26,
    marginBottom: 30,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  commentCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  commentUser: {
    fontWeight: 'bold',
    fontSize: 14,
    color: Colors.text,
  },
  commentDate: {
    fontSize: 10,
    color: '#94a3b8',
  },
  commentText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default BlogDetailScreen;
