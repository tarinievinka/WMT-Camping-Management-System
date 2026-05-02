import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { Colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../api/config';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';

const EditGuideScreen = ({ route, navigation }) => {
  const { guide } = route.params || { guide: {} };
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: guide?.name || '',
    email: guide?.email || '',
    phone: guide?.phone || '',
    nic: guide?.nic || '',
    age: guide?.age?.toString() || '',
    dailyRate: guide?.dailyRate?.toString() || '',
    description: guide?.description || '',
    specialization: guide?.specialties?.join(', ') || '',
  });
  const [profilePhoto, setProfilePhoto] = useState(guide?.profilePhoto || null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.IMAGES,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
      base64: true,
    });

    if (!result.canceled && result.assets) {
      const asset = result.assets[0];
      
      if (Platform.OS === 'web') {
        try {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result;
            console.log("[IMAGE_PICKER] Base64 conversion successful. Size:", Math.round(base64data.length / 1024), "KB");
            setProfilePhoto(base64data);
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          console.error("[IMAGE_PICKER] Error converting image to base64:", e);
          Alert.alert("Error", "Failed to process image. Please try a different one.");
        }
      } else {
        const base64 = asset.base64;
        if (base64) {
          setProfilePhoto(`data:image/jpeg;base64,${base64}`);
        } else {
          setProfilePhoto(asset.uri);
        }
      }
    }
  };

  const handleUpdate = async () => {
    const requiredFields = ['name', 'email', 'specialization', 'dailyRate', 'nic', 'age'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      const msg = `Please fill in all required fields: ${missingFields.join(', ')}`;
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Error', msg);
      return;
    }

    // Email validation
    if (formData.email && !formData.email.includes('@')) {
      const msg = 'Please enter a valid email address containing @';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Error', msg);
      return;
    }

    // Phone number validation
    if (formData.phone && (formData.phone.length > 10 || isNaN(formData.phone))) {
      const msg = 'Phone number should not exceed 10 digits and must be numeric';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Error', msg);
      return;
    }

    setIsLoading(true);
    try {
      const guideData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        nic: formData.nic,
        age: parseInt(formData.age) || 0,
        dailyRate: parseFloat(formData.dailyRate) || 0,
        description: formData.description,
        specialties: formData.specialization.split(',').map(s => s.trim()).filter(s => s),
        profilePhoto
      };

      await axios.put(`${API_URL}/api/guides/update/${guide._id}`, guideData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (Platform.OS === 'web') alert('Guide updated successfully!');
      Alert.alert('Success', 'Guide updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error('[EDIT_GUIDE] Update failed:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to update guide';
      if (Platform.OS === 'web') alert(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Guide</Text>
        <TouchableOpacity 
          style={[styles.headerSubmitBtn, isLoading && { opacity: 0.5 }]} 
          onPress={handleUpdate}
          disabled={isLoading}
        >
          <Text style={styles.headerSubmitText}>{isLoading ? '...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <TouchableOpacity style={styles.avatarPicker} onPress={pickImage}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-add" size={30} color="#94a3b8" />
              <Text style={styles.placeholderText}>Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(val) => setFormData({ ...formData, name: val })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(val) => setFormData({ ...formData, email: val })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>NIC *</Text>
            <TextInput
              style={styles.input}
              value={formData.nic}
              onChangeText={(val) => setFormData({ ...formData, nic: val })}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={styles.input}
              value={formData.age}
              onChangeText={(val) => setFormData({ ...formData, age: val })}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Specialization * (comma separated)</Text>
          <TextInput
            style={styles.input}
            value={formData.specialization}
            onChangeText={(val) => setFormData({ ...formData, specialization: val })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Daily Rate (LKR) *</Text>
          <TextInput
            style={styles.input}
            value={formData.dailyRate}
            onChangeText={(val) => setFormData({ ...formData, dailyRate: val })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(val) => setFormData({ ...formData, phone: val })}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description / Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(val) => setFormData({ ...formData, description: val })}
            multiline
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, isLoading && styles.disabledButton]}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>Update Guide Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'android' ? 40 : (Platform.OS === 'ios' ? 50 : 10),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerSubmitBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerSubmitText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarPicker: {
    alignSelf: 'center',
    marginVertical: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 5,
    fontSize: 12,
    color: '#94a3b8',
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
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
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

export default EditGuideScreen;
