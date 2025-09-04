import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DocumentPicker from 'react-native-document-picker';
import * as Progress from 'react-native-progress';

import ModernCard from '../components/ui/ModernCard';
import ModernButton from '../components/ui/ModernButton';
import { colors, spacing, borderRadius } from '../theme/colors';
import { pdfService } from '../services/pdfService';
import { api } from '../lib/api';

const { width: screenWidth } = Dimensions.get('window');

const PDFProcessingScreen = ({ navigation, route }) => {
  const { tool, files: initialFiles } = route.params || {};
  const insets = useSafeAreaInsets();
  
  const [selectedFiles, setSelectedFiles] = useState(initialFiles || []);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState(null);
  const [options, setOptions] = useState({});

  // Animation values
  const headerScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    headerScale.value = withSpring(1);
    contentOpacity.value = withSpring(1);
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [
      {
        translateY: interpolate(contentOpacity.value, [0, 1], [20, 0]),
      },
    ],
  }));

  const toolConfigs = {
    merge: {
      title: 'Merge PDFs',
      icon: 'merge',
      gradient: colors.gradients.blue,
      description: 'Combine multiple PDF files into one document',
      minFiles: 2,
      acceptedTypes: ['application/pdf'],
      options: [
        { key: 'addBookmarks', label: 'Add Bookmarks', type: 'boolean', default: false },
        { key: 'addPageNumbers', label: 'Add Page Numbers', type: 'boolean', default: false },
        { key: 'pageNumberPosition', label: 'Page Number Position', type: 'select', 
          options: ['bottom-right', 'bottom-center', 'bottom-left', 'top-right', 'top-center', 'top-left'],
          default: 'bottom-right' },
        { key: 'removeBlankPages', label: 'Remove Blank Pages', type: 'boolean', default: false },
        { key: 'optimizeForPrint', label: 'Optimize for Print', type: 'boolean', default: false },
      ]
    },
    split: {
      title: 'Split PDF',
      icon: 'content-cut',
      gradient: colors.gradients.green,
      description: 'Split PDF into multiple files',
      minFiles: 1,
      maxFiles: 1,
      acceptedTypes: ['application/pdf'],
      options: [
        { key: 'splitType', label: 'Split Method', type: 'select',
          options: ['pages', 'size', 'bookmarks'], default: 'pages' },
        { key: 'pagesPerFile', label: 'Pages per File', type: 'number', default: 1, min: 1, max: 50 },
        { key: 'preserveBookmarks', label: 'Preserve Bookmarks', type: 'boolean', default: true },
        { key: 'optimizeOutput', label: 'Optimize Output', type: 'boolean', default: false },
      ]
    },
    compress: {
      title: 'Compress PDF',
      icon: 'archive',
      gradient: colors.gradients.warning,
      description: 'Reduce PDF file size while maintaining quality',
      minFiles: 1,
      maxFiles: 1,
      acceptedTypes: ['application/pdf'],
      options: [
        { key: 'compressionLevel', label: 'Compression Level', type: 'select',
          options: ['low', 'medium', 'high', 'maximum'], default: 'medium' },
        { key: 'imageQuality', label: 'Image Quality', type: 'slider', default: 85, min: 10, max: 100 },
        { key: 'optimizeImages', label: 'Optimize Images', type: 'boolean', default: true },
        { key: 'removeMetadata', label: 'Remove Metadata', type: 'boolean', default: false },
        { key: 'convertToGrayscale', label: 'Convert to Grayscale', type: 'boolean', default: false },
      ]
    },
    convert: {
      title: 'Convert Images to PDF',
      icon: 'image-multiple',
      gradient: colors.gradients.secondary,
      description: 'Convert images to PDF format',
      minFiles: 1,
      acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      options: [
        { key: 'pageSize', label: 'Page Size', type: 'select',
          options: ['A4', 'Letter', 'Legal', 'A3', 'A5'], default: 'A4' },
        { key: 'orientation', label: 'Orientation', type: 'select',
          options: ['portrait', 'landscape'], default: 'portrait' },
        { key: 'imagesPerPage', label: 'Images per Page', type: 'select',
          options: [1, 2, 4], default: 1 },
        { key: 'imageLayout', label: 'Image Layout', type: 'select',
          options: ['fit', 'fill', 'stretch', 'center'], default: 'fit' },
        { key: 'imageQuality', label: 'Image Quality', type: 'slider', default: 95, min: 50, max: 100 },
      ]
    },
    ocr: {
      title: 'OCR Text Extraction',
      icon: 'text-recognition',
      gradient: colors.gradients.purple,
      description: 'Extract text from scanned PDFs',
      minFiles: 1,
      maxFiles: 1,
      acceptedTypes: ['application/pdf'],
      options: [
        { key: 'languages', label: 'Languages', type: 'multiselect',
          options: ['eng', 'spa', 'fra', 'deu', 'ita', 'por'], default: ['eng'] },
        { key: 'confidenceThreshold', label: 'Confidence Threshold', type: 'slider', 
          default: 0.7, min: 0.1, max: 1.0, step: 0.1 },
        { key: 'enhanceImage', label: 'Enhance Image', type: 'boolean', default: true },
      ]
    },
    'ai-summary': {
      title: 'AI Summary',
      icon: 'robot',
      gradient: colors.gradients.danger,
      description: 'Generate intelligent document summaries',
      minFiles: 1,
      maxFiles: 1,
      acceptedTypes: ['application/pdf'],
      options: [
        { key: 'summaryType', label: 'Summary Type', type: 'select',
          options: ['brief', 'auto', 'detailed'], default: 'auto' },
      ]
    },
  };

  const currentTool = toolConfigs[tool] || toolConfigs.merge;

  const handleSelectFiles = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: currentTool.acceptedTypes,
        allowMultiSelection: !currentTool.maxFiles || currentTool.maxFiles > 1,
      });
      
      setSelectedFiles(result);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to select files');
      }
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleProcess = async () => {
    if (selectedFiles.length < currentTool.minFiles) {
      Alert.alert('Error', `Please select at least ${currentTool.minFiles} file(s)`);
      return;
    }

    setProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      // First upload files if they're local
      let fileIds = [];
      
      if (selectedFiles[0].uri) {
        // Files are local, need to upload
        setCurrentStep('Uploading files...');
        
        const uploadResults = await pdfService.uploadFiles(selectedFiles, (progressInfo) => {
          setProgress(progressInfo.current / progressInfo.total * 0.3); // 30% for upload
          setCurrentStep(`Uploading ${progressInfo.fileName}...`);
        });
        
        fileIds = uploadResults.map(result => result.file.id);
      } else {
        // Files are already uploaded
        fileIds = selectedFiles.map(file => file.id);
      }

      setProgress(0.3);
      
      // Process based on tool type
      let result;
      const progressCallback = (progressInfo) => {
        setProgress(0.3 + (progressInfo.progress || 0) * 0.7); // 70% for processing
        setCurrentStep(progressInfo.message || 'Processing...');
      };

      switch (tool) {
        case 'merge':
          result = await pdfService.mergePDFs(fileIds, options, progressCallback);
          break;
        case 'split':
          result = await pdfService.splitPDF(fileIds[0], options, progressCallback);
          break;
        case 'compress':
          result = await pdfService.compressPDF(fileIds[0], options, progressCallback);
          break;
        case 'convert':
          result = await pdfService.convertImagesToPDF(fileIds, options, progressCallback);
          break;
        case 'ocr':
          result = await pdfService.performOCR(fileIds[0], options, progressCallback);
          break;
        case 'ai-summary':
          result = await pdfService.summarizeFile(fileIds[0], options.summaryType, progressCallback);
          break;
        default:
          throw new Error('Unknown tool type');
      }

      setProgress(1);
      setCurrentStep('Completed!');
      setResult(result);
      
    } catch (error) {
      Alert.alert('Error', error.message || 'Processing failed');
      setCurrentStep('Failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (result?.file?.id) {
      try {
        await pdfService.shareFile(result.file.id, result.file.filename);
      } catch (error) {
        Alert.alert('Error', 'Failed to download file');
      }
    }
  };

  const handleViewResult = async () => {
    if (result?.file?.id) {
      try {
        await pdfService.viewFile(result.file.id, result.file.filename);
      } catch (error) {
        Alert.alert('Error', 'Failed to open file');
      }
    }
  };

  const OptionControl = ({ option }) => {
    const value = options[option.key] ?? option.default;

    switch (option.type) {
      case 'boolean':
        return (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              backgroundColor: colors.secondary[50],
              borderRadius: borderRadius.lg,
              marginBottom: spacing.md,
            }}
            onPress={() => handleOptionChange(option.key, !value)}
          >
            <Text style={{ fontSize: 16, color: colors.text.primary }}>
              {option.label}
            </Text>
            <View
              style={{
                width: 50,
                height: 30,
                borderRadius: 15,
                backgroundColor: value ? colors.primary[500] : colors.secondary[300],
                justifyContent: 'center',
                alignItems: value ? 'flex-end' : 'flex-start',
                paddingHorizontal: 2,
              }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: colors.background,
                }}
              />
            </View>
          </TouchableOpacity>
        );

      case 'select':
        return (
          <View style={{ marginBottom: spacing.md }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: spacing.sm,
              }}
            >
              {option.label}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {option.options.map((optionValue) => (
                <TouchableOpacity
                  key={optionValue}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: borderRadius.md,
                    backgroundColor: value === optionValue ? colors.primary[500] : colors.secondary[100],
                    marginRight: spacing.sm,
                  }}
                  onPress={() => handleOptionChange(option.key, optionValue)}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: value === optionValue ? colors.text.inverse : colors.text.primary,
                      textTransform: 'capitalize',
                    }}
                  >
                    {optionValue}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case 'slider':
        return (
          <View style={{ marginBottom: spacing.md }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.sm,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text.primary,
                }}
              >
                {option.label}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.text.secondary,
                }}
              >
                {value}{option.unit || ''}
              </Text>
            </View>
            {/* Simplified slider - in production, use a proper slider component */}
            <View
              style={{
                height: 4,
                backgroundColor: colors.secondary[200],
                borderRadius: 2,
                position: 'relative',
              }}
            >
              <View
                style={{
                  height: 4,
                  backgroundColor: colors.primary[500],
                  borderRadius: 2,
                  width: `${((value - option.min) / (option.max - option.min)) * 100}%`,
                }}
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <LinearGradient
        colors={currentTool.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.lg,
          paddingHorizontal: spacing.lg,
        }}
      >
        <Animated.View style={headerAnimatedStyle}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}
          >
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.md,
              }}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={20} color={colors.text.inverse} />
            </TouchableOpacity>
            
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: colors.text.inverse,
                  marginBottom: 4,
                }}
              >
                {currentTool.title}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                {currentTool.description}
              </Text>
            </View>
            
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={currentTool.icon} size={24} color={colors.text.inverse} />
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <Animated.View style={[contentAnimatedStyle, { flex: 1 }]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: spacing.xl,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* File Selection */}
          <ModernCard padding="lg" style={{ marginBottom: spacing.lg }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: spacing.md,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.text.primary,
                }}
              >
                Select Files
              </Text>
              <ModernButton
                title="Browse"
                size="sm"
                variant="outline"
                onPress={handleSelectFiles}
              />
            </View>
            
            {selectedFiles.length === 0 ? (
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: spacing.xl,
                }}
              >
                <Icon
                  name="file-plus"
                  size={48}
                  color={colors.text.tertiary}
                  style={{ marginBottom: spacing.md }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.text.secondary,
                    textAlign: 'center',
                  }}
                >
                  No files selected
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text.tertiary,
                    textAlign: 'center',
                    marginTop: spacing.sm,
                  }}
                >
                  Tap Browse to select files
                </Text>
              </View>
            ) : (
              <View>
                {selectedFiles.map((file, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: spacing.md,
                      borderBottomWidth: index < selectedFiles.length - 1 ? 1 : 0,
                      borderBottomColor: colors.secondary[200],
                    }}
                  >
                    <Icon
                      name={pdfService.getFileIcon(file.type)}
                      size={24}
                      color={colors.primary[500]}
                      style={{ marginRight: spacing.md }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: colors.text.primary,
                        }}
                        numberOfLines={1}
                      >
                        {file.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.text.secondary,
                        }}
                      >
                        {pdfService.formatFileSize(file.size || 0)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveFile(index)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.error + '20',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name="close" size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ModernCard>

          {/* Options */}
          {currentTool.options && currentTool.options.length > 0 && (
            <ModernCard padding="lg" style={{ marginBottom: spacing.lg }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                }}
              >
                Options
              </Text>
              
              {currentTool.options.map((option) => (
                <OptionControl key={option.key} option={option} />
              ))}
            </ModernCard>
          )}

          {/* Processing Status */}
          {processing && (
            <ModernCard padding="lg" style={{ marginBottom: spacing.lg }}>
              <View style={{ alignItems: 'center' }}>
                <Progress.Circle
                  progress={progress}
                  size={80}
                  thickness={6}
                  color={colors.primary[500]}
                  unfilledColor={colors.secondary[200]}
                  borderWidth={0}
                  showsText
                  textStyle={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: colors.primary[500],
                  }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.text.primary,
                    marginTop: spacing.md,
                    textAlign: 'center',
                  }}
                >
                  {currentStep}
                </Text>
              </View>
            </ModernCard>
          )}

          {/* Result */}
          {result && (
            <ModernCard padding="lg" style={{ marginBottom: spacing.lg }}>
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: colors.success + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.md,
                  }}
                >
                  <Icon name="check-circle" size={40} color={colors.success} />
                </View>
                
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: colors.text.primary,
                    marginBottom: spacing.sm,
                    textAlign: 'center',
                  }}
                >
                  Processing Complete!
                </Text>
                
                {result.file && (
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.text.secondary,
                      marginBottom: spacing.lg,
                      textAlign: 'center',
                    }}
                  >
                    {result.file.filename} • {pdfService.formatFileSize(result.file.size)}
                  </Text>
                )}
                
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <ModernButton
                    title="View"
                    variant="outline"
                    onPress={handleViewResult}
                    style={{ flex: 1 }}
                  />
                  <ModernButton
                    title="Share"
                    gradient={currentTool.gradient}
                    onPress={handleDownload}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            </ModernCard>
          )}

          {/* Process Button */}
          {!processing && !result && (
            <ModernButton
              title={`${currentTool.title}`}
              gradient={currentTool.gradient}
              size="lg"
              fullWidth
              onPress={handleProcess}
              disabled={selectedFiles.length < currentTool.minFiles}
            />
          )}

          {/* Process Another Button */}
          {result && (
            <ModernButton
              title="Process Another"
              variant="outline"
              size="lg"
              fullWidth
              onPress={() => {
                setSelectedFiles([]);
                setResult(null);
                setProgress(0);
                setCurrentStep('');
              }}
            />
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default PDFProcessingScreen;