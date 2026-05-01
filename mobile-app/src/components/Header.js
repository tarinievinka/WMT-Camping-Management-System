import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';

const Header = () => {
  const navigation = useNavigation();

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
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 30 : 20, // Account for status bar
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
  }
});

export default Header;
