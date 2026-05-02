import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Platform, KeyboardAvoidingView, SafeAreaView } from 'react-native';
import { Colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../api/config';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';

const CreateBlogScreen = ({ route, navigation }) => {
  const { token } = useAuth();
  const editBlog = route?.params?.blog;
  
  const [title, setTitle] = useState(editBlog ? editBlog.title : '');
  const [content, setContent] = useState(editBlog ? editBlog.content : '');
  const [tags, setTags] = useState(editBlog && editBlog.tags ? editBlog.tags.join(', ') : '');
  const [category, setCategory] = useState(editBlog ? (editBlog.category || 'General') : 'General');
  const [image, setImage] = useState(editBlog ? editBlog.image : null);
  const [isLoading, setIsLoading] = useState(false);
  const isSubmitting = useRef(false);

  const categories = ['Smart Gear', 'Destinations', 'Campfire Recipes', 'Eco Camping', 'Safety & Tips'];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (isSubmitting.current) return;
    
    if (!title || !content) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    isSubmitting.current = true;
    setIsLoading(true);
    try {
      const blogData = {
        title,
        content,
        category,
        tags: tags.split(',').map(tag => tag.trim()),
        image: image || 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80'
      };

      if (editBlog) {
        await axios.put(`${API_URL}/api/blogs/${editBlog._id}`, blogData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        await axios.post(`${API_URL}/api/blogs`, blogData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      const successMsg = editBlog ? 'Blog updated successfully!' : 'Blog posted successfully!';
      if (Platform.OS === 'web') {
        window.alert(successMsg);
        navigation.goBack();
      } else {
        Alert.alert('Success', successMsg, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to create blog');
    } finally {
      isSubmitting.current = false;
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{editBlog ? 'Edit Blog' : 'Create Blog'}</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.imageSection}>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={40} color="#94a3b8" />
                  <Text style={styles.placeholderText}>Add Cover Image</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {image && (
              <TouchableOpacity style={styles.clearImage} onPress={() => setImage(null)}>
                <Ionicons name="close-circle" size={24} color="#ef4444" />
                <Text style={styles.clearText}>Clear Image</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL (Recommended for cross-device)</Text>
            <TextInput
              style={styles.input}
              placeholder="Paste Unsplash/Pexels link here..."
              value={image && image.startsWith('http') ? image : ''}
              onChangeText={setImage}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter an inspiring title"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.categoryChipActive
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextActive
                  ]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags (comma separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="camping, nature, travel"
              value={tags}
              onChangeText={setTags}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Content</Text>
            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="Share your experience..."
              value={content}
              onChangeText={setContent}
              multiline
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.disabledButton]}
            onPress={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitText}>{editBlog ? 'Update Blog' : 'Post Blog'}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  imageSection: {
    marginBottom: 20,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 10,
  },
  clearImage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  clearText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    color: '#94a3b8',
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryScroll: {
    marginTop: 5,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  contentInput: {
    height: 200,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default CreateBlogScreen;
