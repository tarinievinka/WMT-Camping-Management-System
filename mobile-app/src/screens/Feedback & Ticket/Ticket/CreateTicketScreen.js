import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../theme/colors';
import Header from '../../../components/Header';
import apiClient from '../../../api/apiClient';
import { useAuth } from '../../../context/AuthContext';


const CreateTicketScreen = ({ route, navigation }) => {
  const { token } = useAuth();
  const editTicket = route.params?.editTicket;

  const [title, setTitle] = useState(editTicket?.title || '');
  const [description, setDescription] = useState(editTicket?.description || '');
  const [priority, setPriority] = useState(editTicket?.priority || 'medium');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});



  const handleSubmit = async () => {
    const newErrors = {};
    if (!title || title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long.';
    }
    if (!description || description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters long.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      if (editTicket) {
        await apiClient.put(`/tickets/update/${editTicket._id}`, {
          title,
          description,
          priority
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await apiClient.post('/tickets/create', {
          title,
          description,
          priority
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      const refreshAt = Date.now();
      // Return to Support tab ticket list (works from Support portal or stack)
      navigation.navigate('Main', {
        screen: 'Support',
        params: { activeTab: 'ticket', refreshAt }
      });

      Alert.alert('Success', `Ticket ${editTicket ? 'updated' : 'submitted'} successfully!`);


    } catch (error) {
      console.error('Error creating ticket:', error);
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to submit ticket. Please try again.';
      Alert.alert('Error', String(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{editTicket ? 'Edit' : 'Create'} Support Ticket</Text>
        </View>


        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="What is the issue about?"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errors.title) setErrors({ ...errors, title: null });
              }}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityRow}>
              {['low', 'medium', 'high'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityBtn,
                    priority === p && styles.priorityBtnActive,
                    priority === p && { backgroundColor: p === 'high' ? '#ef4444' : p === 'medium' ? '#fbbf24' : '#10b981' }
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[styles.priorityText, priority === p && styles.priorityTextActive]}>
                    {p.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your issue in detail..."
              multiline
              numberOfLines={6}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description) setErrors({ ...errors, description: null });
              }}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.disabledBtn]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Submitting...' : editTicket ? 'Update Ticket' : 'Submit Ticket'}
            </Text>

          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backBtn: {
    marginRight: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  priorityBtnActive: {
    borderColor: 'transparent',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.gray,
  },
  priorityTextActive: {
    color: '#fff',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    ...Platform.select({
      web: { boxShadow: `0px 4px 8px ${Colors.primary}4D` },
      default: { elevation: 4 }
    })
  },
  disabledBtn: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  }
});

export default CreateTicketScreen;
