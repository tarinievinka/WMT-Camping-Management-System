import React, { useState, useRef, useEffect } from 'react';
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
  Image,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import Header from '../components/Header';

const { width } = Dimensions.get('window');

const CATEGORY_DATA = [
  {
    id: '1',
    title: 'Campsites',
    desc: 'Discover breathtaking spots under the stars with real-time availability.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    rating: 4.8,
    target: 'Store',
    tab: 'campsites'
  },
  {
    id: '2',
    title: 'Guides',
    desc: 'Book professional wilderness experts for your next mountain adventure.',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    rating: 4.9,
    target: 'Store',
    tab: 'guides'
  },
  {
    id: '3',
    title: 'Gear',
    desc: 'Rent or buy premium outdoor equipment from our verified store.',
    image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800',
    rating: 4.7,
    target: 'Store',
    tab: 'gear'
  }
];

const HomeScreen = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  // Auto-sliding logic (5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= CATEGORY_DATA.length) {
        nextIndex = 0;
      }
      
      setActiveIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  const onScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveIndex(Math.round(index));
  };

  const renderCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.ratingBox}>
              <Ionicons name="leaf" size={18} color="#166534" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
          <Text style={styles.cardDesc}>{item.desc}</Text>
          <TouchableOpacity 
            style={styles.seeMoreBtn}
            onPress={() => navigation.navigate(item.target, { activeTab: item.tab })}
          >
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Header />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Section */}
        <ImageBackground 
          source={require('../../assets/hero-bg.png')} 
          style={styles.hero}
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Unlock the Wild</Text>
            <Text style={styles.heroSubtitle}>Your all-in-one gateway to the perfect outdoor escape</Text>
            <View style={styles.heroBtnRow}>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Store')}>
                <Text style={styles.primaryBtnText}>Start Exploring</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.navigate('Support')}>
                <Text style={styles.outlineBtnText}>Learn More</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        {/* Brand Story / Description Section - High Contrast with Forest Background */}
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1448375231573-51530ced21fe?w=800' }} 
          style={styles.darkSection}
        >
          <View style={styles.darkSectionOverlay}>
            <View style={styles.greenBadge}>
              <Text style={styles.greenBadgeText}>OUR MISSION</Text>
            </View>
            <Text style={styles.darkSectionText}>
              From discovering breathtaking campsites and booking expert guides to renting or buying premium gear, we handle the logistics so you can focus on the journey.
            </Text>
            {/* Organic Wave Effect */}
            <View style={styles.waveDivider}>
              <Ionicons name="filter" size={100} color="#f8fafc" style={styles.waveIcon} />
            </View>
          </View>
        </ImageBackground>

        {/* Swipeable Cards & Contact Section with Blurred Background */}
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800' }}
          style={styles.mainContentBg}
          blurRadius={15}
        >
          <View style={styles.contentOverlay}>
            <View style={styles.swipeSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Explore Categories</Text>
                <View style={styles.titleUnderline} />
              </View>
              
              <FlatList
                ref={flatListRef}
                data={CATEGORY_DATA}
                renderItem={renderCard}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                keyExtractor={item => item.id}
                snapToAlignment="center"
                getItemLayout={(data, index) => ({
                  length: width,
                  offset: width * index,
                  index,
                })}
              />
              
              {/* Dot Indicators */}
              <View style={styles.indicatorRow}>
                {CATEGORY_DATA.map((_, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.dot, 
                      activeIndex === index && styles.activeDot
                    ]} 
                  />
                ))}
              </View>
            </View>

            {/* NEW: Ready for Adventure Section to fill space */}
            <View style={styles.promoSection}>
              <ImageBackground 
                source={{ uri: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800' }}
                style={styles.promoBg}
                blurRadius={10}
              >
                <View style={styles.promoOverlay}>
                  <Ionicons name="compass-outline" size={40} color="rgba(255,255,255,0.4)" style={{ marginBottom: 15 }} />
                  <Text style={styles.promoTitle}>Ready for Adventure?</Text>
                  <Text style={styles.promoSubtitle}>Every journey starts with a single step. Plan yours today.</Text>
                </View>
              </ImageBackground>
            </View>

            {/* Contact Us Section */}
            <View style={styles.contactSection}>
              <Text style={styles.contactTitle}>Get in Touch</Text>
              <View style={styles.contactRow}>
                <View style={styles.contactItem}>
                  <View style={styles.contactIconBox}>
                    <Ionicons name="mail" size={20} color="#166534" />
                  </View>
                  <Text style={styles.contactText}>camptrail360@gmail.com</Text>
                </View>
                <View style={styles.contactItem}>
                  <View style={styles.contactIconBox}>
                    <Ionicons name="call" size={20} color="#166534" />
                  </View>
                  <Text style={styles.contactText}>+0112255255</Text>
                </View>
              </View>
              <Text style={styles.footerNote}>© 2026 Camptrail 360. All rights reserved.</Text>
            </View>
          </View>
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  hero: {
    width: '100%',
    height: 350,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 30,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
    marginBottom: 30,
    lineHeight: 26,
  },
  heroBtnRow: {
    flexDirection: 'row',
    gap: 15,
  },
  primaryBtn: {
    backgroundColor: '#166534',
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 15,
    elevation: 5,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  outlineBtn: {
    borderWidth: 2,
    borderColor: '#166534',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 15,
  },
  outlineBtnText: {
    color: '#166534',
    fontWeight: 'bold',
    fontSize: 16,
  },
  darkSection: {
    width: '100%',
    overflow: 'hidden',
  },
  darkSectionOverlay: {
    padding: 40,
    backgroundColor: 'rgba(11, 33, 24, 0.9)',
    alignItems: 'center',
    position: 'relative',
  },
  greenBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 20,
  },
  greenBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  darkSectionText: {
    fontSize: 20,
    lineHeight: 32,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  waveDivider: {
    position: 'absolute',
    bottom: -60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  waveIcon: {
    transform: [{ scaleX: 5 }, { rotate: '180deg' }],
    opacity: 0.1,
  },
  contentOverlay: {
    backgroundColor: 'rgba(11, 33, 24, 0.92)', // Much darker overlay for visibility
    paddingBottom: 40,
  },
  swipeSection: {
    paddingTop: 60,
  },
  sectionHeader: {
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: '#fff',
    marginTop: 8,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardContainer: {
    width: width,
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 35,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  cardImage: {
    width: '100%',
    height: 220,
  },
  cardContent: {
    padding: 25,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1e293b',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fefce8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  typeTag: {
    backgroundColor: '#166534',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#854d0e',
    marginLeft: 4,
  },
  cardDesc: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 25,
  },
  seeMoreBtn: {
    backgroundColor: '#166534',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  seeMoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
  },
  activeDot: {
    backgroundColor: '#0b2118',
    width: 24,
  },
  promoSection: {
    marginHorizontal: 25,
    marginTop: 40,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  promoBg: {
    width: '100%',
    height: 180,
  },
  promoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 33, 24, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 5,
  },
  promoSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontWeight: '500',
  },
  contactSection: {
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
  },
  contactTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 25,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  contactRow: {
    width: '100%',
    gap: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contactIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  footerNote: {
    marginTop: 40,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  }
});


export default HomeScreen;
