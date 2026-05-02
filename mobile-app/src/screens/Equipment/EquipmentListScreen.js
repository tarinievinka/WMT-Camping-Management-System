import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  SafeAreaView
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import { apiClient, BASE_URL } from '../../api/apiClient';

const EquipmentListScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await apiClient.get('/equipment/display');
      setItems(response.data.data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase())
  );

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('EquipmentDetail', { item })}
    >
      <Image 
        source={{ uri: getImageUrl(item.imageUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'E')}&background=166534&color=fff&size=256` }} 
        style={styles.image} 
      />
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>Rs. {item.rentalPrice}<Text style={styles.unit}>/day</Text></Text>
          <View style={styles.rentButton}>
            <Text style={styles.rentText}>Details</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={Colors.gray} />
        <TextInput 
          style={styles.searchBar}
          placeholder="Search gear..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No equipment found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 20,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    margin: 15,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 10,
    fontSize: 15,
  },
  list: {
    padding: 15,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: Colors.white,
    width: '48%',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    ...Shadows.small,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#f1f5f9',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  category: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 2,
  },
  footer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  unit: {
    fontSize: 10,
    fontWeight: 'normal',
    color: Colors.gray,
  },
  rentButton: {
    backgroundColor: Colors.primary,
    padding: 6,
    borderRadius: 8,
  },
  rentText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: Colors.gray,
    fontSize: 16,
  }
});

export default EquipmentListScreen;
