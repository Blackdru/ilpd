import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Toast from 'react-native-toast-message';

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
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, name) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Please check your email to verify your account.',
      });
      
      return { data, error: null };
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.message,
      });
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
      });
      
      return { data, error: null };
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message,
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Signed out successfully',
      });
      
      return { error: null };
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Sign out failed',
        text2: error.message,
      });
      return { error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Password reset email sent!',
      });
      
      return { error: null };
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Password reset failed',
        text2: error.message,
      });
      return { error };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully',
      });
      
      return { error: null };
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Profile update failed',
        text2: error.message,
      });
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};