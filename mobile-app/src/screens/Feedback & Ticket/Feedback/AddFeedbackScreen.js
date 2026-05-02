import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  ScrollView,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../theme/colors';
import Header from '../../../components/Header';
import apiClient from '../../../api/apiClient';
import { useAuth } from '../../../context/AuthContext';


import * as ImagePicker from 'expo-image-picker';

const AddFeedbackScreen = ({ route, navigation }) => {
  const { booking, editMode = false } = route.params || {};
  const { user, token } = useAuth();
  
  // State for the new fields
  const [targetType, setTargetType] = useState(editMode ? booking.targetType : 'Campsite');
  const [targetName, setTargetName] = useState(editMode ? booking.targetName : '');
  const [sessionDate, setSessionDate] = useState(editMode ? new Date(booking.sessionDate || Date.now()) : new Date());
  const [rating, setRating] = useState(editMode ? booking.rating : 5);
  const [comment, setComment] = useState(editMode ? (booking.comment || booking.message) : '');
  const [images, setImages] = useState(editMode ? (booking.images || []) : []);
  const [loading, setLoading] = useState(false);

  const getRatingText = (r) => {
    switch(r) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Average';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...selectedImages]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (user?.role === 'admin') {
      Alert.alert('Not Allowed', 'Admins can only view reviews.');
      return;
    }

    if (!comment) {
      Alert.alert('Error', 'Please enter your feedback comment');
      return;
    }

    if (!targetName?.trim()) {
      Alert.alert('Error', 'Please enter what you are reviewing.');
      return;
    }

    setLoading(true);
    console.log('[FRONTEND] Submitting feedback...');
    try {
      const formData = new FormData();
      formData.append('userId', user?._id || user?.id);
      formData.append('targetName', targetName.trim());
      formData.append('targetType', targetType);
      formData.append('rating', String(rating));
      formData.append('comment', comment.trim());
      formData.append('sessionDate', sessionDate.toISOString());

      console.log('[FRONTEND] Feedback Data:', {
        targetName, targetType, rating, comment, sessionDate: sessionDate.toISOString()
      });

      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const uri = images[i];
          if (!uri.startsWith('http')) {
            if (Platform.OS === 'web') {
              // On Web, we need to convert the URI to a Blob
              const response = await fetch(uri);
              const blob = await response.blob();
              console.log(`[FRONTEND] Blob created: ${blob.size} bytes, type: ${blob.type}`);
              formData.append('files', blob, `image_${i}.jpg`);
            } else {
              // On Mobile, use the object format
              const filename = uri.split('/').pop();
              const match = /\.(\w+)$/.exec(filename);
              const type = match ? `image/${match[1]}` : `image/jpeg`;
              formData.append('files', { uri, name: filename, type });
            }
            console.log(`[FRONTEND] Attaching image ${i}`);
          }
        }
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      if (Platform.OS !== 'web') {
        config.headers['Content-Type'] = 'multipart/form-data';
      }

      const url = editMode ? `/feedback/update/${booking._id}` : '/feedback/create';
      console.log(`[FRONTEND] Sending ${editMode ? 'PUT' : 'POST'} to ${url}`);

      const response = await apiClient({
        method: editMode ? 'put' : 'post',
        url: url,
        data: formData,
        ...config
      });

      console.log('[FRONTEND] Submission Response:', response.data);
      
      const successMsg = `Feedback ${editMode ? 'updated' : 'submitted'} successfully!`;
      
      if (Platform.OS === 'web') {
        window.alert(successMsg);
        navigation.navigate('Main', { 
          screen: 'Support', 
          params: { activeTab: 'feedback', refreshAt: Date.now() } 
        });
      } else {
        Alert.alert('Success', successMsg, [
          { text: 'OK', onPress: () => navigation.navigate('Main', { 
            screen: 'Support', 
            params: { activeTab: 'feedback', refreshAt: Date.now() } 
          }) }
        ]);
      }

    } catch (error) {
      console.error('[FRONTEND] Error submitting feedback:', error);
      console.error('[FRONTEND] Error Details:', error?.response?.data || error.message);
      Alert.alert('Error', error?.response?.data?.error || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <View>
            <Text style={styles.mainTitle}>Share Your Adventure</Text>
            <Text style={styles.subTitle}>Your feedback helps the camping community grow.</Text>
          </View>
        </View>

        <View style={styles.card}>
          {/* Entity Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>WHAT ARE YOU REVIEWING?</Text>
            <View style={styles.pickerContainer}>
              <Ionicons name="location-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.pickerInput}
                placeholder="Select a campsite, equipment, or guide..."
                value={targetName}
                onChangeText={setTargetName}
              />
              <Ionicons name="chevron-down" size={20} color="#94a3b8" />
            </View>
            <View style={styles.typeToggle}>
              {['Campsite', 'Equipment', 'Guide'].map((type) => (
                <TouchableOpacity 
                  key={type}
                  style={[styles.typeBtn, targetType === type && styles.typeBtnActive]}
                  onPress={() => setTargetType(type)}
                >
                  <Text style={[styles.typeText, targetType === type && styles.typeTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date Picker (Simple Input for now) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>WHEN WAS YOUR SESSION?</Text>
            <View style={styles.dateContainer}>
              <TextInput
                style={styles.dateInput}
                placeholder="dd/mm/yyyy"
                value={sessionDate.toLocaleDateString()}
                editable={false}
              />
              <Ionicons name="calendar-outline" size={20} color="#0f172a" />
            </View>
          </View>

          {/* Rating */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>HOW WAS YOUR EXPERIENCE?</Text>
            <View style={styles.ratingRow}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Ionicons 
                      name={star <= rating ? "star" : "star-outline"} 
                      size={32} 
                      color={star <= rating ? "#15803d" : "#e2e8f0"} 
                      style={styles.star}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingLabel}>{getRatingText(rating)}</Text>
            </View>
          </View>

          {/* Comment */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>WRITE YOUR REVIEW</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Tell us about the atmosphere, facilities, or the quality of the gear..."
              multiline
              numberOfLines={6}
              value={comment}
              onChangeText={setComment}
            />
          </View>

          {/* Photo Placeholder */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ADD PHOTOS (OPTIONAL)</Text>
            
            {images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewList}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image source={{ uri: uri.startsWith('http') ? uri : uri }} style={styles.imagePreview} />
                    <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.photoUpload} onPress={pickImage}>
              <Ionicons name="cloud-upload-outline" size={32} color="#15803d" />
              <Text style={styles.uploadText}>
                {images.length > 0 ? 'Add more photos' : 'Drag and drop your photos here or '}
                <Text style={styles.browseText}>Browse files</Text>
              </Text>
              <Text style={styles.uploadLimit}>JPG, PNG UP TO 10MB</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerInfo}>
             <Ionicons name="information-circle-outline" size={16} color="#64748b" />
             <Text style={styles.footerInfoText}>Your review will be public and linked to your profile.</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.disabledBtn]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Submitting...' : editMode ? 'Update Review' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 24,
    marginTop: 10,
  },
  backBtn: {
    marginRight: 15,
    marginTop: 4,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  subTitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#f8fafc',
  },
  pickerInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    paddingLeft: 8,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  typeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeBtnActive: {
    backgroundColor: '#15803d',
    borderColor: '#15803d',
  },
  typeText: {
    fontSize: 12,
    color: '#64748b',
  },
  typeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#f8fafc',
  },
  dateInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    marginHorizontal: 2,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    height: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 14,
  },
  photoUpload: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  uploadText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginTop: 12,
  },
  browseText: {
    color: '#15803d',
    fontWeight: 'bold',
  },
  uploadLimit: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 8,
    fontWeight: '600',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerInfoText: {
    fontSize: 12,
    color: '#64748b',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 20,
    marginBottom: 40,
  },
  cancelText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: '#15803d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  imagePreviewList: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  imagePreviewContainer: {
    marginRight: 10,
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 10,
  }
});


export default AddFeedbackScreen;
