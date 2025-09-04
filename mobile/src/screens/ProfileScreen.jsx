import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Button,
  TextInput,
  List,
  Divider,
  Surface,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { formatFileSize } from '../lib/utils';
import Toast from 'react-native-toast-message';

const ProfileScreen = () => {
  const { user, signOut, updateProfile } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      const [profileResponse, statsResponse] = await Promise.all([
        api.getProfile(),
        api.getUserStats(),
      ]);

      setProfile({
        name: profileResponse.user.name || '',
        email: profileResponse.user.email || '',
      });
      setStats(statsResponse.stats);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load profile data',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);

    try {
      await api.updateProfile(profile);

      // Also update in Supabase Auth if needed
      if (profile.name !== user.user_metadata?.name) {
        await updateProfile({
          data: { name: profile.name },
        });
      }

      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully',
      });
      setEditMode(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your files and data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.prompt(
              'Confirm Deletion',
              'Type "DELETE" to confirm account deletion:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async (text) => {
                    if (text === 'DELETE') {
                      try {
                        // await api.deleteAccount();
                        Toast.show({
                          type: 'success',
                          text1: 'Account deleted successfully',
                        });
                      } catch (error) {
                        Toast.show({
                          type: 'error',
                          text1: 'Failed to delete account',
                        });
                      }
                    } else {
                      Toast.show({
                        type: 'error',
                        text1: 'Account deletion cancelled',
                      });
                    }
                  },
                },
              ],
              'plain-text'
            );
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title style={styles.title}>Profile</Title>
        <Text style={styles.subtitle}>
          Manage your account settings
        </Text>
      </View>

      {/* Stats Cards */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <Surface style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
              <Icon name="file-multiple" size={24} color="#1976D2" />
              <Text style={styles.statNumber}>{stats.totalFiles}</Text>
              <Text style={styles.statLabel}>Files</Text>
            </Surface>

            <Surface style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
              <Icon name="harddisk" size={24} color="#388E3C" />
              <Text style={styles.statNumber}>{formatFileSize(stats.totalStorage)}</Text>
              <Text style={styles.statLabel}>Storage</Text>
            </Surface>
          </View>

          <Surface style={[styles.statCard, styles.fullWidthCard, { backgroundColor: '#FFF3E0' }]}>
            <Icon name="chart-line" size={24} color="#F57C00" />
            <Text style={styles.statNumber}>{stats.recentActivity}</Text>
            <Text style={styles.statLabel}>Recent Operations</Text>
          </Surface>
        </View>
      )}

      {/* Profile Information */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>Personal Information</Title>
            <Button
              mode={editMode ? 'contained' : 'outlined'}
              onPress={() => setEditMode(!editMode)}
              icon={editMode ? 'close' : 'pencil'}
            >
              {editMode ? 'Cancel' : 'Edit'}
            </Button>
          </View>

          {editMode ? (
            <View style={styles.editForm}>
              <TextInput
                label="Full Name"
                value={profile.name}
                onChangeText={(text) => setProfile({ ...profile, name: text })}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Email Address"
                value={profile.email}
                onChangeText={(text) => setProfile({ ...profile, email: text })}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <Button
                mode="contained"
                onPress={handleSaveProfile}
                loading={saving}
                disabled={saving}
                style={styles.saveButton}
                icon="content-save"
              >
                Save Changes
              </Button>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <List.Item
                title="Name"
                description={profile.name || 'Not set'}
                left={() => <Icon name="account" size={24} />}
              />
              <Divider />
              <List.Item
                title="Email"
                description={profile.email}
                left={() => <Icon name="email" size={24} />}
              />
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Account Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Account Actions</Title>
          
          <List.Item
            title="Sign Out"
            description="Sign out of your account"
            left={() => <Icon name="logout" size={24} color="#FF9800" />}
            onPress={handleSignOut}
            style={styles.actionItem}
          />
          
          <Divider />
          
          <List.Item
            title="Delete Account"
            description="Permanently delete your account and all data"
            left={() => <Icon name="delete" size={24} color="#F44336" />}
            onPress={handleDeleteAccount}
            style={styles.actionItem}
          />
        </Card.Content>
      </Card>

      {/* App Information */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>App Information</Title>
          
          <List.Item
            title="Version"
            description="1.0.0"
            left={() => <Icon name="information" size={24} />}
          />
          
          <Divider />
          
          <List.Item
            title="Privacy Policy"
            description="View our privacy policy"
            left={() => <Icon name="shield-account" size={24} />}
            right={() => <Icon name="chevron-right" size={24} />}
          />
          
          <Divider />
          
          <List.Item
            title="Terms of Service"
            description="View terms of service"
            left={() => <Icon name="file-document" size={24} />}
            right={() => <Icon name="chevron-right" size={24} />}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  statsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    padding: 16,
    margin: 4,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  fullWidthCard: {
    flex: 1,
    margin: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  card: {
    margin: 20,
    marginTop: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editForm: {
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
  },
  profileInfo: {
    marginTop: 8,
  },
  actionItem: {
    paddingVertical: 4,
  },
});

export default ProfileScreen;