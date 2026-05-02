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
import { apiClient, BASE_URL, getImageUrl } from '../../api/apiClient';

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
                onAddToCart={(gear) => console.log('Add to cart:', gear.name)}
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
  header: {
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    margin: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  categoryScroll: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  activeCategoryBtn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  activeCategoryBtnText: {
    color: '#fff',
  },
  list: {
    paddingBottom: 40,
    paddingHorizontal: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    flex: 1,
    padding: 8,
    maxWidth: '50%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 15,
    fontWeight: '600',
  }
});

export default EquipmentListScreen;
