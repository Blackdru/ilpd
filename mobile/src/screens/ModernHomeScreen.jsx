import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HapticFeedback from 'react-native-haptic-feedback';

import ModernCard from '../components/ui/ModernCard';
import ModernButton from '../components/ui/ModernButton';
import GradientBackground from '../components/ui/GradientBackground';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ModernHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalFiles: 24,
    processedToday: 8,
    storageUsed: '2.4 GB',
    aiOperations: 156,
  });

  // Animation values
  const headerOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.8);
  const floatingAnimation = useSharedValue(0);

  useEffect(() => {
    // Entrance animations
    headerOpacity.value = withDelay(300, withSpring(1));
    cardScale.value = withDelay(500, withSpring(1));
    
    // Floating animation
    floatingAnimation.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: interpolate(headerOpacity.value, [0, 1], [-20, 0]),
      },
    ],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(floatingAnimation.value, [0, 1], [-5, 5]),
      },
    ],
  }));

  const quickActions = [
    {
      title: 'Upload Files',
      subtitle: 'Add new PDFs',
      icon: 'upload',
      gradient: colors.gradients.blue,
      onPress: () => navigation.navigate('Upload'),
    },
    {
      title: 'Merge PDFs',
      subtitle: 'Combine documents',
      icon: 'merge',
      gradient: colors.gradients.green,
      onPress: () => navigation.navigate('Tools', { tool: 'merge' }),
    },
    {
      title: 'AI Assistant',
      subtitle: 'Smart processing',
      icon: 'robot',
      gradient: colors.gradients.purple,
      onPress: () => navigation.navigate('AI'),
    },
    {
      title: 'Compress',
      subtitle: 'Reduce file size',
      icon: 'archive',
      gradient: colors.gradients.warning,
      onPress: () => navigation.navigate('Tools', { tool: 'compress' }),
    },
  ];

  const recentFiles = [
    { name: 'Document.pdf', size: '2.4 MB', date: '2 hours ago', type: 'pdf' },
    { name: 'Report.pdf', size: '1.8 MB', date: '5 hours ago', type: 'pdf' },
    { name: 'Invoice.pdf', size: '0.9 MB', date: '1 day ago', type: 'pdf' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    HapticFeedback.trigger('impactLight');
    
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      HapticFeedback.trigger('notificationSuccess');
    }, 1500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const StatCard = ({ title, value, icon, gradient, delay = 0 }) => {
    const animValue = useSharedValue(0);

    useEffect(() => {
      animValue.value = withDelay(delay, withSpring(1));
    }, []);

    const animStyle = useAnimatedStyle(() => ({
      opacity: animValue.value,
      transform: [
        {
          translateY: interpolate(animValue.value, [0, 1], [20, 0]),
        },
        {
          scale: interpolate(animValue.value, [0, 1], [0.9, 1]),
        },
      ],
    }));

    return (
      <Animated.View style={[animStyle, { flex: 1, marginHorizontal: spacing.xs }]}>
        <ModernCard
          gradient={gradient}
          padding="md"
          style={{ minHeight: 100 }}
        >
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.sm,
              }}
            >
              <Icon name={icon} size={20} color={colors.text.inverse} />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.text.inverse,
                marginBottom: 2,
              }}
            >
              {value}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center',
              }}
            >
              {title}
            </Text>
          </View>
        </ModernCard>
      </Animated.View>
    );
  };

  const QuickActionCard = ({ action, index }) => {
    const animValue = useSharedValue(0);

    useEffect(() => {
      animValue.value = withDelay(700 + index * 100, withSpring(1));
    }, []);

    const animStyle = useAnimatedStyle(() => ({
      opacity: animValue.value,
      transform: [
        {
          translateX: interpolate(animValue.value, [0, 1], [-50, 0]),
        },
        {
          scale: interpolate(animValue.value, [0, 1], [0.8, 1]),
        },
      ],
    }));

    return (
      <Animated.View style={[animStyle, { width: (screenWidth - spacing.xl * 3) / 2 }]}>
        <ModernCard
          onPress={action.onPress}
          gradient={action.gradient}
          padding="lg"
          style={{ marginBottom: spacing.md, minHeight: 120 }}
        >
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.md,
              }}
            >
              <Icon name={action.icon} size={24} color={colors.text.inverse} />
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: colors.text.inverse,
                textAlign: 'center',
                marginBottom: 4,
              }}
            >
              {action.title}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center',
              }}
            >
              {action.subtitle}
            </Text>
          </View>
        </ModernCard>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.xl,
          paddingHorizontal: spacing.lg,
        }}
      >
        <Animated.View style={headerAnimatedStyle}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.lg,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 16,
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginBottom: 4,
                }}
              >
                {getGreeting()}
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: colors.text.inverse,
                }}
              >
                {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
              </Text>
            </View>
            
            <Animated.View style={floatingStyle}>
              <TouchableOpacity
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => navigation.navigate('Profile')}
              >
                <Icon name="account" size={24} color={colors.text.inverse} />
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Stats Row */}
          <View style={{ flexDirection: 'row', marginHorizontal: -spacing.xs }}>
            <StatCard
              title="Total Files"
              value={stats.totalFiles}
              icon="file-multiple"
              gradient={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              delay={200}
            />
            <StatCard
              title="Processed Today"
              value={stats.processedToday}
              icon="check-circle"
              gradient={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              delay={300}
            />
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
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
        {/* Quick Actions */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: colors.text.primary,
              marginBottom: spacing.md,
            }}
          >
            Quick Actions
          </Text>
          
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            {quickActions.map((action, index) => (
              <QuickActionCard key={action.title} action={action} index={index} />
            ))}
          </View>
        </View>

        {/* Recent Files */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.text.primary,
              }}
            >
              Recent Files
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Files')}>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.primary[500],
                  fontWeight: '600',
                }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {recentFiles.map((file, index) => (
            <Animated.View
              key={file.name}
              style={[
                cardAnimatedStyle,
                { transform: [{ scale: cardScale.value }] },
              ]}
            >
              <ModernCard
                onPress={() => navigation.navigate('FileDetails', { file })}
                style={{ marginBottom: spacing.md }}
                padding="md"
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.primary[100],
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: spacing.md,
                    }}
                  >
                    <Icon
                      name="file-pdf-box"
                      size={20}
                      color={colors.primary[500]}
                    />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: colors.text.primary,
                        marginBottom: 2,
                      }}
                    >
                      {file.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.text.secondary,
                      }}
                    >
                      {file.size} • {file.date}
                    </Text>
                  </View>
                  
                  <Icon
                    name="chevron-right"
                    size={20}
                    color={colors.text.tertiary}
                  />
                </View>
              </ModernCard>
            </Animated.View>
          ))}
        </View>

        {/* AI Features Teaser */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <ModernCard
            gradient={colors.gradients.purple}
            padding="lg"
            onPress={() => navigation.navigate('AI')}
          >
            <View style={{ alignItems: 'center' }}>
              <Animated.View style={floatingStyle}>
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
                  <Icon name="robot" size={30} color={colors.text.inverse} />
                </View>
              </Animated.View>
              
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.text.inverse,
                  textAlign: 'center',
                  marginBottom: spacing.sm,
                }}
              >
                AI-Powered PDF Tools
              </Text>
              
              <Text
                style={{
                  fontSize: 14,
                  color: 'rgba(255, 255, 255, 0.8)',
                  textAlign: 'center',
                  marginBottom: spacing.md,
                }}
              >
                Extract text, generate summaries, and chat with your PDFs using advanced AI
              </Text>
              
              <ModernButton
                title="Try AI Features"
                variant="secondary"
                size="sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
                textStyle={{ color: colors.text.inverse }}
                onPress={() => navigation.navigate('AI')}
              />
            </View>
          </ModernCard>
        </View>
      </ScrollView>
    </View>
  );
};

export default ModernHomeScreen;