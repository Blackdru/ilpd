import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, View } from 'react-native';
import { useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

// Screens
import ModernLoginScreen from './src/screens/ModernLoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ModernHomeScreen from './src/screens/ModernHomeScreen';
import ModernToolsScreen from './src/screens/ModernToolsScreen';
import ModernFilesScreen from './src/screens/ModernFilesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PDFProcessingScreen from './src/screens/PDFProcessingScreen';
import AIChatScreen from './src/screens/AIChatScreen';

// Context
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { colors, spacing, borderRadius } from './src/theme/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={ModernLoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="PDFProcessing" component={PDFProcessingScreen} />
    <Stack.Screen name="AIChat" component={AIChatScreen} />
  </Stack.Navigator>
);

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: spacing.lg,
        left: spacing.lg,
        right: spacing.lg,
        height: 70,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const animatedScale = useSharedValue(isFocused ? 1.1 : 1);
          const animatedOpacity = useSharedValue(isFocused ? 1 : 0.6);

          React.useEffect(() => {
            animatedScale.value = withSpring(isFocused ? 1.1 : 1);
            animatedOpacity.value = withSpring(isFocused ? 1 : 0.6);
          }, [isFocused]);

          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: animatedScale.value }],
            opacity: animatedOpacity.value,
          }));

          const getIconName = (routeName) => {
            switch (routeName) {
              case 'Home':
                return isFocused ? 'home' : 'home-outline';
              case 'Tools':
                return isFocused ? 'tools' : 'tools';
              case 'Files':
                return isFocused ? 'file-multiple' : 'file-multiple-outline';
              case 'Profile':
                return isFocused ? 'account' : 'account-outline';
              default:
                return 'circle';
            }
          };

          return (
            <Animated.View
              key={route.key}
              style={[
                {
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: spacing.sm,
                },
                animatedStyle,
              ]}
            >
              <Animated.View
                style={[
                  {
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  isFocused && {
                    backgroundColor: colors.primary[500],
                    shadowColor: colors.primary[500],
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    {
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                    animatedStyle,
                  ]}
                >
                  <Icon
                    name={getIconName(route.name)}
                    size={24}
                    color={isFocused ? colors.text.inverse : colors.text.secondary}
                    onPress={onPress}
                  />
                </Animated.View>
              </Animated.View>
            </Animated.View>
          );
        })}
      </LinearGradient>
    </View>
  );
};

const MainTabs = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
      tabBarStyle: { display: 'none' }, // Hide default tab bar
    }}
  >
    <Tab.Screen name="Home" component={ModernHomeScreen} />
    <Tab.Screen name="Tools" component={ModernToolsScreen} />
    <Tab.Screen name="Files" component={ModernFilesScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.lg,
          }}
        >
          <Icon name="file-pdf-box" size={50} color={colors.text.inverse} />
        </LinearGradient>
        <Animated.Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text.primary,
            marginBottom: spacing.sm,
          }}
        >
          PDFPet
        </Animated.Text>
        <Animated.Text
          style={{
            fontSize: 16,
            color: colors.text.secondary,
          }}
        >
          Professional PDF Tools
        </Animated.Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const App = () => {
  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AuthProvider>
        <AppNavigator />
        <Toast />
      </AuthProvider>
    </View>
  );
};

export default App;