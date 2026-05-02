import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import ManageCampsitesScreen from '../screens/Admin/ManageCampsitesScreen';
import ManageEquipmentScreen from '../screens/Admin/ManageEquipmentScreen';
import ManageGuidesScreen from '../screens/Admin/ManageGuidesScreen';
import ManageBlogsScreen from '../screens/Admin/ManageBlogsScreen';
import AdminTicketsScreen from '../screens/Feedback & Ticket/Ticket/AdminTicketsScreen';
import FeedbackListScreen from '../screens/Feedback & Ticket/Feedback/FeedbackListScreen';


import VerifyPaymentsScreen from '../screens/Admin/VerifyPaymentsScreen';
import AddCampsiteScreen from '../screens/Admin/AddCampsiteScreen';
import EditCampsiteScreen from '../screens/Admin/EditCampsiteScreen';
import AddEquipmentScreen from '../screens/Admin/AddEquipmentScreen';
import AddGuideScreen from '../screens/Admin/AddGuideScreen';
import CreateBlogScreen from '../screens/Blog/CreateBlogScreen';
import BlogDetailScreen from '../screens/Blog/BlogDetailScreen';
import EditGuideScreen from '../screens/Admin/EditGuideScreen';
import TicketDetailsScreen from '../screens/Feedback & Ticket/Ticket/TicketDetailsScreen';

const Stack = createStackNavigator();

const AdminNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="ManageCampsites" component={ManageCampsitesScreen} />
      <Stack.Screen name="ManageEquipment" component={ManageEquipmentScreen} />
      <Stack.Screen name="ManageGuides" component={ManageGuidesScreen} />
      <Stack.Screen name="ManageBlogs" component={ManageBlogsScreen} />
      <Stack.Screen name="ManageTickets" component={AdminTicketsScreen} />
      <Stack.Screen name="ManageReviews" component={FeedbackListScreen} />

      <Stack.Screen name="VerifyPayments" component={VerifyPaymentsScreen} />
      <Stack.Screen name="AddCampsite" component={AddCampsiteScreen} />
      <Stack.Screen name="EditCampsite" component={EditCampsiteScreen} />
      <Stack.Screen name="AddEquipment" component={AddEquipmentScreen} />
      <Stack.Screen name="AddGuide" component={AddGuideScreen} />
      <Stack.Screen name="CreateBlog" component={CreateBlogScreen} />
      <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
      <Stack.Screen name="EditGuide" component={EditGuideScreen} />
      <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
