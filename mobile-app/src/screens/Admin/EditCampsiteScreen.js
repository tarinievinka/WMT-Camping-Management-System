import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Platform, Keyboard } from 'react-native';
import { Colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../api/config';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';

const EditCampsiteScreen = ({ route, navigation }) => {
  const { campsite } = route.params;
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: campsite.name,
    location: campsite.location,
    pricePerNight: (campsite.pricePerNight || campsite.price)?.toString() || '',
    capacity: campsite.capacity?.toString() || '',
    description: campsite.description || '',
    amenities: campsite.amenities?.join(', ') || '',
  });
  const [images, setImages] = useState(campsite.images || []);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.IMAGES,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...newImages]);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.location || !formData.pricePerNight) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('pricePerNight', parseFloat(formData.pricePerNight));
      formDataToSend.append('capacity', parseInt(formData.capacity));
      formDataToSend.append('description', formData.description);
      formDataToSend.append('amenities', JSON.stringify(formData.amenities.split(',').map(a => a.trim()).filter(a => a)));

      // Find the LAST image that is a local URI, as the first one might be a stale blob string from the DB
      const localImages = images.filter(img => img && (img.startsWith('blob:') || img.startsWith('file:') || img.startsWith('data:')));
      const newImage = localImages.length > 0 ? localImages[localImages.length - 1] : null;

      if (newImage) {
        if (Platform.OS === 'web') {
          const res = await fetch(newImage);
          const rawBlob = await res.blob();
          
          const ext = rawBlob.type === 'image/png' ? 'png' : rawBlob.type === 'image/webp' ? 'webp' : 'jpg';
          const fileType = rawBlob.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`;
          
          // Create a new Blob to enforce the correct mime type
          const blob = new Blob([rawBlob], { type: fileType });
          
          formDataToSend.append('image', blob, `campsite.${ext}`);
        } else {
          const filename = newImage.split('/').pop() || 'image.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;
          
          formDataToSend.append('image', {
            uri: Platform.OS === 'android' ? newImage : newImage.replace('file://', ''),
            name: filename,
            type,
          });
        }
      }

      await axios.put(`${API_URL}/api/campsites/update/${campsite._id}`, formDataToSend, {
        headers: {
          ...(Platform.OS !== 'web' && { 'Content-Type': 'multipart/form-data' }),
          Authorization: `Bearer ${token}`
        }
      });
      setSuccessMessage('Campsite updated successfully!');
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err) {
      console.error('[EDIT_CAMPSITE] Update failed:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to update campsite';
      Alert.alert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Campsite</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Campsite Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(val) => setFormData({ ...formData, name: val })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          value={formData.location}
          onChangeText={(val) => setFormData({ ...formData, location: val })}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Price/Night (LKR) *</Text>
          <TextInput
            style={styles.input}
            value={formData.pricePerNight}
            onChangeText={(val) => setFormData({ ...formData, pricePerNight: val })}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Capacity *</Text>
          <TextInput
            style={styles.input}
            value={formData.capacity}
            onChangeText={(val) => setFormData({ ...formData, capacity: val })}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(val) => setFormData({ ...formData, description: val })}
          multiline
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Amenities (comma separated)</Text>
        <TextInput
          style={styles.input}
          value={formData.amenities}
          onChangeText={(val) => setFormData({ ...formData, amenities: val })}
        />
      </View>

      <Text style={styles.label}>Images</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
        <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
          <Ionicons name="camera" size={30} color={Colors.primary} />
          <Text style={styles.addImageText}>Add</Text>
        </TouchableOpacity>
        {images.map((img, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: img }} style={styles.previewImage} />
            <TouchableOpacity 
              style={styles.removeImage}
              onPress={() => setImages(images.filter((_, i) => i !== index))}
            >
              <Ionicons name="close-circle" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {successMessage ? (
        <View style={styles.successMessageContainer}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.successMessageText}>{successMessage}</Text>
        </View>
      ) : null}

      <TouchableOpacity 
        style={[styles.submitButton, isLoading && styles.disabledButton]}
        onPress={handleUpdate}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.submitText}>Update Campsite</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    padding: 20,
    paddingTop: 60,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  imageScroll: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  addImageText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: 'bold',
    marginTop: 5,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImage: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
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
  successMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: 'center',
  },
  successMessageText: {
    color: '#065f46',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default EditCampsiteScreen;
