import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { Colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../api/config';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';

const AddCampsiteScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    pricePerNight: '',
    capacity: '',
    description: '',
    amenities: '',
  });
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleCreate = async () => {
    if (!formData.name || !formData.location || !formData.pricePerNight || !formData.capacity) {
      Alert.alert('Error', 'Please fill in required fields (Name, Location, Price, Capacity)');
      return;
    }

    setIsLoading(true);
    try {
      const campsiteData = {
        ...formData,
        pricePerNight: parseFloat(formData.pricePerNight),
        capacity: parseInt(formData.capacity),
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80']
      };

      await axios.post(`${API_URL}/api/campsites/add`, campsiteData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      Alert.alert('Success', 'Campsite added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to add campsite');
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
        <Text style={styles.headerTitle}>Add New Campsite</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Campsite Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. River Side Camping"
          value={formData.name}
          onChangeText={(val) => setFormData({ ...formData, name: val })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Kitulgala"
          value={formData.location}
          onChangeText={(val) => setFormData({ ...formData, location: val })}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Price/Night (LKR) *</Text>
          <TextInput
            style={styles.input}
            placeholder="5000"
            value={formData.pricePerNight}
            onChangeText={(val) => setFormData({ ...formData, pricePerNight: val })}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Capacity *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 10"
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
          placeholder="Describe the campsite..."
          value={formData.description}
          onChangeText={(val) => setFormData({ ...formData, description: val })}
          multiline
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Amenities (comma separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="WiFi, Fire Pit, Parking"
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

      <TouchableOpacity 
        style={[styles.submitButton, isLoading && styles.disabledButton]}
        onPress={handleCreate}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.submitText}>Create Campsite</Text>
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
});

export default AddCampsiteScreen;
