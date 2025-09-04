import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Surface,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { formatFileSize } from '../lib/utils';
import Toast from 'react-native-toast-message';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, filesResponse] = await Promise.all([
        api.getUserStats(),
        api.getFiles(1, 5), // Get 5 recent files
      ]);
      
      setStats(statsResponse.stats);
      setRecentFiles(filesResponse.files);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load dashboard data',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const quickActions = [
    {
      title: 'Merge PDFs',
      icon: 'merge',
      color: '#4CAF50',
      onPress: () => navigation.navigate('Tools', { screen: 'Merge' }),
    },
    {
      title: 'Split PDF',
      icon: 'call-split',
      color: '#2196F3',
      onPress: () => navigation.navigate('Tools', { screen: 'Split' }),
    },
    {
      title: 'Compress',
      icon: 'compress',
      color: '#FF9800',
      onPress: () => navigation.navigate('Tools', { screen: 'Compress' }),
    },
    {
      title: 'Convert',
      icon: 'file-image',
      color: '#9C27B0',
      onPress: () => navigation.navigate('Tools', { screen: 'Convert' }),
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Title style={styles.welcomeText}>
            Welcome back, {user?.user_metadata?.name || user?.email}
          </Title>
          <Paragraph style={styles.subtitle}>
            Manage your PDF files with ease
          </Paragraph>
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

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Quick Actions</Title>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  mode="outlined"
                  onPress={action.onPress}
                  style={[styles.quickActionButton, { borderColor: action.color }]}
                  labelStyle={{ color: action.color }}
                  icon={action.icon}
                >
                  {action.title}
                </Button>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Recent Files */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Title>Recent Files</Title>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Files')}
              >
                View All
              </Button>
            </View>
            
            {recentFiles.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="file-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No files yet</Text>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('Files')}
                  style={styles.emptyButton}
                >
                  Upload Your First File
                </Button>
              </View>
            ) : (
              <View style={styles.filesList}>
                {recentFiles.map((file) => (
                  <View key={file.id} style={styles.fileItem}>
                    <Icon name="file-pdf-box" size={24} color="#F44336" />
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName}>{file.filename}</Text>
                      <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('Files')}
      />
    </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  welcomeText: {
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
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 8,
  },
  filesList: {
    marginTop: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;