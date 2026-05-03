import React, { useState } from 'react';
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

const CustomDropdown = ({ label, value, options, onSelect }) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.dropdownBtn} 
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
    </View>
  );
};

const AddEquipmentScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0],
    condition: CONDITIONS[0],
    rentalPrice: '',
    salePrice: '',
    stockQuantity: 1,
    availabilityStatus: STATUSES[0],
    description: '',
  });
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const handleQuantityChange = (type) => {
    setFormData(prev => {
      let newQ = prev.stockQuantity;
      if (type === 'inc') newQ += 1;
      if (type === 'dec' && newQ > 0) newQ -= 1;
      return { ...prev, stockQuantity: newQ };
    });
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.rentalPrice || !formData.salePrice || formData.stockQuantity < 0) {
      Alert.alert('Error', 'Please fill in all required fields');
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

      await axios.post(`${API_URL}/api/equipment/add`, formDataToSend, {
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
      console.error("Add Equipment Error:", err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.error || 'Failed to add equipment');
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
          <Text style={styles.headerTitle}>Add Equipment</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>EQUIPMENT NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Ultra-Light Alpine Tent"
            placeholderTextColor={Colors.textLight}
            value={formData.name}
            onChangeText={(val) => setFormData({ ...formData, name: val })}
          />
        </View>

        <CustomDropdown
          label="CATEGORY"
          value={formData.category}
          options={CATEGORIES}
          onSelect={(val) => setFormData({ ...formData, category: val })}
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
            <View style={styles.iconInputContainer}>
              <Text style={styles.inputIcon}>LKR</Text>
              <TextInput
                style={styles.iconInput}
                placeholder="0.00"
                placeholderTextColor={Colors.textLight}
                value={formData.rentalPrice}
                onChangeText={(val) => setFormData({ ...formData, rentalPrice: val })}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.label}>SALE PRICE</Text>
            <View style={styles.iconInputContainer}>
              <Text style={styles.inputIcon}>LKR</Text>
              <TextInput
                style={styles.iconInput}
                placeholder="0.00"
                placeholderTextColor={Colors.textLight}
                value={formData.salePrice}
                onChangeText={(val) => setFormData({ ...formData, salePrice: val })}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>INITIAL STOCK</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => handleQuantityChange('dec')}>
              <Feather name="minus" size={20} color={Colors.text} />
            </TouchableOpacity>
            <View style={styles.qtyInputContainer}>
              <TextInput
                style={styles.qtyInput}
                value={formData.stockQuantity.toString()}
                onChangeText={(val) => setFormData({ ...formData, stockQuantity: parseInt(val) || 0 })}
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => handleQuantityChange('inc')}>
              <Feather name="plus" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
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
            style={[styles.input, styles.textArea]}
            placeholder="Describe the equipment details, features, and durability..."
            placeholderTextColor={Colors.textLight}
            value={formData.description}
            onChangeText={(val) => setFormData({ ...formData, description: val })}
            multiline
          />
        </View>

        <Text style={styles.label}>EQUIPMENT PHOTO</Text>
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
                <Ionicons name="close-circle" size={24} color="#ef4444" />
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
            <>
              <Feather name="plus-square" size={20} color={Colors.white} style={{ marginRight: 8 }} />
              <Text style={styles.submitText}>Add Equipment</Text>
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
            <Text style={styles.successTitle}>Equipment Added!</Text>
            <Text style={styles.successSubtitle}>The new item is now available in your management list.</Text>
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
  imageScroll: {
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
    marginRight: 10,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImage: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.white,
    borderRadius: 12,
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
    backgroundColor: '#10b981',
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
});

export default AddEquipmentScreen;
