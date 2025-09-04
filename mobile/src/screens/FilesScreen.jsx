import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Button,
  FAB,
  List,
  Searchbar,
  Menu,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DocumentPicker from 'react-native-document-picker';
import Share from 'react-native-share';
import { api } from '../lib/api';
import { formatFileSize, formatDate, getFileIcon } from '../lib/utils';
import Toast from 'react-native-toast-message';

const FilesScreen = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState({});

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await api.getFiles(1, 50, searchQuery);
      setFiles(response.files);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load files',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFiles();
  };

  const handleSearch = () => {
    setLoading(true);
    loadFiles();
  };

  const pickDocument = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.images,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.xls,
          DocumentPicker.types.xlsx,
        ],
        allowMultiSelection: true,
      });

      // Upload selected files
      for (const file of results) {
        await api.uploadFile(file);
      }

      Toast.show({
        type: 'success',
        text1: `${results.length} file(s) uploaded successfully`,
      });

      loadFiles();
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Toast.show({
          type: 'error',
          text1: 'File upload failed',
          text2: error.message,
        });
      }
    }
  };

  const handleDownload = async (file) => {
    try {
      // In a real app, you would download the file and save it locally
      // For now, we'll just show a success message
      Toast.show({
        type: 'success',
        text1: 'Download started',
        text2: file.filename,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Download failed',
      });
    }
  };

  const handleShare = async (file) => {
    try {
      // In a real app, you would get the file URL and share it
      const shareOptions = {
        title: 'Share File',
        message: `Check out this file: ${file.filename}`,
        // url: file.downloadUrl, // You would get this from your API
      };

      await Share.open(shareOptions);
    } catch (error) {
      if (error.message !== 'User did not share') {
        Toast.show({
          type: 'error',
          text1: 'Share failed',
        });
      }
    }
  };

  const handleDelete = async (fileId, filename) => {
    Alert.alert(
      'Delete File',
      `Are you sure you want to delete "${filename}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteFile(fileId);
              setFiles(files.filter(f => f.id !== fileId));
              Toast.show({
                type: 'success',
                text1: 'File deleted successfully',
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Failed to delete file',
              });
            }
          },
        },
      ]
    );
  };

  const toggleMenu = (fileId) => {
    setMenuVisible(prev => ({
      ...prev,
      [fileId]: !prev[fileId],
    }));
  };

  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Title style={styles.title}>My Files</Title>
          <Text style={styles.subtitle}>
            {files.length} file{files.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search files..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={handleSearch}
            style={styles.searchbar}
          />
        </View>

        {/* Files List */}
        <Card style={styles.card}>
          <Card.Content>
            {filteredFiles.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="file-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No files match your search' : 'No files yet'}
                </Text>
                <Button
                  mode="contained"
                  onPress={pickDocument}
                  style={styles.emptyButton}
                  icon="upload"
                >
                  Upload Files
                </Button>
              </View>
            ) : (
              <View>
                {filteredFiles.map((file, index) => (
                  <View key={file.id}>
                    <List.Item
                      title={file.filename}
                      description={`${formatFileSize(file.size)} • ${formatDate(file.created_at)}`}
                      left={() => (
                        <Icon
                          name={getFileIcon(file.type)}
                          size={24}
                          color={file.type === 'application/pdf' ? '#F44336' : '#2196F3'}
                        />
                      )}
                      right={() => (
                        <Menu
                          visible={menuVisible[file.id] || false}
                          onDismiss={() => toggleMenu(file.id)}
                          anchor={
                            <Button
                              mode="text"
                              onPress={() => toggleMenu(file.id)}
                              icon="dots-vertical"
                            />
                          }
                        >
                          <Menu.Item
                            onPress={() => {
                              toggleMenu(file.id);
                              handleDownload(file);
                            }}
                            title="Download"
                            leadingIcon="download"
                          />
                          <Menu.Item
                            onPress={() => {
                              toggleMenu(file.id);
                              handleShare(file);
                            }}
                            title="Share"
                            leadingIcon="share"
                          />
                          <Divider />
                          <Menu.Item
                            onPress={() => {
                              toggleMenu(file.id);
                              handleDelete(file.id, file.filename);
                            }}
                            title="Delete"
                            leadingIcon="delete"
                            titleStyle={{ color: '#F44336' }}
                          />
                        </Menu>
                      )}
                    />
                    {index < filteredFiles.length - 1 && <Divider />}
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
        onPress={pickDocument}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchbar: {
    elevation: 2,
  },
  card: {
    margin: 20,
    marginTop: 10,
    elevation: 4,
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
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default FilesScreen;