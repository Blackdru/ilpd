import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import HapticFeedback from 'react-native-haptic-feedback';
import { colors, spacing, borderRadius, shadows } from '../../theme/colors';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const ModernCard = ({
  children,
  onPress,
  style,
  variant = 'default',
  elevation = 'md',
  gradient,
  blur = false,
  haptic = true,
  animated = true,
  padding = 'md',
  ...props
}) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const handlePressIn = () => {
    if (animated && onPress) {
      scale.value = withSpring(0.98, { damping: 15 });
      translateY.value = withTiming(2, { duration: 100 });
      
      if (haptic) {
        HapticFeedback.trigger('impactLight');
      }
    }
  };

  const handlePressOut = () => {
    if (animated && onPress) {
      scale.value = withSpring(1, { damping: 15 });
      translateY.value = withTiming(0, { duration: 100 });
    }
  };

  const handlePress = () => {
    if (onPress) {
      if (haptic) {
        HapticFeedback.trigger('impactMedium');
      }
      onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: borderRadius.lg,
      backgroundColor: colors.card,
      overflow: 'hidden',
    };

    const paddingStyles = {
      none: {},
      sm: { padding: spacing.sm },
      md: { padding: spacing.md },
      lg: { padding: spacing.lg },
      xl: { padding: spacing.xl },
    };

    const variantStyles = {
      default: {
        backgroundColor: colors.card,
        ...shadows[elevation],
      },
      glass: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        ...shadows[elevation],
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.secondary[200],
      },
      elevated: {
        backgroundColor: colors.card,
        ...shadows.xl,
      },
    };

    return {
      ...baseStyles,
      ...paddingStyles[padding],
      ...variantStyles[variant],
      ...style,
    };
  };

  const CardContent = () => (
    <View style={getCardStyles()}>
      {children}
    </View>
  );

  const GradientCard = () => (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[getCardStyles(), { backgroundColor: 'transparent' }]}
    >
      {children}
    </LinearGradient>
  );

  const BlurCard = () => (
    <View style={[getCardStyles(), { backgroundColor: 'transparent' }]}>
      <BlurView
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        blurType="light"
        blurAmount={10}
      />
      <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
        {children}
      </View>
    </View>
  );

  const renderCard = () => {
    if (gradient) return <GradientCard />;
    if (blur) return <BlurCard />;
    return <CardContent />;
  };

  if (onPress) {
    return (
      <AnimatedTouchableOpacity
        style={animatedStyle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={1}
        {...props}
      >
        {renderCard()}
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <Animated.View style={[animatedStyle, { transform: [] }]} {...props}>
      {renderCard()}
    </Animated.View>
  );
};

export default ModernCard;