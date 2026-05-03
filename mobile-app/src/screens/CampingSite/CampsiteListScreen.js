import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import apiClient from '../../api/apiClient';
import CampsiteCard from '../../components/CampsiteCard';

const CampsiteListScreen = ({ navigation }) => {
  const [campsites, setCampsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      fetchCampsites();
    }, [])
  );

  const fetchCampsites = async () => {
    try {
      const response = await apiClient.get('/campsites/display');
      setCampsites(response.data.data || []);
    } catch (error) {
      console.error('Error fetching campsites:', error);
      // Fallback data if API fails or for demo
      setCampsites([
        { _id: '1', name: 'Pine Ridge Sanctuary', location: 'Oregon, USA', status: 'LIVE AVAILABILITY', forecast: 'Sunny, 24°C', forecastType: 'sunny' },
        { _id: '2', name: 'Emerald Lake Basecamp', location: 'British Columbia, CA', status: '2 SPOTS LEFT', forecast: 'Partly Cloudy, 18°C', forecastType: 'cloudy' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampsites = campsites.filter(site => 
    site.name?.toLowerCase().includes(search.toLowerCase()) ||
    site.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={Colors.gray} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchBar}
          placeholder="Search sites..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredCampsites}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <CampsiteCard 
                item={item} 
                onPress={() => navigation.navigate('CampsiteDetail', { item })} 
              />
            </View>
          )}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No campsites found.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: Colors.white,
  },
  backButton: {
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: 25,
    width: '100%',
    alignItems: 'center', // Centers the card which has fixed width
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: Colors.gray,
    fontSize: 16,
  }
});

export default CampsiteListScreen;
