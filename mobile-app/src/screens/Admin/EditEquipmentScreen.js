import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform, Modal, FlatList, Keyboard } from 'react-native';
import { Colors } from '../../theme/colors';
import { Ionicons, Feather } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../api/config';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ["Tents", "Sleeping Bags", "Backpacks", "Cooking Gear", "Lighting", "Other"];
const CONDITIONS = ["New", "Good", "Fair", "Poor"];
const STATUSES = ["Available", "Rented", "Out of Stock", "Deactivated"];

const CustomDropdown = ({ label, value, options, onSelect, error }) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={[styles.dropdownBtn, error && styles.inputError]} 
        onPress={() => {
          Keyboard.dismiss();
          setVisible(true);
        }}
      >
        <Text style={styles.dropdownText}>{value}</Text>
        <Feather name="chevron-down" size={20} color={Colors.textLight} />
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { onSelect(item); setVisible(false); }}>
                  <Text style={[styles.modalItemText, value === item && styles.modalItemTextSelected]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const EditEquipmentScreen = ({ navigation, route }) => {
  const { token } = useAuth();
  const { item } = route.params;
  
  const [formData, setFormData] = useState({
    name: item.name || '',
    category: item.category || CATEGORIES[0],
    condition: item.condition || CONDITIONS[0],
    rentalPrice: item.rentalPrice?.toString() || '',
    salePrice: item.salePrice?.toString() || '',
    stockQuantity: item.stockQuantity || 1,
    availabilityStatus: item.availabilityStatus || STATUSES[0],
    description: item.description || '',
  });
  
  const [images, setImages] = useState([]);
  const [currentImageUrl, setCurrentImageUrl] = useState(item.imageUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Equipment name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    
    if (!formData.rentalPrice) {
      newErrors.rentalPrice = 'Required';
    } else if (isNaN(formData.rentalPrice) || parseFloat(formData.rentalPrice) <= 0) {
      newErrors.rentalPrice = 'Invalid price';
    }
    
    if (!formData.salePrice) {
      newErrors.salePrice = 'Required';
    } else if (isNaN(formData.salePrice) || parseFloat(formData.salePrice) <= 0) {
      newErrors.salePrice = 'Invalid price';
    }
    
    if (formData.stockQuantity < 0) {
      newErrors.stockQuantity = 'Quantity cannot be negative';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    // In edit, we either have a new image or an existing one
    if (images.length === 0 && !currentImageUrl) {
      newErrors.images = 'Equipment photo is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.IMAGES,
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setImages([result.assets[0].uri]);
    }
  };

  const handleQuantityChange = (type) => {
    setFormData(prev => {
      let newQ = prev.stockQuantity;
      if (type === 'inc') newQ += 1;
      if (type === 'dec' && newQ > 0) newQ -= 1;
      return { ...prev, stockQuantity: newQ };
    });
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the highlighted fields.');
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('rentalPrice', formData.rentalPrice);
      formDataToSend.append('salePrice', formData.salePrice);
      formDataToSend.append('stockQuantity', formData.stockQuantity);
      formDataToSend.append('availabilityStatus', formData.availabilityStatus);
      formDataToSend.append('description', formData.description);

      if (images.length > 0) {
        const localUri = images[0];
        const filename = localUri.split('/').pop();
        
        if (Platform.OS === 'web') {
          const response = await fetch(localUri);
          const blob = await response.blob();
          formDataToSend.append('image', blob, filename);
        } else {
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;
          formDataToSend.append('image', {
            uri: Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri,
            name: filename,
            type
          });
        }
      }

      await axios.put(`${API_URL}/api/equipment/update/${item._id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigation.navigate('ManageEquipment');
      }, 2000);
    } catch (err) {
      console.error("Update Equipment Error:", err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.error || 'Failed to update equipment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Equipment</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>EQUIPMENT NAME</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="e.g. Ultra-Light Alpine Tent"
            placeholderTextColor={Colors.textLight}
            value={formData.name}
            onChangeText={(val) => {
              setFormData({ ...formData, name: val });
              if (errors.name) setErrors({...errors, name: null});
            }}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <CustomDropdown
          label="CATEGORY"
          value={formData.category}
          options={CATEGORIES}
          onSelect={(val) => setFormData({ ...formData, category: val })}
          error={errors.category}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>CONDITION</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillContainer}>
            {CONDITIONS.map(cond => (
              <TouchableOpacity
                key={cond}
                style={[styles.pill, formData.condition === cond && styles.pillSelected]}
                onPress={() => setFormData({ ...formData, condition: cond })}
              >
                <Text style={[styles.pillText, formData.condition === cond && styles.pillTextSelected]}>
                  {cond}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>RENT PRICE/DAY</Text>
            <View style={[styles.iconInputContainer, errors.rentalPrice && styles.inputError]}>
              <Text style={styles.inputIcon}>LKR</Text>
              <TextInput
                style={styles.iconInput}
                placeholder="0.00"
                placeholderTextColor={Colors.textLight}
                value={formData.rentalPrice}
                onChangeText={(val) => {
                  setFormData({ ...formData, rentalPrice: val });
                  if (errors.rentalPrice) setErrors({...errors, rentalPrice: null});
                }}
                keyboardType="numeric"
              />
            </View>
            {errors.rentalPrice && <Text style={styles.errorText}>{errors.rentalPrice}</Text>}
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.label}>SALE PRICE</Text>
            <View style={[styles.iconInputContainer, errors.salePrice && styles.inputError]}>
              <Text style={styles.inputIcon}>LKR</Text>
              <TextInput
                style={styles.iconInput}
                placeholder="0.00"
                placeholderTextColor={Colors.textLight}
                value={formData.salePrice}
                onChangeText={(val) => {
                  setFormData({ ...formData, salePrice: val });
                  if (errors.salePrice) setErrors({...errors, salePrice: null});
                }}
                keyboardType="numeric"
              />
            </View>
            {errors.salePrice && <Text style={styles.errorText}>{errors.salePrice}</Text>}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>STOCK QUANTITY</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => handleQuantityChange('dec')}>
              <Feather name="minus" size={20} color={Colors.text} />
            </TouchableOpacity>
            <View style={[styles.qtyInputContainer, errors.stockQuantity && styles.inputError]}>
              <TextInput
                style={styles.qtyInput}
                value={formData.stockQuantity.toString()}
                onChangeText={(val) => {
                  setFormData({ ...formData, stockQuantity: parseInt(val) || 0 });
                  if (errors.stockQuantity) setErrors({...errors, stockQuantity: null});
                }}
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => handleQuantityChange('inc')}>
              <Feather name="plus" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
          {errors.stockQuantity && <Text style={styles.errorText}>{errors.stockQuantity}</Text>}
        </View>

        <CustomDropdown
          label="AVAILABILITY STATUS"
          value={formData.availabilityStatus}
          options={STATUSES}
          onSelect={(val) => setFormData({ ...formData, availabilityStatus: val })}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
            placeholder="Describe the equipment details, features, and durability..."
            placeholderTextColor={Colors.textLight}
            value={formData.description}
            onChangeText={(val) => {
              setFormData({ ...formData, description: val });
              if (errors.description) setErrors({...errors, description: null});
            }}
            multiline
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        <Text style={styles.label}>EQUIPMENT PHOTO</Text>
        <View style={styles.photoSection}>
          <TouchableOpacity style={[styles.addImageButton, errors.images && styles.inputError]} onPress={pickImage}>
            <Ionicons name="camera" size={30} color={Colors.primary} />
            <Text style={styles.addImageText}>Change</Text>
          </TouchableOpacity>
          {(images.length > 0 || currentImageUrl) ? (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: images.length > 0 ? images[0] : (currentImageUrl.startsWith('http') ? currentImageUrl : `${API_URL}${currentImageUrl}`) }} 
                style={styles.previewImage} 
              />
            </View>
          ) : (
            <View style={[styles.imageContainer, styles.noImageContainer, errors.images && styles.inputError]}>
               <Feather name="image" size={30} color="#cbd5e1" />
               <Text style={styles.noImageText}>No photo</Text>
            </View>
          )}
        </View>
        {errors.images && <Text style={[styles.errorText, {marginTop: -25, marginBottom: 20}]}>{errors.images}</Text>}

        <TouchableOpacity 
          style={[styles.submitButton, isLoading && styles.disabledButton]}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Feather name="save" size={20} color={Colors.white} style={{ marginRight: 8 }} />
              <Text style={styles.submitText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconBg}>
              <Ionicons name="checkmark" size={40} color={Colors.white} />
            </View>
            <Text style={styles.successTitle}>Changes Saved!</Text>
            <Text style={styles.successSubtitle}>The equipment details have been successfully updated.</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
  },
  dropdownBtn: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: '80%',
    maxHeight: '50%',
    padding: 10,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  modalItemTextSelected: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  pillContainer: {
    flexDirection: 'row',
  },
  pill: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  pillSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#ecfdf5',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  pillTextSelected: {
    color: Colors.primary,
  },
  iconInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  inputIcon: {
    fontSize: 16,
    color: '#94a3b8',
    marginRight: 8,
  },
  iconInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyBtn: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyInputContainer: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyInput: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    width: '100%',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  photoSection: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  addImageButton: {
    width: 80,
    height: 80,
    backgroundColor: Colors.white,
    borderRadius: 8,
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
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  noImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noImageText: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  successIconBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#10b981', // Emerald 500
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
});

export default EditEquipmentScreen;
