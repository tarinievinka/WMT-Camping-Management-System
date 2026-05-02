import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import { BASE_URL } from '../../api/apiClient';

const GuideDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    if (path.startsWith('file:') || path.startsWith('content:')) return null;
    return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Guide Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.profileSection}>
          <Image
            source={{ uri: getImageUrl(item.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'Guide')}&background=166534&color=fff&size=200` }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.expertise}>{item.description?.substring(0, 50) || 'Expert Wilderness Guide'}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>120+</Text>
              <Text style={styles.statLabel}>Tours</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5 yrs</Text>
              <Text style={styles.statLabel}>Exp.</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.bio}>
            {item.description || 'I am a passionate wilderness guide with years of experience leading groups through the most beautiful camping sites. My goal is to ensure your safety while providing an educational and fun experience in the great outdoors.'}
          </Text>

          <Text style={styles.sectionTitle}>Specialties</Text>
          <View style={styles.langContainer}>
            {(item.specialties || ['General Camping']).map((spec, idx) => (
              <View key={idx} style={styles.langBadge}>
                <Text style={styles.langText}>{spec}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Pricing & Booking */}
          <View style={styles.bookingCard}>
            <View>
              <Text style={styles.priceLabel}>Daily Rate</Text>
              <Text style={styles.priceValue}>Rs. {item.dailyRate}</Text>
            </View>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => navigation.navigate('Booking', { item, type: 'guide' })}
            >
              <Text style={styles.bookButtonText}>Book Guide</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#f1f5f9',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  expertise: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 25,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 20,
    ...Shadows.small,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.gray,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#f1f5f9',
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    marginTop: 10,
  },
  bio: {
    fontSize: 15,
    lineHeight: 24,
    color: '#64748b',
    marginBottom: 20,
  },
  langContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  langBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  langText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 20,
  },
  bookingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 20,
    borderRadius: 24,
  },
  priceLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  bookButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default GuideDetailScreen;
