import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Shadows } from '../theme/shadows';
import { BASE_URL } from '../api/apiClient';

const CampsiteCard = ({ item, onPress }) => {
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const getForecastColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'sunny': return '#fefce8';
      case 'cloudy': return '#f8fafc';
      case 'rainy': return '#eff6ff';
      default: return '#f0fdf4';
    }
  };

  const getForecastIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'sunny': return 'sunny';
      case 'cloudy': return 'cloudy-night';
      case 'rainy': return 'rainy';
      default: return 'partly-sunny';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: getImageUrl(item.image) || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=500' }} 
          style={styles.image} 
        />
        <View style={styles.liveBadge}>
          <View style={styles.dot} />
          <Text style={styles.liveText}>{item.status || 'LIVE AVAILABILITY'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.price}>Rs. {item.pricePerNight}<Text style={styles.unit}>/night</Text></Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={Colors.gray} />
          <Text style={styles.location}>{item.location}</Text>
        </View>

      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    backgroundColor: Colors.white,
    borderRadius: 24,
    marginRight: 20,
    overflow: 'hidden',
    ...Shadows.medium,
    marginBottom: 10,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  liveBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
    marginRight: 6,
  },
  liveText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    fontSize: 13,
    color: Colors.gray,
    marginLeft: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  unit: {
    fontSize: 11,
    fontWeight: 'normal',
    color: Colors.gray,
  },
});

export default CampsiteCard;
