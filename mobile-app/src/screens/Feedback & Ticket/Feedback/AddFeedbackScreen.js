import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  Image,
  ScrollView,
  Platform
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
  
  const [targetType, setTargetType] = useState(booking?.targetType || 'Campsite');
  const [targetName, setTargetName] = useState(booking?.targetName || '');
  const [sessionDate, setSessionDate] = useState(booking?.sessionDate ? new Date(booking.sessionDate) : new Date());
  const [rating, setRating] = useState(editMode ? booking.rating : 5);
  const [comment, setComment] = useState(editMode ? (booking.comment || booking.message) : '');
  const [images, setImages] = useState(editMode ? (booking.images || []) : []);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const isLocked = !!booking?.targetId || editMode;

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
      if (Platform.OS === 'web') window.alert('Sorry, we need camera roll permissions!');
      else Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions!');
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
      if (Platform.OS === 'web') window.alert('Admins can only view reviews.');
      else Alert.alert('Not Allowed', 'Admins can only view reviews.');
      return;
    }

    const newErrors = {};
    if (!comment || comment.trim().length < 10) {
      newErrors.comment = 'Please enter at least 10 characters for your review.';
    }
    if (!targetName?.trim()) {
      newErrors.targetName = 'Please select or enter the item you are reviewing.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('userId', user?._id || user?.id);
      formData.append('targetName', targetName.trim());
      formData.append('targetType', targetType);
      
      const targetId = booking?.targetId || booking?._id || booking?.target?._id || booking?.target;
      if (targetId && targetId !== 'undefined') {
        formData.append('targetId', String(targetId));
      }
      formData.append('rating', String(rating));
      formData.append('comment', comment.trim());
      formData.append('sessionDate', sessionDate.toISOString());

      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const uri = images[i];
          if (!uri.startsWith('http')) {
            if (Platform.OS === 'web') {
              const response = await fetch(uri);
              const blob = await response.blob();
              formData.append('files', blob, `image_${i}.jpg`);
            } else {
              const filename = uri.split('/').pop();
              const match = /\.(\w+)$/.exec(filename);
              const type = match ? `image/${match[1]}` : `image/jpeg`;
              formData.append('files', { uri, name: filename, type });
            }
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
      await apiClient({
        method: editMode ? 'put' : 'post',
        url: url,
        data: formData,
        ...config
      });

      const successMsg = `Feedback ${editMode ? 'updated' : 'submitted'} successfully!`;
      if (Platform.OS === 'web') {
        window.alert(successMsg);
        navigation.navigate('Main', { screen: 'Support', params: { activeTab: 'feedback', refreshAt: Date.now() } });
      } else {
        Alert.alert('Success', successMsg, [
          { text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Support', params: { activeTab: 'feedback', refreshAt: Date.now() } }) }
        ]);
      }
    } catch (error) {
      const errMsg = error?.response?.data?.error || 'Failed to submit feedback.';
      if (Platform.OS === 'web') window.alert(errMsg);
      else Alert.alert('Error', errMsg);
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
          <View style={styles.inputGroup}>
            <Text style={styles.label}>WHAT ARE YOU REVIEWING?</Text>
            <View style={styles.pickerContainer}>
              <Ionicons name="location-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={[styles.pickerInput, isLocked && styles.disabledInput]}
                placeholder="Select a campsite, equipment, or guide..."
                value={targetName}
                onChangeText={setTargetName}
                editable={!isLocked}
              />
              {!isLocked && <Ionicons name="chevron-down" size={20} color="#94a3b8" />}
            </View>
            {errors.targetName && <Text style={styles.errorText}>{errors.targetName}</Text>}
            {!isLocked && (
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
            )}
          </View>

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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>WRITE YOUR REVIEW</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Tell us about the atmosphere, facilities..."
              multiline
              numberOfLines={6}
              value={comment}
              onChangeText={(text) => {
                setComment(text);
                if (errors.comment) setErrors({ ...errors, comment: null });
              }}
            />
            {errors.comment && <Text style={styles.errorText}>{errors.comment}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ADD PHOTOS (OPTIONAL)</Text>
            {images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewList}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image source={{ uri }} style={styles.imagePreview} />
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
                {images.length > 0 ? 'Add more photos' : 'Click here to upload photos'}
              </Text>
            </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', marginBottom: 24, marginTop: 10 },
  backBtn: { marginRight: 15, marginTop: 4 },
  mainTitle: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  subTitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 10, letterSpacing: 0.5 },
  pickerContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, height: 50, backgroundColor: '#f8fafc' },
  pickerInput: { flex: 1, fontSize: 14, color: '#0f172a', paddingLeft: 8 },
  disabledInput: { color: '#94a3b8', backgroundColor: 'transparent' },
  typeToggle: { flexDirection: 'row', gap: 8, marginTop: 10 },
  typeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  typeBtnActive: { backgroundColor: '#15803d', borderColor: '#15803d' },
  typeText: { fontSize: 12, color: '#64748b' },
  typeTextActive: { color: '#fff', fontWeight: '600' },
  dateContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, height: 50, backgroundColor: '#f8fafc' },
  dateInput: { flex: 1, fontSize: 14, color: '#0f172a' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  stars: { flexDirection: 'row', gap: 4 },
  star: { marginHorizontal: 2 },
  ratingLabel: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  textArea: { backgroundColor: '#fff', borderRadius: 8, padding: 15, height: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: '#e2e8f0', fontSize: 14 },
  photoUpload: { borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed', borderRadius: 12, padding: 30, alignItems: 'center', backgroundColor: '#f8fafc' },
  uploadText: { fontSize: 14, color: '#475569', textAlign: 'center', marginTop: 12 },
  actionButtons: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 20, marginBottom: 40 },
  cancelText: { color: '#64748b', fontWeight: '600', fontSize: 15 },
  submitBtn: { backgroundColor: '#15803d', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, minWidth: 140, alignItems: 'center' },
  disabledBtn: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  imagePreviewList: { marginBottom: 10, flexDirection: 'row' },
  imagePreviewContainer: { marginRight: 10, position: 'relative' },
  imagePreview: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#e2e8f0' },
  removeImageBtn: { position: 'absolute', top: -8, right: -8, backgroundColor: '#fff', borderRadius: 10 },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4, fontWeight: '500' }
});

export default AddFeedbackScreen;
