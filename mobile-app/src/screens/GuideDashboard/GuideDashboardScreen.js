import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { useFocusEffect } from '@react-navigation/native';

const GuideDashboardScreen = ({ navigation }) => {
  const { user, token, logout } = useAuth();
  const [stats, setStats] = useState({
    activeBookings: 0,
    totalIncome: 0,
    completedTrips: 0,
    totalBookings: 0
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchGuideStats();
    }, [])
  );

  const fetchGuideStats = async () => {
    try {
      const response = await apiClient.get('/guide-bookings/my-bookings');
      
      const bookings = response.data || [];
      const completed = bookings.filter(b => {
        const s = b.status?.toLowerCase();
        return s === 'completed' || s === 'paid';
      });
      const confirmed = bookings.filter(b => b.status?.toLowerCase() === 'confirmed');
      const pending = bookings.filter(b => b.status?.toLowerCase() === 'pending');
      
      const income = completed.reduce((sum, b) => sum + (b.amount || 0), 0);

      setStats({
        totalBookings: completed.length,
        activeBookings: confirmed.length + pending.length,
        totalIncome: income,
        completedTrips: completed.length
      });

      // Filter upcoming (Confirmed or Pending in the future)
      const now = new Date().setHours(0,0,0,0);
      const upcoming = bookings.filter(b => {
        const s = b.status?.toLowerCase();
        const bDate = b.startDate ? new Date(b.startDate).setHours(0,0,0,0) : 0;
        return (s === 'confirmed' || s === 'pending') && bDate >= now;
      });
      
      setUpcomingBookings(
        upcoming
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 10)
      );

      // Also fetch profile photo
      const profileRes = await apiClient.get('/guides/display');
      const guides = profileRes.data.data || (Array.isArray(profileRes.data) ? profileRes.data : []);
      const myProfile = guides.find(g => g.email === user?.email);
      if (myProfile && myProfile.profilePhoto) {
        setProfilePhoto(myProfile.profilePhoto);
      }
    } catch (err) {
      console.error("[GUIDE_DASHBOARD] Fetch stats failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.avatar} />
              ) : (
                <Text style={styles.avatarText}>{user?.name?.substring(0, 2).toUpperCase() || 'SH'}</Text>
              )}
            </View>
            <View>
              <Text style={styles.roleLabel}>GUIDE</Text>
              <Text style={styles.welcomeText}>Hello, {user?.name || 'Solo Hiker'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={logout}>
            <Ionicons name="log-out-outline" size={28} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Total Income Card */}
        <View style={styles.incomeCard}>
          <View style={styles.incomeHeader}>
            <Text style={styles.incomeLabel}>TOTAL INCOME</Text>
            <MaterialCommunityIcons name="wallet-outline" size={24} color="rgba(255,255,255,0.6)" />
          </View>
          <Text style={styles.incomeValue}>LKR {stats.totalIncome.toLocaleString()}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="calendar" size={24} color="#166534" />
            </View>
            <Text style={styles.statCardLabel}>Active{"\n"}Bookings</Text>
            <Text style={styles.statCardValue}>{stats.activeBookings}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#f1f5f9' }]}>
              <MaterialCommunityIcons name="hiking" size={24} color="#64748b" />
            </View>
            <Text style={styles.statCardLabel}>Total{"\n"}Tours</Text>
            <Text style={styles.statCardValue}>{stats.totalBookings}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={styles.primaryAction}
          onPress={() => navigation.navigate('Bookings')}
        >
          <View style={styles.actionLeft}>
            <Ionicons name="calendar-outline" size={22} color="#fff" />
            <Text style={styles.primaryActionText}>View Bookings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryAction}
          onPress={() => navigation.navigate('GuideProfile')}
        >
          <View style={styles.actionLeft}>
            <Ionicons name="person-outline" size={22} color={Colors.text} />
            <Text style={styles.secondaryActionText}>Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text} />
        </TouchableOpacity>

        {/* Upcoming Bookings Section */}
        {upcomingBookings.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {upcomingBookings.map(booking => (
              <View key={booking._id} style={styles.upcomingCard}>
                <View style={styles.tripInfo}>
                  <Text style={styles.tripCustomer}>{booking.customerName}</Text>
                  <Text style={styles.tripDate}>
                    {new Date(booking.startDate).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: booking.status === 'Confirmed' ? '#ecfdf5' : '#fffbeb' }
                ]}>
                  <Text style={[
                    styles.statusBadgeText, 
                    { color: booking.status === 'Confirmed' ? '#059669' : '#d97706' }
                  ]}>
                    {booking.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  headerTitleContainer: {
    justifyContent: 'center',
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#064e3b',
  },
  logoutBtn: {
    padding: 5,
  },
  incomeCard: {
    backgroundColor: '#1a3a32', // Darker forest green
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  incomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  incomeLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  incomeValue: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '48%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  statCardLabel: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 5,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  primaryAction: {
    backgroundColor: '#064e3b',
    borderRadius: 15,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryAction: {
    backgroundColor: '#e2e8f0',
    borderRadius: 15,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  secondaryActionText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingBottom: 5,
  },
  navItem: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 10,
    marginTop: 4,
    color: '#94a3b8',
    fontWeight: '600',
  },
  actionLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 12,
    color: '#064e3b',
    fontWeight: 'bold',
  },
  upcomingCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#064e3b',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tripInfo: {
    flex: 1,
  },
  tripCustomer: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tripDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
});

export default GuideDashboardScreen;
