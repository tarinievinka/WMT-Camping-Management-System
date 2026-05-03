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
import { useFocusEffect } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import { apiClient, BASE_URL, getImageUrl } from '../../api/apiClient';

const GuideListScreen = ({ navigation }) => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      fetchGuides();
    }, [])
  );

  const fetchGuides = async () => {
    try {
      // Using the same endpoint as your web frontend
      const response = await apiClient.get('/guides/display');
      setGuides(response.data.data || []);
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuides = guides.filter(guide => 
    guide.name?.toLowerCase().includes(search.toLowerCase()) ||
    guide.languages?.some(lang => lang.toLowerCase().includes(search.toLowerCase()))
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('GuideDetail', { item })}
    >
      <View style={styles.cardRow}>
        <Image 
          source={{ uri: getImageUrl(item.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'Guide')}&background=166534&color=fff&size=200` }} 
          style={styles.avatar} 
          resizeMode="cover"
        />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#fbbf24" />
            <Text style={styles.ratingValue}>
              {item.averageRating ? item.averageRating.toFixed(1) : '0.0'}
              <Text style={styles.numReviews}> ({item.numReviews || 0})</Text>
            </Text>
          </View>
          <Text style={styles.expertise} numberOfLines={1}>{item.description}</Text>
          <View style={styles.langContainer}>
            {item.specialties?.map((spec, idx) => (
              <View key={idx} style={styles.langBadge}>
                <Text style={styles.langText}>{spec}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.priceInfo}>
          <Text style={styles.price}>Rs. {item.dailyRate}</Text>
          <Text style={styles.unit}>/day</Text>
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
          placeholder="Search guides..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredGuides}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No guides found.</Text>
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
    color: Colors.text,
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 15,
    padding: 15,
    ...Shadows.small,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  expertise: {
    fontSize: 13,
    color: Colors.gray,
    marginVertical: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
  },
  numReviews: {
    fontSize: 11,
    color: Colors.gray,
    fontWeight: 'normal',
  },
  langContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  langBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
    marginTop: 4,
  },
  langText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  unit: {
    fontSize: 10,
    color: Colors.gray,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: Colors.gray,
    fontSize: 16,
  }
});

export default GuideListScreen;
