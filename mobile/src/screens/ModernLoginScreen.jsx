import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Dimensions,
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

import ModernButton from '../components/ui/ModernButton';
import GradientBackground from '../components/ui/GradientBackground';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ModernLoginScreen = ({ navigation }) => {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Animation values
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const floatingAnimation = useSharedValue(0);

  useEffect(() => {
    // Logo entrance animation
    logoScale.value = withDelay(500, withSpring(1, { damping: 15 }));
    
    // Logo floating animation
    logoRotation.value = withRepeat(
      withTiming(360, { duration: 20000 }),
      -1,
      false
    );
    
    floatingAnimation.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
    
    // Form entrance animation
    formOpacity.value = withDelay(800, withSpring(1));
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
      {
        translateY: interpolate(floatingAnimation.value, [0, 1], [-5, 5]),
      },
    ],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [
      {
        translateY: interpolate(formOpacity.value, [0, 1], [30, 0]),
      },
    ],
  }));

  const handleLogin = async () => {
    if (!email || !password) {
      setErrors({
        email: !email ? 'Email is required' : '',
        password: !password ? 'Password is required' : '',
      });
      HapticFeedback.trigger('notificationError');
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      HapticFeedback.trigger('impactLight');
      await signIn(email, password);
      HapticFeedback.trigger('notificationSuccess');
    } catch (error) {
      setErrors({ general: error.message });
      HapticFeedback.trigger('notificationError');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    secureTextEntry, 
    keyboardType,
    error,
    icon,
    rightIcon,
    onRightIconPress 
  }) => (
    <View style={{ marginBottom: spacing.lg }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors.text.primary,
          marginBottom: spacing.sm,
        }}
      >
        {label}
      </Text>
      
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.background,
          borderRadius: borderRadius.lg,
          paddingHorizontal: spacing.md,
          borderWidth: 2,
          borderColor: error ? colors.error : colors.secondary[200],
          ...shadows.sm,
        }}
      >
        {icon && (
          <Icon
            name={icon}
            size={20}
            color={colors.text.secondary}
            style={{ marginRight: spacing.sm }}
          />
        )}
        
        <TextInput
          style={{
            flex: 1,
            fontSize: 16,
            color: colors.text.primary,
            paddingVertical: spacing.md,
          }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Icon
              name={rightIcon}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text
          style={{
            fontSize: 12,
            color: colors.error,
            marginTop: spacing.xs,
            marginLeft: spacing.sm,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );

  return (
    <GradientBackground variant="primary" animated>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + spacing.xl,
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View
            style={{
              alignItems: 'center',
              marginBottom: spacing.xxxl,
            }}
          >
            <Animated.View style={logoAnimatedStyle}>
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.lg,
                  ...shadows.xl,
                }}
              >
                <Icon
                  name="file-pdf-box"
                  size={60}
                  color={colors.text.inverse}
                />
              </View>
            </Animated.View>
            
            <Text
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: colors.text.inverse,
                marginBottom: spacing.sm,
                textAlign: 'center',
              }}
            >
              Welcome Back
            </Text>
            
            <Text
              style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center',
                lineHeight: 24,
              }}
            >
              Sign in to access your professional PDF tools
            </Text>
          </View>

          {/* Login Form */}
          <Animated.View style={formAnimatedStyle}>
            <View
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: borderRadius.xl,
                padding: spacing.xl,
                ...shadows.xl,
              }}
            >
              {errors.general && (
                <View
                  style={{
                    backgroundColor: colors.error + '20',
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                    marginBottom: spacing.lg,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Icon
                    name="alert-circle"
                    size={20}
                    color={colors.error}
                    style={{ marginRight: spacing.sm }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.error,
                      flex: 1,
                    }}
                  >
                    {errors.general}
                  </Text>
                </View>
              )}

              <InputField
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                icon="email-outline"
                error={errors.email}
              />

              <InputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                icon="lock-outline"
                rightIcon={showPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                error={errors.password}
              />

              <TouchableOpacity
                style={{
                  alignSelf: 'flex-end',
                  marginBottom: spacing.xl,
                }}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.primary[600],
                    fontWeight: '600',
                  }}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <ModernButton
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                gradient={colors.gradients.primary}
                size="lg"
                fullWidth
                style={{ marginBottom: spacing.lg }}
              />

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: spacing.lg,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: colors.secondary[300],
                  }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text.secondary,
                    marginHorizontal: spacing.md,
                  }}
                >
                  or continue with
                </Text>
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: colors.secondary[300],
                  }}
                />
              </View>

              {/* Social Login Buttons */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: spacing.lg,
                }}
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.secondary[100],
                    borderRadius: borderRadius.lg,
                    paddingVertical: spacing.md,
                    marginRight: spacing.sm,
                  }}
                >
                  <Icon name="google" size={20} color="#DB4437" />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.text.primary,
                      marginLeft: spacing.sm,
                    }}
                  >
                    Google
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.secondary[100],
                    borderRadius: borderRadius.lg,
                    paddingVertical: spacing.md,
                    marginLeft: spacing.sm,
                  }}
                >
                  <Icon name="apple" size={20} color="#000" />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.text.primary,
                      marginLeft: spacing.sm,
                    }}
                  >
                    Apple
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Sign Up Link */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text.secondary,
                  }}
                >
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Register')}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.primary[600],
                      fontWeight: '600',
                    }}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

export default ModernLoginScreen;