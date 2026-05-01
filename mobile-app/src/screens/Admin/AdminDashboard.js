import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = ({ navigation }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { title: 'Manage Campsites', icon: '🏕️', color: '#3b82f6', route: 'ManageCampsites' },
    { title: 'Manage Equipment', icon: '🎒', color: '#f59e0b', route: 'ManageEquipment' },
    { title: 'Manage Guides', icon: '👤', color: '#10b981', route: 'ManageGuides' },
    { title: 'Manage Blogs', icon: '📝', color: '#8b5cf6', route: 'ManageBlogs' },
    { title: 'Manage Tickets', icon: '🎟️', color: '#ef4444', route: 'ManageTickets' },
    { title: 'Verify Payments', icon: '💳', color: '#10b981', route: 'VerifyPayments' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hello, Admin</Text>
          <Text style={styles.nameText}>{user?.name || 'Administrator'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Dashboard Overview</Text>
        
        <View style={styles.grid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.card, { borderLeftColor: item.color }]}
              onPress={() => navigation.navigate(item.route)}
            >
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Pending Tickets</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>New Blogs</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748b',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 13,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    ...Shadows.small,
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statBox: {
    width: '48%',
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    ...Shadows.small,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  }
});

export default AdminDashboard;
