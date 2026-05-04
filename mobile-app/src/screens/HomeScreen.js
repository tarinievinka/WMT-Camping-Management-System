import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ImageBackground, 
  FlatList,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import CampsiteCard from '../components/CampsiteCard';
import GuideCard from '../components/GuideCard';
import EquipmentCard from '../components/EquipmentCard';
import Header from '../components/Header';
import apiClient from '../api/apiClient';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [featuredSites, setFeaturedSites] = useState([]);
  const [topGuides, setTopGuides] = useState([]);
  const [gearItems, setGearItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [sitesRes, guidesRes, gearRes] = await Promise.all([
        apiClient.get('/campsites/display'),
        apiClient.get('/guides/display'),
        apiClient.get('/equipment/display')
      ]);

      if (sitesRes.data && sitesRes.data.data) setFeaturedSites(sitesRes.data.data.slice(0, 5));
      if (guidesRes.data && guidesRes.data.data) setTopGuides(guidesRes.data.data.slice(0, 5));
      if (gearRes.data && gearRes.data.data) setGearItems(gearRes.data.data.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching home data:', error);
      // Fallback dummy data for development
      setFeaturedSites([{ _id: '1', name: 'Stargazer\'s Haven', location: 'Yala', status: 'approved', pricePerNight: 13000 }]);
      setTopGuides([{ _id: 'g1', name: 'Alex Rivers', profilePhoto: '', dailyRate: 5000, description: 'Expert guide' }]);
      setGearItems([{ _id: 'e1', name: 'Pro Tent', category: 'Tents', rentalPrice: 1500 }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      >
        {/* Hero Section */}
        <ImageBackground 
          source={require('../../assets/hero-bg.png')} 
          style={styles.hero}
        >
          <View style={styles.heroOverlay}>

            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Gateway to the</Text>
              <Text style={styles.heroTitleHighlight}>Outdoors</Text>
            </View>
          </View>
        </ImageBackground>

        {/* Discover Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Discover Sites</Text>
              <Text style={styles.sectionSubtitle}>Real-time availability</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Store', { activeTab: 'campsites' })}>
              <Text style={styles.viewAll}>View all <Ionicons name="chevron-forward" size={14} /></Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={featuredSites}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <CampsiteCard 
                  item={item} 
                  onPress={() => navigation.navigate('CampsiteDetail', { item })} 
                />
              )}
              contentContainerStyle={styles.horizontalList}
            />
          )}
        </View>

        {/* Top Guides Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Top Guides</Text>
              <Text style={styles.sectionSubtitle}>Professional wilderness experts</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Store', { activeTab: 'guides' })}>
              <Text style={styles.viewAll}>View all <Ionicons name="chevron-forward" size={14} /></Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={topGuides}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <GuideCard 
                  item={item} 
                  onPress={() => navigation.navigate('GuideDetail', { item })} 
                />
              )}
              contentContainerStyle={styles.horizontalList}
            />
          )}
        </View>

        {/* Camping Gear Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Camping Gear</Text>
              <Text style={styles.sectionSubtitle}>Premium rental equipment</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Store', { activeTab: 'gear' })}>
              <Text style={styles.viewAll}>View all <Ionicons name="chevron-forward" size={14} /></Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={gearItems}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <View style={{ width: 220, marginRight: 16 }}>
                  <EquipmentCard 
                    item={item} 
                    onPress={() => navigation.navigate('EquipmentDetail', { item })} 
                    onAddToCart={(gear) => console.log('Added to cart:', gear.name)}
                  />
                </View>
              )}
              contentContainerStyle={styles.horizontalList}
            />
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  hero: {
    width: '100%',
    height: 380, // Reduced height for better mobile feel
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 20,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    backgroundColor: Colors.primary,
    padding: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  logoText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 15,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start', // Left aligned for better mobile readability
    paddingTop: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
  },
  heroTitleHighlight: {
    fontSize: 42,
    fontWeight: '900',
    color: '#10b981',
    marginTop: -5,
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  viewAll: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 13,
  },
  horizontalList: {
    paddingRight: 20,
    paddingBottom: 10,
  }
});

export default HomeScreen;
