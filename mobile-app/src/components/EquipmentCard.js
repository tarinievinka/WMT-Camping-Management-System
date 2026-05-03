import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Shadows } from '../theme/shadows';
import { BASE_URL, getImageUrl } from '../api/apiClient';

const EquipmentCard = ({ item, onPress, onAddToCart }) => {

  const isLowStock = item.stockQuantity <= 5 && item.stockQuantity > 0;
  const isOutOfStock = item.stockQuantity === 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: getImageUrl(item.imageUrl) || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=300' }} 
          style={styles.image} 
          resizeMode="cover"
        />
        
        <View style={styles.badgeRow}>
          {item.availabilityStatus === 'Available' ? (
            <View style={[styles.statusBadge, styles.availableBadge]}>
              <Text style={styles.statusText}>AVAILABLE</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.rentedBadge]}>
              <Text style={styles.statusText}>{item.availabilityStatus?.toUpperCase()}</Text>
            </View>
          )}

          {isLowStock && (
            <View style={styles.stockWarningBadge}>
              <Text style={styles.stockWarningText}>ONLY {item.stockQuantity} LEFT</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.category} numberOfLines={1}>
          {item.category?.toUpperCase()} • {item.condition?.toUpperCase() || 'GOOD'}
        </Text>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        
        {/* Real Ratings */}
        <View style={styles.ratingRow}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <FontAwesome 
                key={s} 
                name={s <= Math.round(item.averageRating || 0) ? "star" : "star-o"} 
                size={10} 
                color="#f59e0b" 
                style={{marginRight: 2}} 
              />
            ))}
          </View>
          <Text style={styles.ratingText}>
            {item.averageRating ? item.averageRating.toFixed(1) : '0.0'} ({item.numReviews || 0})
          </Text>
        </View>

        <View style={styles.modeRow}>
          <View style={styles.modeBadge}>
            <Ionicons name="repeat-outline" size={10} color="#3b82f6" />
            <Text style={styles.modeText}>Rent/day</Text>
          </View>
          <View style={styles.modeBadge}>
            <Ionicons name="pricetag-outline" size={10} color="#f59e0b" />
            <Text style={styles.modeText}>Buy</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.rateLabel}>Daily Rate</Text>
            <Text style={styles.price}>LKR {item.rentalPrice}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.addToCartBtn, isOutOfStock && styles.disabledBtn]} 
            onPress={() => !isOutOfStock && onAddToCart?.(item)}
            disabled={isOutOfStock}
          >
            <Ionicons name="cart-outline" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    ...Shadows.medium,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8fafc',
  },
  badgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availableBadge: {
    backgroundColor: '#166534',
  },
  rentedBadge: {
    backgroundColor: '#94a3b8',
  },
  statusText: {
    fontSize: 8,
    fontWeight: '900',
    color: Colors.white,
  },
  stockWarningBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockWarningText: {
    fontSize: 8,
    fontWeight: '900',
    color: Colors.white,
  },
  content: {
    padding: 16,
  },
  category: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  modeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  modeText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  rateLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: '#166534',
  },
  addToCartBtn: {
    backgroundColor: '#10b981',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 10px rgba(16, 185, 129, 0.3)',
      },
      default: {
        elevation: 3,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      }
    })
  },
  disabledBtn: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
  }
});

export default EquipmentCard;
