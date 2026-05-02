import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import apiClient, { BASE_URL } from '../../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileScreen = ({ navigation }) => {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const showStatus = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
  };

  const getFullImageUrl = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path}`;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleUpdate = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);

      if (image) {
        if (Platform.OS === 'web') {
          // On Web, we need to fetch the blob from the URI
          const response = await fetch(image.uri);
          const blob = await response.blob();
          formData.append('profilePicture', blob, image.fileName || 'profile.jpg');
        } else {
          // Mobile logic
          const uri = Platform.OS === 'android' ? image.uri : image.uri.replace('file://', '');
          const filename = image.uri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image`;

          formData.append('profilePicture', {
            uri,
            name: filename,
            type,
          });
        }
      }

      console.log('[PROFILE] Sending update request...');
      const response = await apiClient.put('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('[PROFILE] Update response received:', response.status);
      const updatedUser = response.data;
      
      // Update local storage and context
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setLoading(false); 
      showStatus('success', 'Profile updated successfully!');
      
      Alert.alert(
        'Success ✨', 
        'Your profile has been updated successfully!',
        [{ text: 'Great!', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      setLoading(false);
      console.error('Update Profile Error Details:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Update failed. Please try again.';
      showStatus('error', errorMsg);
      Alert.alert('Update Failed ❌', errorMsg);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await apiClient.delete('/profile');
              Alert.alert('Account Deleted', 'Your account has been successfully removed.', [
                { text: 'OK', onPress: () => logout() }
              ]);
            } catch (error) {
              console.error('Delete Profile Error:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
      >
        {statusMessage.text ? (
          <View style={[
            styles.statusBanner, 
            { backgroundColor: statusMessage.type === 'success' ? '#f0fdf4' : '#fff1f2' }
          ]}>
            <Ionicons 
              name={statusMessage.type === 'success' ? 'checkmark-circle' : 'alert-circle'} 
              size={20} 
              color={statusMessage.type === 'success' ? '#166534' : '#991b1b'} 
            />
            <Text style={[
              styles.statusText, 
              { color: statusMessage.type === 'success' ? '#166534' : '#991b1b' }
            ]}>
              {statusMessage.text}
            </Text>
          </View>
        ) : null}

        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: image ? image.uri : getFullImageUrl(user?.profilePicture) }} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.changeText}>Tap to change photo</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput 
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput 
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            style={[styles.updateButton, loading && styles.disabledButton]} 
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.updateButtonText}>Update Profile</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <Text style={styles.dangerDesc}>Once you delete your account, there is no going back. Please be certain.</Text>
          
          <TouchableOpacity 
            style={[styles.deleteButton, deleting && styles.disabledButton]} 
            onPress={handleDeleteAccount}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color={Colors.danger} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                <Text style={styles.deleteButtonText}>Delete My Account</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginTop: Platform.OS === 'android' ? 25 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  backButton: {
    padding: 4,
  },
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1f5f9',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  changeText: {
    fontSize: 13,
    color: Colors.gray,
    fontWeight: '500',
  },
  form: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
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
    color: Colors.text,
  },
  updateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  dangerZone: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff1f2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 8,
  },
  dangerDesc: {
    fontSize: 13,
    color: '#b91c1c',
    marginBottom: 20,
    lineHeight: 18,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.danger,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: Colors.danger,
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default EditProfileScreen;
