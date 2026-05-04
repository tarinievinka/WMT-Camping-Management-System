import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Platform, SafeAreaView } from 'react-native';
import { Colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../api/config';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';

const GuideProfileScreen = ({ navigation }) => {
  const { user, token } = useAuth();
  const [guideData, setGuideData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialties: '',
    dailyRate: '',
    description: '',
    experience: '',
    tagline: '',
    languages: '',
    skills: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const fetchMyProfile = async () => {
    try {
      // Find the guide profile linked to this user's email
      const response = await axios.get(`${API_URL}/api/guides/display`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const guides = response.data.data || (Array.isArray(response.data) ? response.data : []);
      const myProfile = guides.find(g => g.email === user.email);
      
      if (myProfile) {
        setGuideData(myProfile);
        setFormData({
          name: myProfile.name || '',
          phone: myProfile.phone || '',
          specialties: myProfile.specialties?.join(', ') || '',
          dailyRate: myProfile.dailyRate?.toString() || '',
          description: myProfile.description || '',
          experience: myProfile.experience?.toString() || '',
          tagline: myProfile.tagline || '',
          languages: myProfile.languages?.join(', ') || '',
          skills: myProfile.skills?.join(', ') || '',
        });
        setProfilePhoto(myProfile.profilePhoto || null);
        setGallery(myProfile.gallery || []);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch profile details');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.IMAGES,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
    });

    if (!result.canceled && result.assets) {
      const asset = result.assets[0];
      if (Platform.OS === 'web') {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => setProfilePhoto(reader.result);
        reader.readAsDataURL(blob);
      } else {
        setProfilePhoto(asset.uri);
      }
    }
  };

  const pickGalleryImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.IMAGES,
      allowsEditing: true,
      quality: 0.4,
    });

    if (!result.canceled && result.assets) {
      const asset = result.assets[0];
      if (Platform.OS === 'web') {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => setGallery([...gallery, reader.result]);
        reader.readAsDataURL(blob);
      } else {
        setGallery([...gallery, asset.uri]);
      }
    }
  };

  const removeGalleryImage = (index) => {
    const newGallery = [...gallery];
    newGallery.splice(index, 1);
    setGallery(newGallery);
  };

  const handleUpdate = async () => {
    if (!guideData) return;
    
    // Validation
    const requiredFields = ['name', 'phone', 'specialties', 'dailyRate'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      const msg = `Please fill in all required fields: ${missingFields.join(', ')}`;
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Error', msg);
      return;
    }

    if (formData.phone && (formData.phone.length > 10 || isNaN(formData.phone))) {
      const msg = 'Phone number should not exceed 10 digits and must be numeric';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Error', msg);
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        ...formData,
        dailyRate: parseFloat(formData.dailyRate),
        experience: parseInt(formData.experience) || 0,
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
        languages: formData.languages.split(',').map(s => s.trim()).filter(s => s),
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        profilePhoto,
        gallery
      };

      await axios.put(`${API_URL}/api/guides/update/${guideData._id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.avatarPicker} onPress={pickImage}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="camera" size={30} color="#94a3b8" />
              <Text style={styles.placeholderText}>Upload Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Profile Tagline (Key Description)</Text>
          <TextInput
            style={styles.input}
            value={formData.tagline}
            onChangeText={(val) => setFormData({ ...formData, tagline: val })}
            placeholder="e.g. Solo Hiker and Trail Expert"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(val) => setFormData({ ...formData, name: val })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Specialties (comma separated)</Text>
          <TextInput
            style={styles.input}
            value={formData.specialties}
            onChangeText={(val) => setFormData({ ...formData, specialties: val })}
            placeholder="e.g. Hiking, Camping, Photography"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Daily Rate (LKR)</Text>
          <TextInput
            style={styles.input}
            value={formData.dailyRate}
            onChangeText={(val) => setFormData({ ...formData, dailyRate: val })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Years of Experience</Text>
          <TextInput
            style={styles.input}
            value={formData.experience}
            onChangeText={(val) => setFormData({ ...formData, experience: val })}
            keyboardType="numeric"
            placeholder="e.g. 5"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Languages (comma separated)</Text>
          <TextInput
            style={styles.input}
            value={formData.languages}
            onChangeText={(val) => setFormData({ ...formData, languages: val })}
            placeholder="e.g. English, Sinhala, Tamil"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Other Skills (comma separated)</Text>
          <TextInput
            style={styles.input}
            value={formData.skills}
            onChangeText={(val) => setFormData({ ...formData, skills: val })}
            placeholder="e.g. First Aid, Navigation, Cooking"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio / Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(val) => setFormData({ ...formData, description: val })}
            multiline
            placeholder="Tell us about yourself..."
          />
        </View>

        {/* Gallery Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Past Tours Gallery</Text>
          <View style={styles.galleryGrid}>
            {gallery.map((img, index) => (
              <View key={index} style={styles.galleryItem}>
                <Image source={{ uri: img }} style={styles.galleryImage} />
                <TouchableOpacity 
                  style={styles.removeImage} 
                  onPress={() => removeGalleryImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addGalleryItem} onPress={pickGalleryImage}>
              <Ionicons name="add" size={30} color="#94a3b8" />
              <Text style={{ fontSize: 10, color: '#94a3b8' }}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.disabled]} 
          onPress={handleUpdate}
          disabled={isSaving}
        >
          {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  viewPublicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 20,
    gap: 8,
  },
  viewPublicText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  avatarPicker: {
    alignSelf: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 5,
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
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.7,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  galleryItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f1f5f9',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  removeImage: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addGalleryItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  }
});

export default GuideProfileScreen;
