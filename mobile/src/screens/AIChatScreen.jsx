import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Layout,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HapticFeedback from 'react-native-haptic-feedback';

import ModernCard from '../components/ui/ModernCard';
import ModernButton from '../components/ui/ModernButton';
import { colors, spacing, borderRadius } from '../theme/colors';
import { pdfService } from '../services/pdfService';
import { api } from '../lib/api';

const { width: screenWidth } = Dimensions.get('window');

const AIChatScreen = ({ navigation, route }) => {
  const { file } = route.params || {};
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isSetup, setIsSetup] = useState(false);
  const [setupProgress, setSetupProgress] = useState(0);

  // Animation values
  const headerScale = useSharedValue(0.8);
  const inputScale = useSharedValue(1);

  useEffect(() => {
    headerScale.value = withSpring(1);
    initializeChat();
  }, []);

  const initializeChat = async () => {
    if (!file) {
      Alert.alert('Error', 'No file selected for chat');
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);
      
      // Check if file already has embeddings
      if (!file.has_embeddings) {
        // Setup PDF for chat
        await pdfService.setupPDFChat(file.id, (progress) => {
          setSetupProgress(progress.progress || 0);
        });
      }
      
      setIsSetup(true);
      
      // Load existing chat sessions
      const sessions = await api.getChatSessions(file.id);
      if (sessions.length > 0) {
        const latestSession = sessions[0];
        setSessionId(latestSession.id);
        
        // Load messages from latest session
        const chatMessages = await api.getChatMessages(latestSession.id);
        setMessages(chatMessages.map(msg => ({
          id: msg.id,
          text: msg.message,
          isUser: msg.role === 'user',
          timestamp: new Date(msg.created_at),
        })));
      } else {
        // Start with welcome message
        setMessages([{
          id: 'welcome',
          text: `Hi! I'm ready to help you with "${file.filename}". You can ask me questions about the content, request summaries, or get insights from the document.`,
          isUser: false,
          timestamp: new Date(),
        }]);
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize chat: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    
    HapticFeedback.trigger('impactLight');

    try {
      const response = await pdfService.chatWithPDF(file.id, userMessage.text, sessionId);
      
      if (!sessionId) {
        setSessionId(response.sessionId);
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        sources: response.sources || [],
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      HapticFeedback.trigger('notificationSuccess');
      
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
        isError: true,
      };
      
      setMessages(prev => [...prev, errorMessage]);
      HapticFeedback.trigger('notificationError');
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = () => {
    inputScale.value = withSpring(1.02);
  };

  const handleInputBlur = () => {
    inputScale.value = withSpring(1);
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  const MessageBubble = ({ message, index }) => {
    const animValue = useSharedValue(0);

    useEffect(() => {
      animValue.value = withSpring(1, { damping: 15 });
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
      <Animated.View
        style={[
          animStyle,
          {
            alignSelf: message.isUser ? 'flex-end' : 'flex-start',
            maxWidth: screenWidth * 0.8,
            marginBottom: spacing.md,
          },
        ]}
        entering={message.isUser ? FadeInUp.delay(index * 50) : FadeInDown.delay(index * 50)}
        layout={Layout.springify()}
      >
        {message.isUser ? (
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              borderRadius: borderRadius.lg,
              borderBottomRightRadius: 4,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: colors.text.inverse,
                lineHeight: 22,
              }}
            >
              {message.text}
            </Text>
          </LinearGradient>
        ) : (
          <View
            style={{
              backgroundColor: message.isError ? colors.error + '20' : colors.secondary[100],
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              borderRadius: borderRadius.lg,
              borderBottomLeftRadius: 4,
              borderWidth: message.isError ? 1 : 0,
              borderColor: message.isError ? colors.error + '40' : 'transparent',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: message.isError ? colors.error + '20' : colors.primary[100],
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.sm,
                  marginTop: 2,
                }}
              >
                <Icon
                  name={message.isError ? 'alert-circle' : 'robot'}
                  size={16}
                  color={message.isError ? colors.error : colors.primary[500]}
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.text.primary,
                    lineHeight: 22,
                  }}
                >
                  {message.text}
                </Text>
                
                {message.sources && message.sources.length > 0 && (
                  <View style={{ marginTop: spacing.sm }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.text.secondary,
                        fontWeight: '600',
                        marginBottom: spacing.xs,
                      }}
                    >
                      Sources:
                    </Text>
                    {message.sources.map((source, sourceIndex) => (
                      <Text
                        key={sourceIndex}
                        style={{
                          fontSize: 12,
                          color: colors.text.tertiary,
                          marginBottom: 2,
                        }}
                      >
                        • Page {source.page}: {source.text.substring(0, 100)}...
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
        
        <Text
          style={{
            fontSize: 10,
            color: colors.text.tertiary,
            marginTop: spacing.xs,
            alignSelf: message.isUser ? 'flex-end' : 'flex-start',
          }}
        >
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </Animated.View>
    );
  };

  const QuickActions = () => {
    const quickQuestions = [
      'Summarize this document',
      'What are the key points?',
      'Extract important dates',
      'Find contact information',
      'What is this document about?',
    ];

    return (
      <View style={{ marginBottom: spacing.md }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.text.secondary,
            marginBottom: spacing.sm,
            marginLeft: spacing.md,
          }}
        >
          Quick Questions:
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.md }}
        >
          {quickQuestions.map((question, index) => (
            <TouchableOpacity
              key={index}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                backgroundColor: colors.primary[100],
                borderRadius: borderRadius.lg,
                marginRight: spacing.sm,
              }}
              onPress={() => {
                setInputText(question);
                HapticFeedback.trigger('impactLight');
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: colors.primary[700],
                  fontWeight: '500',
                }}
              >
                {question}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (!isSetup && loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <LinearGradient
          colors={colors.gradients.purple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + spacing.md,
            paddingBottom: spacing.lg,
            paddingHorizontal: spacing.lg,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
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
            
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.text.inverse,
              }}
            >
              Setting up AI Chat
            </Text>
          </View>
        </LinearGradient>

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.xl,
          }}
        >
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: colors.primary[100],
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.xl,
            }}
          >
            <Icon name="robot" size={60} color={colors.primary[500]} />
          </View>
          
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: colors.text.primary,
              textAlign: 'center',
              marginBottom: spacing.md,
            }}
          >
            Preparing Your Document
          </Text>
          
          <Text
            style={{
              fontSize: 16,
              color: colors.text.secondary,
              textAlign: 'center',
              marginBottom: spacing.xl,
            }}
          >
            I'm analyzing "{file?.filename}" to enable intelligent conversations
          </Text>
          
          <View
            style={{
              width: '100%',
              height: 8,
              backgroundColor: colors.secondary[200],
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={{
                height: '100%',
                backgroundColor: colors.primary[500],
                width: `${setupProgress * 100}%`,
              }}
            />
          </View>
          
          <Text
            style={{
              fontSize: 14,
              color: colors.text.tertiary,
              marginTop: spacing.md,
            }}
          >
            {Math.round(setupProgress * 100)}% complete
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <LinearGradient
        colors={colors.gradients.purple}
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
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.text.inverse,
                  marginBottom: 2,
                }}
              >
                AI Chat
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
                numberOfLines={1}
              >
                {file?.filename}
              </Text>
            </View>
            
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="robot" size={20} color={colors.text.inverse} />
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: spacing.md,
          }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} index={index} />
          ))}
          
          {loading && (
            <View
              style={{
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.secondary[100],
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.lg,
                borderBottomLeftRadius: 4,
                marginBottom: spacing.md,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.primary[100],
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.sm,
                }}
              >
                <Icon name="robot" size={16} color={colors.primary[500]} />
              </View>
              
              <View style={{ flexDirection: 'row' }}>
                {[0, 1, 2].map((dot) => (
                  <Animated.View
                    key={dot}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: colors.primary[300],
                      marginHorizontal: 2,
                    }}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Actions */}
        {messages.length <= 1 && <QuickActions />}

        {/* Input */}
        <Animated.View
          style={[
            inputAnimatedStyle,
            {
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              paddingBottom: insets.bottom + spacing.md,
              backgroundColor: colors.background,
              borderTopWidth: 1,
              borderTopColor: colors.secondary[200],
            },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              backgroundColor: colors.secondary[100],
              borderRadius: borderRadius.xl,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                color: colors.text.primary,
                maxHeight: 100,
                paddingVertical: spacing.sm,
              }}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything about this document..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: inputText.trim() ? colors.primary[500] : colors.secondary[300],
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: spacing.sm,
              }}
              onPress={sendMessage}
              disabled={!inputText.trim() || loading}
            >
              <Icon
                name="send"
                size={20}
                color={inputText.trim() ? colors.text.inverse : colors.text.secondary}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AIChatScreen;