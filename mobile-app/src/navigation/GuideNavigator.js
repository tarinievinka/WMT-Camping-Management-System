import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GuideDashboardScreen from '../screens/GuideDashboard/GuideDashboardScreen';
import GuideBookingsScreen from '../screens/GuideDashboard/GuideBookingsScreen';
import GuideProfileScreen from '../screens/GuideDashboard/GuideProfileScreen';

const Stack = createStackNavigator();

const GuideNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="GuideDashboard" component={GuideDashboardScreen} />
      <Stack.Screen name="GuideBookings" component={GuideBookingsScreen} />
      <Stack.Screen name="GuideProfile" component={GuideProfileScreen} />
    </Stack.Navigator>
  );
};

export default GuideNavigator;
