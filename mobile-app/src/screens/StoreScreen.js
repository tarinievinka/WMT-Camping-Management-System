import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions,
  Platform 
} from 'react-native';
import { Colors } from '../theme/colors';
import Header from '../components/Header';

// Existing Screens
import CampsiteListScreen from './CampingSite/CampsiteListScreen';
import GuideListScreen from './Guide/GuideListScreen';
import EquipmentListScreen from './Equipment/EquipmentListScreen';

const { width } = Dimensions.get('window');

const StoreScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState(route.params?.activeTab || 'campsites');
  
  React.useEffect(() => {
    if (route.params?.activeTab) {
      setActiveTab(route.params.activeTab);
    }
  }, [route.params?.activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'campsites':
        return <CampsiteListScreen navigation={navigation} />;
      case 'guides':
        return <GuideListScreen navigation={navigation} />;
      case 'gear':
        return <EquipmentListScreen navigation={navigation} />;
      default:
        return <CampsiteListScreen navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'campsites' && styles.activeTab]}
          onPress={() => setActiveTab('campsites')}
        >
          <Text style={[styles.tabText, activeTab === 'campsites' && styles.activeTabText]}>Campsites</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'guides' && styles.activeTab]}
          onPress={() => setActiveTab('guides')}
        >
          <Text style={[styles.tabText, activeTab === 'guides' && styles.activeTabText]}>Guides</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'gear' && styles.activeTab]}
          onPress={() => setActiveTab('gear')}
        >
          <Text style={[styles.tabText, activeTab === 'gear' && styles.activeTabText]}>Gear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    margin: 16,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#fff',
    elevation: 2,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    })
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
  }
});

export default StoreScreen;
