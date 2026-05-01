import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import Header from '../../components/Header';
import MyTicketsScreen from './Ticket/MyTicketsScreen';
import FeedbackListScreen from './Feedback/FeedbackListScreen';

const { width } = Dimensions.get('window');

const SupportPortalScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState(route.params?.activeTab || 'ticket');

  React.useEffect(() => {
    if (route.params?.activeTab) {
      setActiveTab(route.params.activeTab);
    }
  }, [route.params?.activeTab]);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />

      {/* Dark Header Section */}
      <View style={styles.darkHeader}>
        <Text style={styles.headerTitle}>How can we help you?</Text>
        <Text style={styles.headerSubtitle}>
          Submit a support ticket or share your feedback with us
        </Text>

        {/* Segmented Control / Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeTab === 'ticket' && styles.toggleBtnActive
            ]}
            onPress={() => setActiveTab('ticket')}
          >
            <Ionicons
              name="help-buoy-outline"
              size={20}
              color={activeTab === 'ticket' ? '#fff' : '#94a3b8'}
              style={styles.icon}
            />
            <Text style={[
              styles.toggleText,
              activeTab === 'ticket' && styles.toggleTextActive
            ]}>
              Support Ticket
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeTab === 'feedback' && styles.toggleBtnActive
            ]}
            onPress={() => setActiveTab('feedback')}
          >
            <MaterialCommunityIcons
              name="message-outline"
              size={20}
              color={activeTab === 'feedback' ? '#fff' : '#94a3b8'}
              style={styles.icon}
            />
            <Text style={[
              styles.toggleText,
              activeTab === 'feedback' && styles.toggleTextActive
            ]}>
              Feedback
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {activeTab === 'ticket' ? (
          <MyTicketsScreen navigation={navigation} isEmbedded={true} />
        ) : (
          <FeedbackListScreen navigation={navigation} isEmbedded={true} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  darkHeader: {
    backgroundColor: '#0f172a', // Dark theme as per image
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: '80%',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 4,
    width: width - 40,
    maxWidth: 500,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: '#84cc16', // Lime green as per image
  },
  icon: {
    marginRight: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  toggleTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    marginTop: -20, // Overlap effect
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  }
});

export default SupportPortalScreen;
