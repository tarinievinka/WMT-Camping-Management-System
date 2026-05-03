import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import apiClient, { BASE_URL, getImageUrl } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

const GuideDetailScreen = ({ route, navigation }) => {
  const { item } = route.params || {};
  const [guideData, setGuideData] = useState(item || null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const { user } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      fetchGuideData();
      fetchReviews();
    }, [])
  );

  const fetchGuideData = async () => {
    try {
      const endpoint = item ? `/guides/update/${item._id}` : `/guides/me`;
      const response = await apiClient.get(endpoint);
      if (response.data) {
        setGuideData(response.data);
      }
    } catch (error) {
      console.error('Error fetching guide data:', error);
    }
  };

  const fetchReviews = async () => {
    if (!guideData?._id && !item?._id) return;
    try {
      const id = guideData?._id || item?._id;
      const response = await apiClient.get(`/feedback/display?targetId=${id}&targetType=Guide`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };



  if (!guideData) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const isOwnProfile = user?.email === guideData?.email;

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
            source={{ uri: getImageUrl(guideData.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(guideData.name || 'Guide')}&background=166534&color=fff&size=200` }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <Text style={styles.name}>{guideData.name}</Text>
          <Text style={styles.expertise}>{guideData.description?.substring(0, 50) || 'Expert Wilderness Guide'}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {guideData.averageRating ? guideData.averageRating.toFixed(1) : '0.0'}
              </Text>
              <Text style={styles.statLabel}>Rating ({guideData.numReviews || 0})</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{guideData.experience || '5'}+ yrs</Text>
              <Text style={styles.statLabel}>Exp.</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{guideData.age || '25'}</Text>
              <Text style={styles.statLabel}>Age</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.bio}>
            {guideData.description || 'I am a passionate wilderness guide with years of experience leading groups through the most beautiful camping sites. My goal is to ensure your safety while providing an educational and fun experience in the great outdoors.'}
          </Text>

          <Text style={styles.sectionTitle}>Specialties</Text>
          <View style={styles.langContainer}>
            {(guideData.specialties && guideData.specialties.length > 0 ? guideData.specialties : ['General Camping']).map((spec, idx) => (
              <View key={idx} style={styles.langBadge}>
                <Text style={styles.langText}>{spec}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.langContainer}>
            {(guideData.languages && guideData.languages.length > 0 ? guideData.languages : ['English']).map((lang, idx) => (
              <View key={idx} style={[styles.langBadge, { backgroundColor: '#eef2ff' }]}>
                <Text style={[styles.langText, { color: '#4f46e5' }]}>{lang}</Text>
              </View>
            ))}
          </View>

          {guideData.skills && guideData.skills.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.langContainer}>
                {guideData.skills.map((skill, idx) => (
                  <View key={idx} style={[styles.langBadge, { backgroundColor: '#fff7ed' }]}>
                    <Text style={[styles.langText, { color: '#ea580c' }]}>{skill}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={styles.divider} />

          {/* Reviews Section */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Client Reviews</Text>
          </View>

          {loadingReviews ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : reviews.length > 0 ? (
            reviews.map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {(review.userId?.name || review.userName || 'A')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.reviewerName}>{review.userId?.name || review.userName || 'Anonymous'}</Text>
                      <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </View>
                  <View style={styles.reviewRating}>
                    <Ionicons name="star" size={12} color="#fbbf24" />
                    <Text style={styles.ratingValue}>{review.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>"{review.comment}"</Text>
                {review.imageUrls && review.imageUrls.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImages}>
                    {review.imageUrls.map((img, i) => (
                      <Image 
                        key={i} 
                        source={{ uri: getImageUrl(img) }} 
                        style={styles.reviewImage} 
                      />
                    ))}
                  </ScrollView>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noReviews}>No reviews yet. Book a session with this guide to share your experience.</Text>
          )}

          <View style={styles.divider} />

          {/* Pricing & Booking Summary */}
          {!isOwnProfile && (
            <View style={styles.bookingCard}>
              <View>
                <Text style={styles.priceLabel}>Daily Rate</Text>
                <Text style={styles.priceValue}>Rs. {guideData.dailyRate}</Text>
              </View>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => navigation.navigate('Booking', { item: guideData, type: 'guide' })}
              >
                <Text style={styles.bookButtonText}>Book Guide</Text>
              </TouchableOpacity>
            </View>
          )}
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
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addReviewBtn: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  addReviewText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  reviewCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  reviewDate: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 1,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400e',
  },
  reviewComment: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  noReviews: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  reviewImages: {
    marginTop: 12,
    flexDirection: 'row',
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#f1f5f9',
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
