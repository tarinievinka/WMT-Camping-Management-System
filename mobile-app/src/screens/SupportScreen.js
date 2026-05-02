import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import Header from '../components/Header';
import { Shadows } from '../theme/shadows';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

const SupportScreen = ({ navigation }) => {
  const { user, token } = useAuth();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject || !message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/tickets/create', {
        title: subject,
        description: message,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      
      Alert.alert(
        'Success', 
        'Your support request has been submitted. You can track its status in "My Tickets".',
        [{ text: 'OK', onPress: () => {
          setSubject('');
          setMessage('');
          navigation.navigate('MyTickets');
        }}]
      );
    } catch (error) {
      console.error('Ticket submission error:', error);
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const faqItems = [
    { q: 'How do I book a campsite?', a: 'Select a campsite from the Explore tab and follow the booking flow.' },
    { q: 'Can I cancel my equipment rental?', a: 'Yes, cancellations are possible up to 24 hours before the rental start.' },
    { q: 'How to contact a guide?', a: 'Once booked, the guide details will appear in your My Bookings section.' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqItems.map((item, idx) => (
            <View key={idx} style={styles.faqCard}>
              <Text style={styles.question}>{item.q}</Text>
              <Text style={styles.answer}>{item.a}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Support Tickets</Text>
          <TouchableOpacity 
            style={[styles.feedbackCard, { marginBottom: 0 }]}
            onPress={() => navigation.navigate('MyTickets')}
          >
            <View style={[styles.feedbackIcon, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="ticket-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.feedbackContent}>
              <Text style={styles.feedbackTitle}>Track Your Requests</Text>
              <Text style={styles.feedbackSubtitle}>View status of your support tickets</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feedback & Ratings</Text>
          <TouchableOpacity 
            style={styles.feedbackCard}
            onPress={() => navigation.navigate('Main', {
              screen: 'Support',
              params: { activeTab: 'feedback' }
            })}
          >
            <View style={styles.feedbackIcon}>
              <Ionicons name="star" size={24} color="#fbbf24" />
            </View>
            <View style={styles.feedbackContent}>
              <Text style={styles.feedbackTitle}>Rate Your Experience</Text>
              <Text style={styles.feedbackSubtitle}>Share feedback for your recent bookings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactForm}>
            <Text style={styles.label}>Subject</Text>
            <TextInput 
              style={styles.input}
              placeholder="What do you need help with?"
              value={subject}
              onChangeText={setSubject}
            />
            <Text style={styles.label}>Message</Text>
            <TextInput 
              style={[styles.input, styles.textArea]}
              placeholder="Describe your issue..."
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>Submit Request</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contactOptions}>
          <TouchableOpacity style={styles.optionBtn}>
            <Ionicons name="call" size={20} color={Colors.primary} />
            <Text style={styles.optionText}>Call Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionBtn}>
            <Ionicons name="mail" size={20} color={Colors.primary} />
            <Text style={styles.optionText}>Email Us</Text>
          </TouchableOpacity>
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
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    marginTop: 4,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  faqCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  question: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Shadows.small,
  },
  feedbackIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  feedbackContent: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  feedbackSubtitle: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  contactForm: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Shadows.small,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    ...Shadows.primary(Colors.primary),
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionBtn: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  optionText: {
    marginLeft: 10,
    color: Colors.primary,
    fontWeight: 'bold',
  }
});

export default SupportScreen;
