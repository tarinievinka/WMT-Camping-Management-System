import React, { useState, useEffect } from 'react';
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
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import apiClient, { BASE_URL, getImageUrl } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

const EquipmentDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    fetchReviews();
    checkEligibility();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await apiClient.get(`/feedback/display?targetId=${item._id}&targetType=Equipment`);
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
      const response = await apiClient.get(`/feedback/check-eligibility?targetId=${item._id}&targetType=Equipment&userId=${user._id || user.id}`);
      setIsEligible(response.data.eligible);
    } catch (error) {
      console.error('Error checking eligibility:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Product Image */}
        <View style={styles.imageSection}>
          <Image 
            source={{ uri: getImageUrl(item.imageUrl) || 'https://images.unsplash.com/photo-1504215680045-29eee485e9be?auto=format&fit=crop&w=600&q=80' }} 
            style={styles.image} 
            resizeMode="contain"
          />
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.category || 'CAMPING GEAR'}</Text>
          </View>
          
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.price}>Rs. {item.rentalPrice} <Text style={styles.unit}>/ day</Text></Text>
          <Text style={styles.salePrice}>Purchase: Rs. {item.salePrice}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Product Details</Text>
          <Text style={styles.description}>
            {item.description || 'High-quality camping equipment designed for durability and comfort in all weather conditions. Perfect for your next outdoor adventure.'}
          </Text>

          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity 
                style={styles.qtyBtn} 
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Feather name="minus" size={20} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.qtyBtn} 
                onPress={() => setQuantity(quantity + 1)}
              >
                <Feather name="plus" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Reviews Section */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>User Reviews</Text>
            {isEligible && (
              <TouchableOpacity 
                style={styles.addReviewBtn}
                onPress={() => navigation.navigate('AddFeedback', { 
                  booking: { 
                    targetId: item._id, 
                    targetName: item.name, 
                    targetType: 'Equipment' 
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
            <Text style={styles.noReviews}>No reviews yet. {isEligible ? 'Be the first to review!' : 'Purchase or rent this item to share your feedback.'}</Text>
          )}

          <View style={styles.divider} />

          <View style={styles.footer}>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>Rs. {item.rentalPrice * quantity}</Text>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.buyButton}
                onPress={() => navigation.navigate('Booking', { item, type: 'equipment', mode: 'buy' })}
              >
                <Text style={styles.buyButtonText}>Buy Now</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.rentButton}
                onPress={() => navigation.navigate('Booking', { item, type: 'equipment', mode: 'rent' })}
              >
                <Text style={styles.rentButtonText}>Rent Now</Text>
              </TouchableOpacity>
            </View>
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
  imageSection: {
    width: '100%',
    height: 300,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  content: {
    padding: 24,
  },
  badge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  salePrice: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  unit: {
    fontSize: 14,
    fontWeight: 'normal',
    color: Colors.gray,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#64748b',
    marginBottom: 24,
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 20,
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.gray,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    flex: 2,
    marginLeft: 15,
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 10,
  },
  buyButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 15,
  },
  rentButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    ...Shadows.primary(Colors.primary),
  },
  rentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
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
  }
});

export default EquipmentDetailScreen;
