import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ImageBackground, 
  TouchableOpacity, 
  Dimensions, 
  Platform,
  Animated,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const slideAnim = useRef(new Animated.Value(height * 0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" transparent backgroundColor="transparent" />
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80' }} 
        style={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          {/* Top Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="leaf" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.logoText}>CAMPTRAIL 360</Text>
          </View>

          {/* Bottom Glass Card */}
          <Animated.View style={[
            styles.glassCard, 
            { transform: [{ translateY: slideAnim }], opacity: fadeAnim }
          ]}>
            <Text style={styles.welcomeText}>WELCOME TO</Text>
            <Text style={styles.title}>Adventure Awaits</Text>
            <Text style={styles.description}>
              Discover the best campsites, book expert guides, and get high-quality gear for your next outdoor journey.
            </Text>

            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigation.replace('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 10 }} />
            </TouchableOpacity>

            <View style={styles.pagination}>
              <View style={[styles.dot, styles.activeDot]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 20 : 10,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  glassCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 35,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0px 10px 30px rgba(0,0,0,0.2)',
      },
      default: {
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
      },
    }),
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 3,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pagination: {
    flexDirection: 'row',
    marginTop: 25,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 20,
  },
});

export default OnboardingScreen;
