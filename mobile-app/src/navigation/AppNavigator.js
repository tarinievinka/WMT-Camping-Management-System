import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import MainTabNavigator from './MainTabNavigator';
import AdminNavigator from './AdminNavigator';
import GuideTabNavigator from './GuideTabNavigator';
import OnboardingScreen from '../screens/Auth/OnboardingScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import EditProfileScreen from '../screens/Auth/EditProfileScreen';
import SplashScreen from '../screens/SplashScreen';

// Detail Screens
import CampsiteDetailScreen from '../screens/CampingSite/CampsiteDetailScreen';
import GuideDetailScreen from '../screens/Guide/GuideDetailScreen';
import EquipmentDetailScreen from '../screens/Equipment/EquipmentDetailScreen';
import BookingScreen from '../screens/BookingScreen';
import PaymentScreen from '../screens/PaymentScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import AddFeedbackScreen from '../screens/Feedback & Ticket/Feedback/AddFeedbackScreen';
import PaymentSuccessScreen from '../screens/Payment/PaymentSuccessScreen';
import MyTicketsScreen from '../screens/Feedback & Ticket/Ticket/MyTicketsScreen';
import CreateTicketScreen from '../screens/Feedback & Ticket/Ticket/CreateTicketScreen';
import TicketDetailsScreen from '../screens/Feedback & Ticket/Ticket/TicketDetailsScreen';
import SubmitFeedbackScreen from '../screens/Feedback & Ticket/Feedback/SubmitFeedbackScreen';
import PaymentHistoryScreen from '../screens/Payment/PaymentHistoryScreen';
import NotificationsScreen from '../screens/NotificationsScreen';


import AdminTicketsScreen from '../screens/Feedback & Ticket/Ticket/AdminTicketsScreen';

import BlogDetailScreen from '../screens/Blog/BlogDetailScreen';

import CreateBlogScreen from '../screens/Blog/CreateBlogScreen';
import CartScreen from '../screens/CartScreen';
import GuideProfileScreen from '../screens/GuideDashboard/GuideProfileScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  const [isSplashFinished, setIsSplashFinished] = React.useState(false);
  
  console.log('[NAV] AppNavigator rendering for role:', user?.role);

  if (isLoading || !isSplashFinished) {
    return <SplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          // Authenticated Stack (Admin, Guide, or User)
          <>
            {user.role === 'admin' ? (
              <Stack.Screen name="AdminRoot" component={AdminNavigator} />
            ) : user.role === 'guide' ? (
              <Stack.Screen name="GuideRoot" component={GuideTabNavigator} />
            ) : (
              <Stack.Screen name="Main" component={MainTabNavigator} />
            )}

            {/* Common Screens accessible to all roles */}
            <Stack.Screen name="CampsiteDetail" component={CampsiteDetailScreen} />
            <Stack.Screen name="GuideDetail" component={GuideDetailScreen} />
            <Stack.Screen name="EquipmentDetail" component={EquipmentDetailScreen} />
            <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            
            {/* User & Guide Shared flow screens */}
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
            <Stack.Screen name="AddFeedback" component={AddFeedbackScreen} />
            <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
            <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
            <Stack.Screen name="CreateTicket" component={CreateTicketScreen} />
            <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} />
            <Stack.Screen name="SubmitFeedback" component={SubmitFeedbackScreen} />
            <Stack.Screen name="AdminTickets" component={AdminTicketsScreen} />
            <Stack.Screen name="CreateBlog" component={CreateBlogScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
            <Stack.Screen name="GuideProfile" component={GuideProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
