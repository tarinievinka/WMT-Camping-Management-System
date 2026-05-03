import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  ImageBackground,
  Dimensions,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErrors({});
    let newErrors = {};

    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setErrors({ form: result.error || 'Invalid email or password. Please try again.' });
    }
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80' }}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="leaf" size={40} color={Colors.white} />
            </View>
            <Text style={styles.brandTitle}>CAMPTRAIL 360</Text>
          </View>

          <View style={styles.glassCard}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to start your adventure</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Feather name="mail" size={18} color={Colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={(text) => { setEmail(text); setErrors({ ...errors, email: null }); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={18} color={Colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={(text) => { setPassword(text); setErrors({ ...errors, password: null }); }}
                  secureTextEntry
                />
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {errors.form && (
              <View style={styles.formErrorContainer}>
                <Ionicons name="alert-circle" size={18} color="#ef4444" />
                <Text style={styles.formErrorText}>{errors.form}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.disabledButton]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Login</Text>
                  <Ionicons name="arrow-forward" size={20} color={Colors.white} style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-google" size={20} color="#EA4335" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-facebook" size={20} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-apple" size={20} color="#000" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Register')}
              style={styles.registerLink}
            >
              <Text style={styles.registerText}>
                New here? <Text style={styles.registerLinkText}>Create Account</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(22, 101, 52, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.white,
    marginTop: 15,
    letterSpacing: 2,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    padding: 30,
    width: '100%',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
        boxShadow: '0px 20px 40px rgba(0,0,0,0.2)',
      },
      default: {
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      }
    })
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  forgotText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    ...Shadows.primary(Colors.primary),
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 25,
  },
  socialBtn: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  registerLink: {
    alignItems: 'center',
  },
  registerText: {
    color: '#64748b',
    fontSize: 14,
  },
  registerLinkText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
    fontWeight: '600',
  },
  formErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  formErrorText: {
    color: '#ef4444',
    fontSize: 13,
    marginLeft: 8,
    fontWeight: '600',
    flex: 1,
  },
});

export default LoginScreen;
