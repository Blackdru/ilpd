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
  Chip,
  List,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DocumentPicker from 'react-native-document-picker';
import { api } from '../lib/api';
import { formatFileSize, getFileIcon } from '../lib/utils';
import Toast from 'react-native-toast-message';

const ToolsScreen = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [userFiles, setUserFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('merge');

  useEffect(() => {
    loadUserFiles();
  }, []);

  const loadUserFiles = async () => {
    try {
      const response = await api.getFiles(1, 50);
      setUserFiles(response.files);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load files',
      });
    }
  };

  const pickDocument = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
        allowMultiSelection: true,
      });

      // Upload selected files
      for (const file of results) {
        await api.uploadFile(file);
      }

      Toast.show({
        type: 'success',
        text1: 'Files uploaded successfully',
      });

      loadUserFiles();
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Toast.show({
          type: 'error',
          text1: 'File upload failed',
        });
      }
    }
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleMergePDFs = async () => {
    if (selectedFiles.length < 2) {
      Alert.alert('Error', 'Please select at least 2 PDF files to merge');
      return;
    }

    const pdfFiles = userFiles.filter(f =>
      selectedFiles.includes(f.id) && f.type === 'application/pdf'
    );

    if (pdfFiles.length !== selectedFiles.length) {
      Alert.alert('Error', 'All selected files must be PDFs');
      return;
    }

    setLoading(true);
    try {
      const response = await api.mergePDFs(selectedFiles, 'merged-document.pdf');
      Toast.show({
        type: 'success',
        text1: 'PDFs merged successfully!',
      });
      setSelectedFiles([]);
      loadUserFiles();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to merge PDFs',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSplitPDF = async (fileId) => {
    setLoading(true);
    try {
      const response = await api.splitPDF(fileId);
      Toast.show({
        type: 'success',
        text1: 'PDF split successfully!',
      });
      loadUserFiles();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to split PDF',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompressPDF = async (fileId) => {
    setLoading(true);
    try {
      const response = await api.compressPDF(fileId);
      Toast.show({
        type: 'success',
        text1: 'PDF compressed successfully!',
      });
      loadUserFiles();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to compress PDF',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToPDF = async () => {
    const imageFiles = userFiles.filter(f =>
      selectedFiles.includes(f.id) && f.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      Alert.alert('Error', 'Please select at least one image file');
      return;
    }

    setLoading(true);
    try {
      const response = await api.convertImagesToPDF(selectedFiles, 'converted-images.pdf');
      Toast.show({
        type: 'success',
        text1: 'Images converted to PDF successfully!',
      });
      setSelectedFiles([]);
      loadUserFiles();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to convert images',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'merge', title: 'Merge', icon: 'merge' },
    { key: 'split', title: 'Split', icon: 'call-split' },
    { key: 'compress', title: 'Compress', icon: 'compress' },
    { key: 'convert', title: 'Convert', icon: 'file-image' },
  ];

  const pdfFiles = userFiles.filter(f => f.type === 'application/pdf');
  const imageFiles = userFiles.filter(f => f.type.startsWith('image/'));

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Title style={styles.title}>PDF Tools</Title>
          <Button
            mode="contained"
            onPress={pickDocument}
            icon="upload"
            style={styles.uploadButton}
          >
            Upload Files
          </Button>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
        >
          {tabs.map((tab) => (
            <Chip
              key={tab.key}
              selected={activeTab === tab.key}
              onPress={() => setActiveTab(tab.key)}
              icon={tab.icon}
              style={styles.tab}
            >
              {tab.title}
            </Chip>
          ))}
        </ScrollView>

        {/* Content */}
        <Card style={styles.card}>
          <Card.Content>
            {activeTab === 'merge' && (
              <View>
                <Title>Merge PDFs</Title>
                <Text style={styles.description}>
                  Select multiple PDF files to combine them into one document
                </Text>
                
                <View style={styles.actionHeader}>
                  <Text>{selectedFiles.length} files selected</Text>
                  <Button
                    mode="contained"
                    onPress={handleMergePDFs}
                    disabled={selectedFiles.length < 2 || loading}
                    loading={loading}
                  >
                    Merge PDFs
                  </Button>
                </View>

                <Divider style={styles.divider} />

                {pdfFiles.map((file) => (
                  <List.Item
                    key={file.id}
                    title={file.filename}
                    description={formatFileSize(file.size)}
                    left={() => <Icon name={getFileIcon(file.type)} size={24} />}
                    right={() => (
                      <Chip
                        selected={selectedFiles.includes(file.id)}
                        onPress={() => toggleFileSelection(file.id)}
                      >
                        {selectedFiles.includes(file.id) ? 'Selected' : 'Select'}
                      </Chip>
                    )}
                  />
                ))}
              </View>
            )}

            {activeTab === 'split' && (
              <View>
                <Title>Split PDFs</Title>
                <Text style={styles.description}>
                  Split PDF files into separate pages
                </Text>

                <Divider style={styles.divider} />

                {pdfFiles.map((file) => (
                  <List.Item
                    key={file.id}
                    title={file.filename}
                    description={formatFileSize(file.size)}
                    left={() => <Icon name={getFileIcon(file.type)} size={24} />}
                    right={() => (
                      <Button
                        mode="outlined"
                        onPress={() => handleSplitPDF(file.id)}
                        disabled={loading}
                        loading={loading}
                      >
                        Split
                      </Button>
                    )}
                  />
                ))}
              </View>
            )}

            {activeTab === 'compress' && (
              <View>
                <Title>Compress PDFs</Title>
                <Text style={styles.description}>
                  Reduce PDF file size while maintaining quality
                </Text>

                <Divider style={styles.divider} />

                {pdfFiles.map((file) => (
                  <List.Item
                    key={file.id}
                    title={file.filename}
                    description={formatFileSize(file.size)}
                    left={() => <Icon name={getFileIcon(file.type)} size={24} />}
                    right={() => (
                      <Button
                        mode="outlined"
                        onPress={() => handleCompressPDF(file.id)}
                        disabled={loading}
                        loading={loading}
                      >
                        Compress
                      </Button>
                    )}
                  />
                ))}
              </View>
            )}

            {activeTab === 'convert' && (
              <View>
                <Title>Convert to PDF</Title>
                <Text style={styles.description}>
                  Convert images to PDF format
                </Text>

                <View style={styles.actionHeader}>
                  <Text>{selectedFiles.length} images selected</Text>
                  <Button
                    mode="contained"
                    onPress={handleConvertToPDF}
                    disabled={selectedFiles.length === 0 || loading}
                    loading={loading}
                  >
                    Convert to PDF
                  </Button>
                </View>

                <Divider style={styles.divider} />

                {imageFiles.map((file) => (
                  <List.Item
                    key={file.id}
                    title={file.filename}
                    description={formatFileSize(file.size)}
                    left={() => <Icon name={getFileIcon(file.type)} size={24} />}
                    right={() => (
                      <Chip
                        selected={selectedFiles.includes(file.id)}
                        onPress={() => toggleFileSelection(file.id)}
                      >
                        {selectedFiles.includes(file.id) ? 'Selected' : 'Select'}
                      </Chip>
                    )}
                  />
                ))}
              </View>
            )}

            {((activeTab === 'merge' || activeTab === 'split' || activeTab === 'compress') && pdfFiles.length === 0) ||
             (activeTab === 'convert' && imageFiles.length === 0) ? (
              <View style={styles.emptyState}>
                <Icon name="file-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  No {activeTab === 'convert' ? 'image' : 'PDF'} files found
                </Text>
                <Button
                  mode="outlined"
                  onPress={pickDocument}
                  style={styles.emptyButton}
                >
                  Upload Files
                </Button>
              </View>
            ) : null}
          </Card.Content>
        </Card>
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  uploadButton: {
    marginLeft: 10,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  tab: {
    marginRight: 8,
  },
  card: {
    margin: 20,
    marginTop: 10,
    elevation: 4,
  },
  description: {
    opacity: 0.7,
    marginBottom: 16,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  divider: {
    marginBottom: 16,
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
});

export default ToolsScreen;