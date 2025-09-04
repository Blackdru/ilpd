import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HapticFeedback from 'react-native-haptic-feedback';
import * as Progress from 'react-native-progress';

import ModernCard from '../components/ui/ModernCard';
import ModernButton from '../components/ui/ModernButton';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

const ModernToolsScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [selectedTool, setSelectedTool] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Animation values
  const headerScale = useSharedValue(0.8);
  const toolsOpacity = useSharedValue(0);

  useEffect(() => {
    headerScale.value = withSpring(1);
    toolsOpacity.value = withDelay(300, withSpring(1));
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const toolsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: toolsOpacity.value,
    transform: [
      {
        translateY: interpolate(toolsOpacity.value, [0, 1], [30, 0]),
      },
    ],
  }));

  const tools = [
    {
      id: 'merge',
      title: 'Merge PDFs',
      subtitle: 'Combine multiple documents',
      icon: 'merge',
      gradient: colors.gradients.blue,
      description: 'Combine multiple PDF files into a single document with professional options.',
      features: ['Smart bookmarking', 'Page numbering', 'Custom ordering'],
    },
    {
      id: 'split',
      title: 'Split PDF',
      subtitle: 'Extract pages',
      icon: 'content-cut',
      gradient: colors.gradients.green,
      description: 'Split PDF files by pages, size, or bookmarks with precision.',
      features: ['Multiple split methods', 'Custom ranges', 'Batch processing'],
    },
    {
      id: 'compress',
      title: 'Compress PDF',
      subtitle: 'Reduce file size',
      icon: 'archive',
      gradient: colors.gradients.warning,
      description: 'Reduce PDF file size while maintaining quality using AI optimization.',
      features: ['Smart compression', 'Quality control', 'Batch processing'],
    },
    {
      id: 'convert',
      title: 'Convert Images',
      subtitle: 'Images to PDF',
      icon: 'image-multiple',
      gradient: colors.gradients.secondary,
      description: 'Convert images to PDF with custom layouts and professional formatting.',
      features: ['Multiple layouts', 'Custom sizing', 'Quality control'],
    },
    {
      id: 'ocr',
      title: 'OCR Extract',
      subtitle: 'Extract text',
      icon: 'text-recognition',
      gradient: colors.gradients.purple,
      description: 'Extract text from scanned documents with industry-leading accuracy.',
      features: ['99.9% accuracy', 'Multiple languages', 'Searchable text'],
    },
    {
      id: 'ai-summary',
      title: 'AI Summary',
      subtitle: 'Smart summaries',
      icon: 'robot',
      gradient: colors.gradients.danger,
      description: 'Generate intelligent summaries of your documents automatically.',
      features: ['Multiple summary types', 'Key insights', 'Quick overview'],
    },
  ];

  const handleToolPress = (tool) => {
    HapticFeedback.trigger('impactMedium');
    setSelectedTool(tool);
    setShowModal(true);
  };

  const handleProcessStart = () => {
    setShowModal(false);
    setProcessing(true);
    setProgress(0);
    
    HapticFeedback.trigger('impactLight');
    
    // Simulate processing
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 1) {
          clearInterval(interval);
          setProcessing(false);
          HapticFeedback.trigger('notificationSuccess');
          return 1;
        }
        return prev + 0.1;
      });
    }, 200);
  };

  const ToolCard = ({ tool, index }) => {
    const animValue = useSharedValue(0);

    useEffect(() => {
      animValue.value = withDelay(500 + index * 100, withSpring(1));
    }, []);

    const animStyle = useAnimatedStyle(() => ({
      opacity: animValue.value,
      transform: [
        {
          translateY: interpolate(animValue.value, [0, 1], [50, 0]),
        },
        {
          scale: interpolate(animValue.value, [0, 1], [0.9, 1]),
        },
      ],
    }));

    return (
      <Animated.View style={[animStyle, { marginBottom: spacing.md }]}>
        <ModernCard
          onPress={() => handleToolPress(tool)}
          gradient={tool.gradient}
          padding="lg"
          style={{ minHeight: 140 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.md,
              }}
            >
              <Icon name={tool.icon} size={28} color={colors.text.inverse} />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.text.inverse,
                  marginBottom: 4,
                }}
              >
                {tool.title}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginBottom: spacing.sm,
                }}
              >
                {tool.subtitle}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginRight: spacing.sm,
                  }}
                >
                  Tap to use
                </Text>
                <Icon
                  name="arrow-right"
                  size={16}
                  color="rgba(255, 255, 255, 0.7)"
                />
              </View>
            </View>
          </View>
        </ModernCard>
      </Animated.View>
    );
  };

  const ProcessingModal = () => (
    <Modal
      visible={processing}
      transparent
      animationType="fade"
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
        }}
      >
        <ModernCard
          padding="xl"
          style={{
            width: '100%',
            maxWidth: 300,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primary[100],
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.lg,
            }}
          >
            <Icon
              name={selectedTool?.icon}
              size={40}
              color={colors.primary[500]}
            />
          </View>
          
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.text.primary,
              textAlign: 'center',
              marginBottom: spacing.sm,
            }}
          >
            Processing...
          </Text>
          
          <Text
            style={{
              fontSize: 14,
              color: colors.text.secondary,
              textAlign: 'center',
              marginBottom: spacing.lg,
            }}
          >
            {selectedTool?.title} in progress
          </Text>
          
          <Progress.Bar
            progress={progress}
            width={200}
            height={8}
            color={colors.primary[500]}
            unfilledColor={colors.secondary[200]}
            borderWidth={0}
            borderRadius={4}
          />
          
          <Text
            style={{
              fontSize: 12,
              color: colors.text.tertiary,
              marginTop: spacing.sm,
            }}
          >
            {Math.round(progress * 100)}% complete
          </Text>
        </ModernCard>
      </View>
    </Modal>
  );

  const ToolDetailModal = () => (
    <Modal
      visible={showModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowModal(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: borderRadius.xl,
            borderTopRightRadius: borderRadius.xl,
            paddingTop: spacing.lg,
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + spacing.lg,
            maxHeight: '80%',
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: colors.secondary[300],
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: spacing.lg,
            }}
          />
          
          {selectedTool && (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
                <LinearGradient
                  colors={selectedTool.gradient}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.md,
                  }}
                >
                  <Icon
                    name={selectedTool.icon}
                    size={40}
                    color={colors.text.inverse}
                  />
                </LinearGradient>
                
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: colors.text.primary,
                    textAlign: 'center',
                    marginBottom: spacing.sm,
                  }}
                >
                  {selectedTool.title}
                </Text>
                
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.text.secondary,
                    textAlign: 'center',
                  }}
                >
                  {selectedTool.description}
                </Text>
              </View>
              
              {/* Features */}
              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: colors.text.primary,
                    marginBottom: spacing.md,
                  }}
                >
                  Features
                </Text>
                
                {selectedTool.features.map((feature, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: spacing.sm,
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: colors.primary[100],
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: spacing.md,
                      }}
                    >
                      <Icon
                        name="check"
                        size={12}
                        color={colors.primary[500]}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 16,
                        color: colors.text.primary,
                        flex: 1,
                      }}
                    >
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
              
              {/* Actions */}
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <ModernButton
                  title="Cancel"
                  variant="outline"
                  style={{ flex: 1 }}
                  onPress={() => setShowModal(false)}
                />
                <ModernButton
                  title="Start Processing"
                  gradient={selectedTool.gradient}
                  style={{ flex: 1 }}
                  onPress={handleProcessStart}
                />
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
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
                PDF Tools
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                Professional PDF processing
              </Text>
            </View>
            
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => navigation.navigate('Settings')}
            >
              <Icon name="cog" size={20} color={colors.text.inverse} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Tools Grid */}
      <Animated.View style={[toolsAnimatedStyle, { flex: 1 }]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: spacing.xl,
          }}
          showsVerticalScrollIndicator={false}
        >
          {tools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
          
          {/* Pro Features Teaser */}
          <ModernCard
            gradient={colors.gradients.purple}
            padding="lg"
            style={{ marginTop: spacing.lg }}
            onPress={() => navigation.navigate('ProFeatures')}
          >
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.md,
                }}
              >
                <Icon name="crown" size={30} color={colors.text.inverse} />
              </View>
              
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.text.inverse,
                  textAlign: 'center',
                  marginBottom: spacing.sm,
                }}
              >
                Unlock Pro Features
              </Text>
              
              <Text
                style={{
                  fontSize: 14,
                  color: 'rgba(255, 255, 255, 0.8)',
                  textAlign: 'center',
                  marginBottom: spacing.md,
                }}
              >
                Advanced tools, batch processing, and unlimited usage
              </Text>
              
              <ModernButton
                title="Upgrade Now"
                variant="secondary"
                size="sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
                textStyle={{ color: colors.text.inverse }}
              />
            </View>
          </ModernCard>
        </ScrollView>
      </Animated.View>

      <ToolDetailModal />
      <ProcessingModal />
    </View>
  );
};

export default ModernToolsScreen;