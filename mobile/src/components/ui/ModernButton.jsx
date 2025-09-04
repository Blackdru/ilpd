import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import HapticFeedback from 'react-native-haptic-feedback';
import { colors, spacing, borderRadius, shadows } from '../../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const ModernButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  gradient,
  haptic = true,
  ...props
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
    opacity.value = withTiming(0.8, { duration: 100 });
    
    if (haptic && !disabled) {
      HapticFeedback.trigger('impactLight');
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      if (haptic) {
        HapticFeedback.trigger('impactMedium');
      }
      onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    const sizeStyles = {
      sm: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 36,
      },
      md: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        minHeight: 48,
      },
      lg: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        minHeight: 56,
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: colors.primary[500],
        ...shadows.md,
      },
      secondary: {
        backgroundColor: colors.secondary[100],
        borderWidth: 1,
        borderColor: colors.secondary[200],
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary[500],
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      danger: {
        backgroundColor: colors.error,
        ...shadows.md,
      },
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...(disabled && { opacity: 0.5 }),
      ...style,
    };
  };

  const getTextStyles = () => {
    const baseTextStyles = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeTextStyles = {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
    };

    const variantTextStyles = {
      primary: { color: colors.text.inverse },
      secondary: { color: colors.text.primary },
      outline: { color: colors.primary[500] },
      ghost: { color: colors.primary[500] },
      danger: { color: colors.text.inverse },
    };

    return {
      ...baseTextStyles,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  const renderContent = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? colors.text.inverse : colors.primary[500]}
        />
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon
              size={size === 'sm' ? 16 : size === 'md' ? 18 : 20}
              color={getTextStyles().color}
              style={{ marginRight: spacing.sm }}
            />
          )}
          <Text style={getTextStyles()}>{title}</Text>
          {Icon && iconPosition === 'right' && (
            <Icon
              size={size === 'sm' ? 16 : size === 'md' ? 18 : 20}
              color={getTextStyles().color}
              style={{ marginLeft: spacing.sm }}
            />
          )}
        </>
      )}
    </View>
  );

  if (gradient || variant === 'primary') {
    const gradientColors = gradient || colors.gradients.primary;
    
    return (
      <AnimatedTouchableOpacity
        style={[animatedStyle, { borderRadius: borderRadius.lg }]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={1}
        {...props}
      >
        <AnimatedLinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={getButtonStyles()}
        >
          {renderContent()}
        </AnimatedLinearGradient>
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <AnimatedTouchableOpacity
      style={[animatedStyle, getButtonStyles()]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={1}
      {...props}
    >
      {renderContent()}
    </AnimatedTouchableOpacity>
  );
};

export default ModernButton;