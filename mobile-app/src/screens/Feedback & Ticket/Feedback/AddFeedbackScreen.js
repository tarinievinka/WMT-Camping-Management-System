import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../theme/colors';
import Header from '../../../components/Header';
import apiClient from '../../../api/apiClient';
import { useAuth } from '../../../context/AuthContext';


const AddFeedbackScreen = ({ route, navigation }) => {
  const { booking, editMode = false } = route.params;
  const { user } = useAuth();
  const [rating, setRating] = useState(editMode ? booking.rating : 5);
  const [comment, setComment] = useState(editMode ? (booking.comment || booking.message) : '');
  const [loading, setLoading] = useState(false);


  const handleSubmit = async () => {
    if (!comment) {
      Alert.alert('Error', 'Please enter your feedback comment');
      return;
    }

    setLoading(true);
    try {
      // Normalize targetType to match backend enum ["Campsite", "Equipment", "Guide"]
      let type = booking.type || 'Campsite';
      if (type.toLowerCase() === 'gear') type = 'Equipment';
      if (type.toLowerCase() === 'camper') type = 'Campsite'; // Fallback
      
      const payload = {
        userId: user?._id,
        userName: user?.name,
        targetId: booking.campsite?._id || booking.campsiteId?._id || booking.guideId?._id || booking._id,
        targetName: booking.name || booking.campsite?.name || booking.campsiteId?.name || booking.guideName,
        targetType: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
        rating,
        comment
      };

      if (editMode) {
        await apiClient.put(`/feedback/update/${booking._id}`, {
          rating,
          comment
        });
      } else {
        await apiClient.post('/feedback/add', payload);
      }

      
      Alert.alert('Success', 'Thank you for your feedback!', [
        { text: 'OK', onPress: () => navigation.navigate('Support', { activeTab: 'feedback' }) }

      ]);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleSection}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{editMode ? 'Edit' : 'Give'} Feedback</Text>
        </View>


        <View style={styles.itemInfo}>
          <Text style={styles.itemLabel}>Reviewing for:</Text>
          <Text style={styles.itemName}>{booking.name || booking.campsiteId?.name}</Text>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.sectionLabel}>Rate your experience</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons 
                  name={star <= rating ? "star" : "star-outline"} 
                  size={40} 
                  color={star <= rating ? "#fbbf24" : "#cbd5e1"} 
                  style={styles.star}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingValue}>{rating} / 5 Stars</Text>
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.sectionLabel}>Your Comment</Text>
          <TextInput
            style={styles.input}
            placeholder="Tell us about your experience..."
            multiline
            numberOfLines={6}
            value={comment}
            onChangeText={setComment}
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, loading && styles.disabledBtn]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? 'Submitting...' : editMode ? 'Update Feedback' : 'Submit Review'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backBtn: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  itemInfo: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  itemLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 15,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  star: {
    marginHorizontal: 5,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  commentSection: {
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 15,
    height: 150,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: `0px 4px 8px ${Colors.primary}4D`,
      },
      default: {
        elevation: 4,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  disabledBtn: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default AddFeedbackScreen;
