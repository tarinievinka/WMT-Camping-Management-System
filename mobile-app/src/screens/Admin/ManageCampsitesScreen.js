import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { Platform } from 'react-native';

const ManageCampsitesScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [campsites, setCampsites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchCampsites();
    }, [])
  );

  const fetchCampsites = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/campsites/display`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampsites(response.data.data || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch campsites');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCampsite = (id) => {
    const performDelete = async () => {
      try {
        await axios.delete(`${API_URL}/api/campsites/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCampsites(prev => prev.filter(c => c._id !== id));
        if (Platform.OS === 'web') {
          alert('Campsite deleted successfully');
        } else {
          Alert.alert('Success', 'Campsite deleted successfully');
        }
      } catch (err) {
        if (Platform.OS === 'web') {
          alert('Failed to delete campsite');
        } else {
          Alert.alert('Error', 'Failed to delete campsite');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete this campsite?')) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Campsite',
        'Are you sure you want to delete this campsite?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete }
        ]
      );
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=60';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: getImageUrl(item.image || item.images?.[0]) }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.location}</Text>
        <Text style={styles.cardPrice}>LKR {item.pricePerNight || item.price}/night</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditCampsite', { campsite: item })}
        >
          <Ionicons name="pencil" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => deleteCampsite(item._id)}
        >
          <Ionicons name="trash" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Campsites</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCampsite')}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={campsites}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No campsites found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 10,
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 15,
    marginBottom: 15,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  loader: {
    marginTop: 50,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: Colors.textLight,
  },
});

export default ManageCampsitesScreen;
