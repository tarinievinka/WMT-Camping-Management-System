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
      <View style={styles.headerLeft}>
        <View style={styles.logoBox}>
          <Ionicons name="leaf" size={18} color="#166534" />
        </View>
        <Text style={styles.headerBrand}>CAMPTRAIL 360</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Store')}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topNav: {
    backgroundColor: '#166534',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 8,
    marginRight: 10,
  },
  headerBrand: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 15,
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
