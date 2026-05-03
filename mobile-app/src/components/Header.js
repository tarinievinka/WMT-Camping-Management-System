import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigation = useNavigation();
  const { unreadCount } = useAuth();

  return (
    <View style={styles.topNav}>
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          <Ionicons name="leaf" size={14} color={Colors.primary} />
        </View>
        <Text style={styles.logoText}>CAMPTRAIL 360</Text>
      </View>
      <View style={styles.topIcons}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Store')}>
          <Feather name="search" size={20} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
          <View>
            <Ionicons name="notifications-outline" size={24} color={Colors.white} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle" size={32} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(22, 101, 52, 1)', // Theme Green
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }
    })
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    backgroundColor: Colors.white,
    padding: 3,
    borderRadius: 6,
    marginRight: 10,
  },
  logoText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 15,
  },
  profileButton: {
    // Styling for profile button
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: '#ef4444',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#166534', // Same as header background for blend
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  }
});

export default Header;
