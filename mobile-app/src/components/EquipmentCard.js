import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Shadows } from '../theme/shadows';
import { BASE_URL, getImageUrl } from '../api/apiClient';

const EquipmentCard = ({ item, onPress }) => {

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: getImageUrl(item.imageUrl) || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=300' }} 
          style={styles.image} 
          resizeMode="cover"
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.price}>Rs. {item.rentalPrice}<Text style={styles.unit}>/day</Text></Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginRight: 15,
    overflow: 'hidden',
    ...Shadows.small,
    marginBottom: 10,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  price: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 4,
  },
  unit: {
    fontSize: 10,
    fontWeight: 'normal',
    color: Colors.gray,
  },
});

export default EquipmentCard;
