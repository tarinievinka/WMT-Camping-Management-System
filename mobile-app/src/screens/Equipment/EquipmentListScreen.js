import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput, 
  SafeAreaView, 
  ScrollView, 
  Platform 
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import apiClient, { getImageUrl } from '../../api/apiClient';
import EquipmentCard from '../../components/EquipmentCard';

const CATEGORIES = ['All Gear', 'Tents', 'Sleeping', 'Cooking', 'Lighting', 'Clothing'];

const EquipmentListScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Gear');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await apiClient.get('/equipment/display');
      setItems(response.data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(search.toLowerCase()) ||
                         item.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All Gear' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const renderHeader = () => (
    <View>
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={Colors.gray} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchBar}
          placeholder="Search gear..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.categoryBtn, activeCategory === cat && styles.activeCategoryBtn]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.categoryBtnText, activeCategory === cat && styles.activeCategoryBtnText]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <EquipmentCard 
                item={item} 
                onPress={() => navigation.navigate('EquipmentDetail', { item })} 
              />
            </View>
          )}
          keyExtractor={item => item._id}
          numColumns={2}
          ListHeaderComponent={renderHeader()}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={60} color="#cbd5e1" />
              <Text style={styles.emptyText}>No equipment found.</Text>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    margin: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  categoryScroll: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 10,
  },
  activeCategoryBtn: {
    backgroundColor: Colors.primary,
  },
  categoryBtnText: {
    color: Colors.gray,
    fontWeight: '600',
  },
  activeCategoryBtnText: {
    color: '#fff',
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    flex: 0.5,
    padding: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    color: Colors.gray,
    fontSize: 16,
  },
});

export default EquipmentListScreen;
