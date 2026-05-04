import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GuideDashboardScreen from '../screens/GuideDashboard/GuideDashboardScreen';
import GuideBookingsScreen from '../screens/GuideDashboard/GuideBookingsScreen';
import GuideEarningsScreen from '../screens/GuideDashboard/GuideEarningsScreen';
import GuideProfileViewScreen from '../screens/GuideDashboard/GuideProfileViewScreen';
import { Colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const GuideTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Earnings') {
            iconName = focused ? 'cash' : 'cash-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#064e3b',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          height: 70,
          paddingBottom: 12,
          paddingTop: 10,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={GuideDashboardScreen} />
      <Tab.Screen name="Bookings" component={GuideBookingsScreen} />
      <Tab.Screen name="Earnings" component={GuideEarningsScreen} /> 
      <Tab.Screen name="Profile" component={GuideProfileViewScreen} />
    </Tab.Navigator>
  );
};

export default GuideTabNavigator;
