import React from 'react';
import { View, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const GradientBackground = ({
  children,
  variant = 'primary',
  animated = false,
  overlay = false,
  style,
}) => {
  const animationValue = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      animationValue.value = withRepeat(
        withTiming(1, { duration: 8000 }),
        -1,
        true
      );
    }
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!animated) return {};

    const translateX = interpolate(
      animationValue.value,
      [0, 1],
      [-screenWidth * 0.1, screenWidth * 0.1]
    );

    const translateY = interpolate(
      animationValue.value,
      [0, 1],
      [-screenHeight * 0.05, screenHeight * 0.05]
    );

    return {
      transform: [
        { translateX },
        { translateY },
        { scale: interpolate(animationValue.value, [0, 1], [1, 1.1]) },
      ],
    };
  });

  const getGradientColors = () => {
    const gradients = {
      primary: colors.gradients.primary,
      secondary: colors.gradients.secondary,
      success: colors.gradients.success,
      warning: colors.gradients.warning,
      danger: colors.gradients.danger,
      purple: colors.gradients.purple,
      blue: colors.gradients.blue,
      green: colors.gradients.green,
    };

    return gradients[variant] || gradients.primary;
  };

  return (
    <View style={[{ flex: 1 }, style]}>
      <AnimatedLinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          {
            position: 'absolute',
            top: -screenHeight * 0.1,
            left: -screenWidth * 0.1,
            width: screenWidth * 1.2,
            height: screenHeight * 1.2,
          },
          animatedStyle,
        ]}
      />
      
      {overlay && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          }}
        />
      )}
      
      <View style={{ flex: 1, zIndex: 1 }}>
        {children}
      </View>
    </View>
  );
};

export default GradientBackground;