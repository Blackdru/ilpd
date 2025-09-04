import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your Supabase URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key) => {
        // Use AsyncStorage or SecureStore for production
        return Promise.resolve(null);
      },
      setItem: (key, value) => {
        // Use AsyncStorage or SecureStore for production
        return Promise.resolve();
      },
      removeItem: (key) => {
        // Use AsyncStorage or SecureStore for production
        return Promise.resolve();
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});