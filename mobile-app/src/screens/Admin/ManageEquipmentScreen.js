import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const ManageEquipmentScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  useFocusEffect(
    useCallback(() => {
      fetchEquipment();
    }, [])
  );

  const fetchEquipment = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/equipment/display`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEquipment(response.data.data || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch equipment');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = (id) => {
    const performDelete = async () => {
      try {
        const response = await axios.delete(`${API_URL}/api/equipment/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.status === 200) {
          setEquipment(prev => prev.filter(e => e._id !== id));
          Alert.alert('Success', 'Equipment deleted successfully');
        }
      } catch (err) {
        console.error("Delete Error:", err.response?.data || err.message);
        Alert.alert('Error', 'Failed to delete equipment');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this item?')) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Equipment',
        'Are you sure you want to delete this item?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete }
        ]
      );
    }
  };

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'new': return Colors.primary;
      case 'good': return '#d97706'; // orange
      case 'fair': return '#475569'; // gray
      case 'poor': return '#ef4444'; // red
      default: return Colors.primary;
    }
  };

  const renderItem = ({ item }) => {
    const isLowStock = item.stockQuantity <= 5;
    const maxStock = Math.max(item.stockQuantity, 15); // dummy max for progress bar
    const progressPercent = (item.stockQuantity / maxStock) * 100;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.categoryText}>{item.category?.toUpperCase() || 'EQUIPMENT'}</Text>
          <Text style={[styles.conditionText, { color: getConditionColor(item.condition) }]}>
            {item.condition || 'New'}
          </Text>
        </View>

        <Text style={styles.cardTitle}>{item.name}</Text>

        <View style={styles.priceRow}>
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>Rent Price</Text>
            <View style={styles.priceValueContainer}>
              <View style={styles.rentBadge}>
                <Text style={styles.badgeText}>RENT</Text>
              </View>
              <Text style={styles.priceValue}>LKR {item.rentalPrice}/day</Text>
            </View>
          </View>
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>Buy Price</Text>
            <View style={styles.priceValueContainer}>
              <View style={styles.buyBadge}>
                <Text style={styles.badgeText}>BUY</Text>
              </View>
              <Text style={styles.priceValue}>LKR {item.salePrice}</Text>
            </View>
          </View>
        </View>
        
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${API_URL}${item.imageUrl}` }} 
            style={styles.cardImage} 
            resizeMode="cover"
            onError={(e) => {
              // Hide image if URL is broken
              setEquipment(prev => prev.map(eq => 
                eq._id === item._id ? { ...eq, imageUrl: '' } : eq
              ));
            }}
          />
        ) : null}

        <View style={styles.stockInfo}>
          {isLowStock ? (
            <View style={styles.lowStockContainer}>
              <Ionicons name="warning-outline" size={14} color="#ef4444" />
              <Text style={styles.lowStockText}>Low stock</Text>
            </View>
          ) : (
            <Text style={styles.stockLabel}>Stock Available</Text>
          )}
          <Text style={styles.stockCount}>{item.stockQuantity} / {maxStock}</Text>
        </View>
        
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${progressPercent}%`, backgroundColor: isLowStock ? '#ef4444' : Colors.primary }
            ]} 
          />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => navigation.navigate('EditEquipment', { item })}>
            <Text style={styles.editBtn}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteItem(item._id)}>
            <Text style={styles.deleteBtn}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addBtnTop}
          onPress={() => navigation.navigate('AddEquipment')}
        >
          <Feather name="plus" size={20} color={Colors.white} />
          <Text style={styles.addBtnTextTop}>Add New Equipment</Text>
        </TouchableOpacity>
      </View>



      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={equipment}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No equipment found.</Text>}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: '#f8fafc',
  },
  backButton: {
    marginBottom: 15,
  },
  addBtnTop: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  addBtnTextTop: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: Colors.primary,
  },
  list: {
    padding: 20,
    paddingTop: 10,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  priceColumn: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 6,
  },
  priceValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rentBadge: {
    backgroundColor: '#065f46',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  buyBadge: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  lowStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lowStockText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  stockCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  editBtn: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 20,
  },
  deleteBtn: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginVertical: 12,
    backgroundColor: '#f1f5f9',
  },
  loader: {
    marginTop: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    color: '#94a3b8',
    fontSize: 16,
  },
});

export default ManageEquipmentScreen;
