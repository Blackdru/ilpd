import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Toast.show({
        type: 'error',
        text1: 'All fields are required',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Passwords do not match',
      });
      return;
    }

    if (formData.password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Password must be at least 6 characters',
      });
      return;
    }

    setLoading(true);
    await signUp(formData.email, formData.password, formData.name);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Title style={styles.title}>Create Account</Title>
          <Paragraph style={styles.subtitle}>
            Join us to start using PDF tools
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Full Name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />

            <TextInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Create Account
            </Button>

            <Divider style={styles.divider} />

            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Login')}
              style={styles.button}
            >
              Already have an account? Sign In
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  card: {
    elevation: 4,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 8,
  },
  divider: {
    marginVertical: 16,
  },
});

export default RegisterScreen;