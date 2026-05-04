import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Image, Platform, SafeAreaView, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const GuideProfileViewScreen = ({ navigation }) => {
  const { user, token } = useAuth();
  const [guideData, setGuideData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchMyProfile();
    }, [])
  );

  const fetchMyProfile = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/guides/display`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const guides = response.data.data || (Array.isArray(response.data) ? response.data : []);
      const myProfile = guides.find(g => g.email === user.email);
      
      if (myProfile) {
        setGuideData(myProfile);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!guideData) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Profile not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('GuideProfile')} style={styles.editBtn}>
          <Ionicons name="pencil" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {guideData.profilePhoto ? (
            <Image source={{ uri: guideData.profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{guideData.name?.substring(0, 2).toUpperCase() || 'G'}</Text>
            </View>
          )}
          <Text style={styles.name}>{guideData.name}</Text>
          <Text style={styles.tagline}>{guideData.tagline || 'Professional Guide'}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Daily Rate</Text>
            <Text style={styles.statValue}>LKR {guideData.dailyRate || 0}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Experience</Text>
            <Text style={styles.statValue}>{guideData.experience || 0} Yrs</Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>{guideData.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>{guideData.phone || 'Not provided'}</Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About Me</Text>
          <Text style={styles.bioText}>{guideData.description || 'No description provided.'}</Text>
        </View>

        {/* Badges/Tags */}
        {guideData.specialties && guideData.specialties.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Specialties</Text>
            <View style={styles.tagsContainer}>
              {guideData.specialties.map((item, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {guideData.languages && guideData.languages.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Languages</Text>
            <View style={styles.tagsContainer}>
              {guideData.languages.map((item, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: '#e0f2fe' }]}>
                  <Text style={[styles.tagText, { color: '#0284c7' }]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {guideData.skills && guideData.skills.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Other Skills</Text>
            <View style={styles.tagsContainer}>
              {guideData.skills.map((item, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: '#fef3c7' }]}>
                  <Text style={[styles.tagText, { color: '#d97706' }]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Gallery */}
        {guideData.gallery && guideData.gallery.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gallery</Text>
            <View style={styles.galleryGrid}>
              {guideData.gallery.map((img, index) => (
                <Image key={index} source={{ uri: img }} style={styles.galleryImage} />
              ))}
            </View>
          </View>
        )}
        
        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.danger,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(0,0,0,0.05)' },
      default: { elevation: 2, shadowColor: '#000', shadowOffset: { height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }
    })
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  editBtn: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    marginBottom: 15,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarInitials: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  tagline: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 5,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statBox: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 5,
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.04)' },
      default: { elevation: 2, shadowColor: '#000', shadowOffset: { height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 }
    })
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.04)' },
      default: { elevation: 2, shadowColor: '#000', shadowOffset: { height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 }
    })
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#334155',
  },
  bioText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '600',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  galleryImage: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
  }
});

export default GuideProfileViewScreen;
