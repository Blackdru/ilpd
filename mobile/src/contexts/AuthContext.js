import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Get initial session
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          await clearStoredData();
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const getInitialSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error in getInitialSession:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      const profileData = await api.getProfile();
      setProfile(profileData.profile);
      
      // Store profile data locally
      await AsyncStorage.setItem('userProfile', JSON.stringify(profileData.profile));
    } catch (error) {
      console.error('Error loading profile:', error);
      // Try to load from local storage
      try {
        const storedProfile = await AsyncStorage.getItem('userProfile');
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
      } catch (storageError) {
        console.error('Error loading stored profile:', storageError);
      }
    }
  };

  const clearStoredData = async () => {
    try {
      await AsyncStorage.multiRemove([
        'userProfile',
        'userStats',
        'recentFiles',
        'appSettings'
      ]);
    } catch (error) {
      console.error('Error clearing stored data:', error);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        throw error;
      }

      // User state will be updated by the auth state change listener
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, name) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      // Clear local data
      await clearStoredData();
      
      // User state will be updated by the auth state change listener
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'pdfpet://reset-password',
      });

      if (error) {
        throw error;
      }

      return { message: 'Password reset email sent' };
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to send reset email');
    }
  };

  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      
      // Update auth metadata if name is being changed
      if (updates.name) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { name: updates.name }
        });
        
        if (authError) {
          throw authError;
        }
      }

      // Update profile via API
      const result = await api.updateProfile(updates);
      
      // Update local profile state
      setProfile(prev => ({ ...prev, ...updates }));
      
      // Store updated profile
      await AsyncStorage.setItem('userProfile', JSON.stringify({ ...profile, ...updates }));
      
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'pdfpet://auth/callback',
        },
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'pdfpet://auth/callback',
        },
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Apple sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with Apple');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setLoading(true);
      
      // Call API to delete account and all associated data
      await api.request('/users/delete-account', {
        method: 'DELETE',
      });

      // Sign out user
      await signOut();
      
    } catch (error) {
      console.error('Delete account error:', error);
      throw new Error(error.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
    signInWithGoogle,
    signInWithApple,
    deleteAccount,
    // Helper methods
    isAuthenticated: !!user,
    isPro: profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'enterprise',
    isAdmin: profile?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};