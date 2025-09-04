import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
  Layout,
  FadeInDown,
  FadeOutUp,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HapticFeedback from 'react-native-haptic-feedback';
import DocumentPicker from 'react-native-document-picker';

import ModernCard from '../components/ui/ModernCard';
import ModernButton from '../components/ui/ModernButton';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

const ModernFilesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [files, setFiles] = useState([
    {
      id: '1',
      name: 'Annual Report 2024.pdf',
      size: '2.4 MB',
      date: '2 hours ago',
      type: 'pdf',
      hasOCR: true,
      hasSummary: false,
      hasChat: true,
    },
    {
      id: '2',
      name: 'Invoice_March.pdf',
      size: '1.8 MB',
      date: '5 hours ago',
      type: 'pdf',
      hasOCR: false,
      hasSummary: true,
      hasChat: false,
    },
    {
      id: '3',
      name: 'Contract_Draft.pdf',
      size: '3.2 MB',
      date: '1 day ago',
      type: 'pdf',
      hasOCR: true,
      hasSummary: true,
      hasChat: true,
    },
    {
      id: '4',
      name: 'Presentation.pdf',
      size: '5.1 MB',
      date: '2 days ago',
      type: 'pdf',
      hasOCR: false,
      hasSummary: false,
      hasChat: false,
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'size'

  // Animation values
  const headerScale = useSharedValue(0.8);
  const searchOpacity = useSharedValue(0);

  useEffect(() => {
    headerScale.value = withSpring(1);
    searchOpacity.value = withDelay(200, withSpring(1));
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    opacity: searchOpacity.value,
    transform: [
      {
        translateY: interpolate(searchOpacity.value, [0, 1], [-20, 0]),
      },
    ],
  }));

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return parseFloat(b.size) - parseFloat(a.size);
      case 'date':
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });

  const onRefresh = async () => {
    setRefreshing(true);
    HapticFeedback.trigger('impactLight');
    
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      HapticFeedback.trigger('notificationSuccess');
    }, 1500);
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
        allowMultiSelection: true,
      });
      
      HapticFeedback.trigger('notificationSuccess');
      // Handle upload logic here
      console.log('Selected files:', result);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled
      } else {
        Alert.alert('Error', 'Failed to pick files');
      }
    }
  };

  const handleFilePress = (file) => {
    HapticFeedback.trigger('impactMedium');
    navigation.navigate('FileDetails', { file });
  };

  const handleFileAction = (file, action) => {
    HapticFeedback.trigger('impactLight');
    
    switch (action) {
      case 'share':
        // Handle share
        break;
      case 'delete':
        Alert.alert(
          'Delete File',
          `Are you sure you want to delete ${file.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                setFiles(prev => prev.filter(f => f.id !== file.id));
                HapticFeedback.trigger('notificationSuccess');
              },
            },
          ]
        );
        break;
      case 'ai':
        navigation.navigate('AIAssistant', { file });
        break;
    }
  };

  const FileCard = ({ file, index }) => {
    const animValue = useSharedValue(0);

    useEffect(() => {
      animValue.value = withDelay(300 + index * 50, withSpring(1));
    }, []);

    const animStyle = useAnimatedStyle(() => ({
      opacity: animValue.value,
      transform: [
        {
          translateY: interpolate(animValue.value, [0, 1], [30, 0]),
        },
        {
          scale: interpolate(animValue.value, [0, 1], [0.95, 1]),
        },
      ],
    }));

    const getFileIcon = () => {
      switch (file.type) {
        case 'pdf':
          return 'file-pdf-box';
        case 'image':
          return 'image';
        default:
          return 'file';
      }
    };

    const getAIBadges = () => {
      const badges = [];
      if (file.hasOCR) badges.push({ label: 'OCR', color: colors.gradients.blue });
      if (file.hasSummary) badges.push({ label: 'Summary', color: colors.gradients.green });
      if (file.hasChat) badges.push({ label: 'Chat', color: colors.gradients.purple });
      return badges;
    };

    return (
      <Animated.View
        style={[animStyle, { marginBottom: spacing.md }]}
        layout={Layout.springify()}
        entering={FadeInDown.delay(index * 50)}
        exiting={FadeOutUp}
      >
        <ModernCard
          onPress={() => handleFilePress(file)}
          padding="md"
          style={{ overflow: 'visible' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* File Icon */}
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: colors.primary[100],
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.md,
              }}
            >
              <Icon
                name={getFileIcon()}
                size={24}
                color={colors.primary[500]}
              />
            </View>
            
            {/* File Info */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 2,
                }}
                numberOfLines={1}
              >
                {file.name}
              </Text>
              
              <Text
                style={{
                  fontSize: 12,
                  color: colors.text.secondary,
                  marginBottom: spacing.xs,
                }}
              >
                {file.size} • {file.date}
              </Text>
              
              {/* AI Badges */}
              {getAIBadges().length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {getAIBadges().map((badge, badgeIndex) => (
                    <View
                      key={badgeIndex}
                      style={{
                        paddingHorizontal: spacing.xs,
                        paddingVertical: 2,
                        borderRadius: 8,
                        backgroundColor: colors.secondary[100],
                        marginRight: spacing.xs,
                        marginTop: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '600',
                          color: colors.primary[600],
                        }}
                      >
                        {badge.label}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            
            {/* Actions */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {(file.hasOCR || file.hasSummary || file.hasChat) && (
                <TouchableOpacity
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: colors.accent.purple + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: spacing.sm,
                  }}
                  onPress={() => handleFileAction(file, 'ai')}
                >
                  <Icon
                    name="robot"
                    size={16}
                    color={colors.accent.purple}
                  />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.secondary[100],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  // Show action sheet
                  Alert.alert(
                    file.name,
                    'Choose an action',
                    [
                      { text: 'Share', onPress: () => handleFileAction(file, 'share') },
                      { text: 'Delete', onPress: () => handleFileAction(file, 'delete'), style: 'destructive' },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  );
                }}
              >
                <Icon
                  name="dots-vertical"
                  size={16}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ModernCard>
      </Animated.View>
    );
  };

  const EmptyState = () => (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xxxl,
      }}
    >
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.secondary[100],
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.xl,
        }}
      >
        <Icon
          name="file-multiple-outline"
          size={60}
          color={colors.secondary[400]}
        />
      </View>
      
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: spacing.sm,
        }}
      >
        No Files Found
      </Text>
      
      <Text
        style={{
          fontSize: 16,
          color: colors.text.secondary,
          textAlign: 'center',
          marginBottom: spacing.xl,
        }}
      >
        {searchQuery ? 'Try adjusting your search' : 'Upload your first PDF to get started'}
      </Text>
      
      {!searchQuery && (
        <ModernButton
          title="Upload Files"
          gradient={colors.gradients.primary}
          icon={({ size, color }) => (
            <Icon name="upload" size={size} color={color} />
          )}
          onPress={handleUpload}
        />
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <LinearGradient
        colors={colors.gradients.primary}
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
              justifyContent: 'space-between',
              marginBottom: spacing.md,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: colors.text.inverse,
                  marginBottom: 4,
                }}
              >
                My Files
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                {files.length} files • {files.filter(f => f.hasOCR || f.hasSummary || f.hasChat).length} AI-enhanced
              </Text>
            </View>
            
            <TouchableOpacity
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={handleUpload}
            >
              <Icon name="plus" size={24} color={colors.text.inverse} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Search and Filters */}
      <Animated.View
        style={[
          searchAnimatedStyle,
          {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            backgroundColor: colors.background,
          },
        ]}
      >
        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.secondary[100],
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.md,
            marginBottom: spacing.md,
          }}
        >
          <Icon
            name="magnify"
            size={20}
            color={colors.text.secondary}
            style={{ marginRight: spacing.sm }}
          />
          <TextInput
            style={{
              flex: 1,
              fontSize: 16,
              color: colors.text.primary,
              paddingVertical: spacing.md,
            }}
            placeholder="Search files..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon
                name="close"
                size={20}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter Row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: spacing.md }}
          >
            {['date', 'name', 'size'].map((sort) => (
              <TouchableOpacity
                key={sort}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: borderRadius.md,
                  backgroundColor: sortBy === sort ? colors.primary[100] : 'transparent',
                  marginRight: spacing.sm,
                }}
                onPress={() => setSortBy(sort)}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: sortBy === sort ? colors.primary[600] : colors.text.secondary,
                    textTransform: 'capitalize',
                  }}
                >
                  {sort}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.secondary[100],
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          >
            <Icon
              name={viewMode === 'list' ? 'view-grid' : 'view-list'}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Files List */}
      <View style={{ flex: 1 }}>
        {sortedFiles.length === 0 ? (
          <EmptyState />
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: spacing.lg,
              paddingBottom: spacing.xl,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary[500]}
                colors={[colors.primary[500]]}
              />
            }
          >
            {sortedFiles.map((file, index) => (
              <FileCard key={file.id} file={file} index={index} />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default ModernFilesScreen;