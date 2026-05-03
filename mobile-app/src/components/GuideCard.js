import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Shadows } from '../theme/shadows';
import { BASE_URL, getImageUrl } from '../api/apiClient';

const GuideCard = ({ item, onPress }) => {

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image 
        source={{ uri: getImageUrl(item.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'Guide')}&background=166534&color=fff&size=200` }} 
        style={styles.avatar} 
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.expertise} numberOfLines={1}>
          {item.specialties?.join(', ') || 'Expert Guide'}
        </Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#f59e0b" />
          <Text style={styles.ratingText}>
            {item.averageRating ? item.averageRating.toFixed(1) : '0.0'} ({item.numReviews || 0})
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.price}>Rs. {item.dailyRate}<Text style={styles.unit}>/day</Text></Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginRight: 15,
    padding: 12,
    alignItems: 'center',
    ...Shadows.small,
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 11,
    color: Colors.gray,
    fontWeight: '600',
  },
  expertise: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 2,
    textAlign: 'center',
  },
  footer: {
    marginTop: 8,
  },
  price: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  unit: {
    fontSize: 10,
    fontWeight: 'normal',
    color: Colors.gray,
  },
});

export default GuideCard;
