import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

// Screens
import HomeScreen from '../screens/HomeScreen';
import StoreScreen from '../screens/StoreScreen';
import BlogListScreen from '../screens/Blog/BlogListScreen';
import GuideListScreen from '../screens/Guide/GuideListScreen';
import ProfileScreen from '../screens/Auth/ProfileScreen';
import SupportPortalScreen from '../screens/Feedback & Ticket/SupportPortalScreen';




const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Campsites') {
            iconName = focused ? 'home' : 'home-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Store') {
            iconName = focused ? 'cart' : 'cart-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Guides') {
            iconName = focused ? 'people' : 'people-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Blogs') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Support') {
            iconName = focused ? 'help-circle' : 'help-circle-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          }

        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 10,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 0,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Campsites" component={HomeScreen} />
      <Tab.Screen 
        name="Store" 
        component={StoreScreen} 
        options={{ tabBarLabel: 'Equipment' }} 
      />
      <Tab.Screen name="Guides" component={GuideListScreen} />
      <Tab.Screen name="Blogs" component={BlogListScreen} />
      <Tab.Screen name="Support" component={SupportPortalScreen} />

      <Tab.Screen name="Profile" component={ProfileScreen} />

    </Tab.Navigator>
  );
};

export default MainTabNavigator;
