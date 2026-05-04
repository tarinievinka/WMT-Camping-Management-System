import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Platform, KeyboardAvoidingView, SafeAreaView, FlatList } from 'react-native';
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

  // New: Multiple images state
  const [images, setImages] = useState(editBlog ? (editBlog.images || [editBlog.image]) : []);
  const [imageUrl, setImageUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);
<<<<<<< HEAD
  const [uploadStatus, setUploadStatus] = useState('');
=======
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
>>>>>>> 62f5f3323d328e9d8b5095180a339c2fe359b4b9
  const isSubmitting = useRef(false);

  const categories = ['Smart Gear', 'Destinations', 'Campfire Recipes', 'Eco Camping', 'Safety & Tips'];

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...newImages].slice(0, 5)); // Limit to 5
    }
  };

  const addImageUrl = () => {
    if (imageUrl.trim()) {
      if (images.length >= 5) {
        Alert.alert('Limit Reached', 'You can only add up to 5 images.');
        return;
      }
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Upload a local file URI to the server and return the server URL
  const uploadImageToServer = async (localUri) => {
    if (localUri.startsWith('http')) return localUri; // already a URL, skip upload
    try {
      const formData = new FormData();
      const filename = localUri.split('/').pop();
      const ext = (filename.split('.').pop() || 'jpg').toLowerCase();
      formData.append('image', {
        uri: localUri,
        name: filename || `photo_${Date.now()}.jpg`,
        type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      });
      const res = await axios.post(`${API_URL}/api/blogs/upload-image`, formData, {
        headers: { Authorization: `Bearer ${token}` }, // Do NOT set Content-Type - axios handles multipart boundary automatically
        timeout: 30000,
      });
      return `${API_URL}${res.data.urlPath}`;
    } catch (uploadErr) {
      console.error('Image upload failed:', uploadErr?.response?.data || uploadErr.message);
      return null; // return null on failure
    }
  };

  const handleCreate = async () => {
    if (isSubmitting.current) return;

    let isValid = true;
    if (!title.trim()) {
      setTitleError('Title is required');
      isValid = false;
    } else {
      setTitleError('');
    }

    if (!content.trim()) {
      setContentError('Content is required');
      isValid = false;
    } else {
      setContentError('');
    }

    if (!isValid) return;

    isSubmitting.current = true;
    setIsLoading(true);
    try {
<<<<<<< HEAD
      // Upload any local images to the server first
      setUploadStatus('Uploading images...');
      const uploadResults = await Promise.all(
        images.map(uri => uploadImageToServer(uri))
      );
      // Filter out failed uploads (null values), keep successful URLs
      const uploadedImages = uploadResults.filter(url => url !== null);
      setUploadStatus('');

      const blogData = {
        title,
        content,
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        images: uploadedImages.length > 0 ? uploadedImages : ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80']
=======
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      
      const tagList = tags.split(',').map(tag => tag.trim()).filter(t => t !== "");
      formData.append('tags', JSON.stringify(tagList));

      // Local images + already added URLs
      const allImages = [...images];
      
      // Auto-include pending URL if user forgot to click the '+' button
      if (imageUrl.trim() && !allImages.includes(imageUrl.trim())) {
        allImages.push(imageUrl.trim());
      }

      const urlImages = [];
      allImages.forEach((img, index) => {
        if (img.startsWith('http') || img.startsWith('/uploads')) {
          urlImages.push(img);
        } else {
          // Local file upload
          const fileName = img.split('/').pop() || `image_${index}.jpg`;
          const extension = fileName.split('.').pop();
          formData.append('images', {
            uri: Platform.OS === 'android' ? img : img.replace('file://', ''),
            name: fileName,
            type: `image/${extension === 'jpg' ? 'jpeg' : extension}`
          });
        }
      });



      if (urlImages.length > 0) {
        formData.append('urlImages', JSON.stringify(urlImages));
      }


      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
>>>>>>> 62f5f3323d328e9d8b5095180a339c2fe359b4b9
      };

      if (editBlog) {
        await axios.put(`${API_URL}/api/blogs/${editBlog._id}`, formData, config);
      } else {
        await axios.post(`${API_URL}/api/blogs`, formData, config);
      }

      const successMsg = editBlog ? 'Blog updated successfully!' : 'Blog posted successfully!';
      if (Platform.OS === 'web') {
        window.alert(successMsg);
        navigation.goBack();
      } else {
        Alert.alert('Success', successMsg, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (err) {
      console.error('Blog Save Error:', err);
      Alert.alert('Error', 'Failed to save blog. Please try again.');
    } finally {
      isSubmitting.current = false;
      setIsLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{editBlog ? 'Edit Story' : 'New Adventure'}</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.imageSection}>
            <Text style={styles.label}>Gallery (Max 5 images)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGrid}>
              <TouchableOpacity style={styles.addBtn} onPress={pickImages}>
                <Ionicons name="add" size={30} color={Colors.primary} />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>

              {images.map((uri, index) => (
                <View key={`${index}-${uri}`} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                  </TouchableOpacity>
                  {index === 0 && <View style={styles.coverBadge}><Text style={styles.coverText}>Cover</Text></View>}
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Add Image by URL</Text>
            <View style={styles.urlInputRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Paste Unsplash/Pexels link here..."
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.urlAddBtn} onPress={addImageUrl}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title <Text style={{ color: '#ef4444' }}>*</Text></Text>
            <TextInput
              style={[styles.input, titleError ? styles.errorInput : null]}
              placeholder="Enter an inspiring title"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (text.trim()) setTitleError('');
              }}
            />
            {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>{cat}</Text>
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
            <Text style={styles.label}>Content <Text style={{ color: '#ef4444' }}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.contentInput, contentError ? styles.errorInput : null]}
              placeholder="Share your experience..."
              value={content}
              onChangeText={(text) => {
                setContent(text);
                if (text.trim()) setContentError('');
              }}
              multiline
            />
            {contentError ? <Text style={styles.errorText}>{contentError}</Text> : null}
          </View>

          {uploadStatus ? (
            <Text style={{ textAlign: 'center', color: Colors.primary, marginBottom: 8, fontWeight: '600' }}>{uploadStatus}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.disabledButton]}
            onPress={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitText}>{editBlog ? 'Update Story' : 'Share Adventure'}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollContent: { padding: 20, paddingTop: 20, paddingBottom: 40, flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  imageSection: { marginBottom: 25 },
  label: { fontSize: 14, fontWeight: 'bold', color: Colors.text, marginBottom: 10 },
  imageGrid: { flexDirection: 'row' },
  addBtn: {
    width: 100, height: 100, borderRadius: 12, backgroundColor: '#f1f5f9',
    justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#cbd5e1', marginRight: 12,
  },
  addBtnText: { color: Colors.primary, fontSize: 12, fontWeight: 'bold', marginTop: 4 },
  imageWrapper: { width: 100, height: 100, marginRight: 12, position: 'relative' },
  previewImage: { width: 100, height: 100, borderRadius: 12 },
  removeBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: '#fff', borderRadius: 10 },
  coverBadge: { position: 'absolute', bottom: 5, left: 5, backgroundColor: Colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  coverText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
  inputGroup: { marginBottom: 20 },
  input: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 15, fontSize: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  urlInputRow: { flexDirection: 'row', alignItems: 'center' },
  urlAddBtn: { backgroundColor: Colors.primary, padding: 12, borderRadius: 10, marginLeft: 10 },
  categoryScroll: { marginTop: 5 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryChipText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  categoryChipTextActive: { color: Colors.white },
  contentInput: { height: 200, textAlignVertical: 'top' },
  submitButton: { backgroundColor: Colors.primary, paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  submitText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
  disabledButton: { opacity: 0.7 },
  errorInput: { borderColor: '#ef4444' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4, marginLeft: 2 },
});

export default CreateBlogScreen;
