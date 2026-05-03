import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Dimensions,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { apiClient, BASE_URL, getImageUrl } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const CampsiteDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    fetchReviews();
    checkEligibility();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await apiClient.get(`/feedback/display?targetId=${item._id}&targetType=Campsite`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const checkEligibility = async () => {
    if (!user) return;
    try {
      const response = await apiClient.get(`/feedback/check-eligibility?targetId=${item._id}&targetType=Campsite&userId=${user._id || user.id}`);
      setIsEligible(response.data.eligible);
    } catch (error) {
      console.error('Error checking eligibility:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      >
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: getImageUrl(item.image) || item.images?.[0] || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=1000' }} 
            style={styles.image} 
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>{item.name}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color={Colors.gray} />
                <Text style={styles.location}>{item.location}</Text>
              </View>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text style={styles.ratingText}>{item.averageRating?.toFixed(1) || '4.8'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>About this site</Text>
          <Text style={styles.description}>
            {item.description || 'Escape to the serenity of nature. This campsite offers a perfect blend of adventure and tranquility, featuring breathtaking views and premium amenities for an unforgettable outdoor experience.'}
          </Text>

          {/* Amenities */}
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {(item.amenities || ['Campfire', 'Water', 'WiFi', 'Parking']).map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <View style={styles.amenityIcon}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Reviews Section */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Community Reviews</Text>
            {isEligible && (
              <TouchableOpacity 
                style={styles.addReviewBtn}
                onPress={() => navigation.navigate('AddFeedback', { 
                  booking: { 
                    targetId: item._id, 
                    targetName: item.name, 
                    targetType: 'Campsite' 
                  } 
                })}
              >
                <Text style={styles.addReviewText}>Add Review</Text>
              </TouchableOpacity>
            )}
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
                      <Text style={styles.reviewerName}>{review.userId?.name || review.userName || 'Anonymous User'}</Text>
                      <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </View>
                  <View style={styles.reviewRating}>
                    <Ionicons name="star" size={12} color="#fbbf24" />
                    <Text style={styles.ratingValue}>{review.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>"{review.comment}"</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noReviews}>No reviews yet. {isEligible ? 'Be the first to review!' : 'Book this site to share your experience.'}</Text>
          )}

          <View style={styles.divider} />

          {/* Booking Summary Card */}
          <View style={styles.priceCard}>
            <View>
              <Text style={styles.priceLabel}>Price per night</Text>
              <Text style={styles.priceValue}>Rs. {item.pricePerNight}</Text>
            </View>
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={() => navigation.navigate('Booking', { item, type: 'campsite' })}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
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
  imageContainer: {
    width: '100%',
    height: 350,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: {
    padding: 24,
    marginTop: -30,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  location: {
    fontSize: 14,
    color: Colors.gray,
    marginLeft: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#92400e',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#64748b',
    marginBottom: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  amenityIcon: {
    marginRight: 8,
  },
  amenityText: {
    fontSize: 14,
    color: Colors.text,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.gray,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 16,
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(22, 101, 52, 0.3)' },
      default: { elevation: 4 }
    })
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addReviewBtn: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  addReviewText: {
    color: '#92400e',
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
  }
});

export default CampsiteDetailScreen;
