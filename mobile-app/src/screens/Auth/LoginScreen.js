import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.error || 'Invalid email or password. Please try again.');
    }
    // No need to navigate manually, AppNavigator will react to user state change
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: Colors.white }}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to your account</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Register')}
          style={styles.registerLink}
        >
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.registerLinkText}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.white,
    padding: 24,
    paddingTop: 80,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f1f5f9',
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
    ...Shadows.small,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 24,
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
});

export default LoginScreen;
