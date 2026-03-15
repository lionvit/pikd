import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// On web: purge any stale anonymous sessions synchronously before the client
// is created — otherwise Supabase holds an internal lock while trying to
// refresh the dead token, which blocks every subsequent query indefinitely.
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  try {
    const key = `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
    const raw = window.localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.user?.is_anonymous) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {}
}

// Web: use localStorage directly (SSR-safe); Native: use SecureStore
const storage = Platform.OS === 'web'
  ? {
      getItem: (key: string) =>
        Promise.resolve(typeof window !== 'undefined' ? window.localStorage.getItem(key) : null),
      setItem: (key: string, value: string) =>
        Promise.resolve(typeof window !== 'undefined' ? void window.localStorage.setItem(key, value) : undefined),
      removeItem: (key: string) =>
        Promise.resolve(typeof window !== 'undefined' ? void window.localStorage.removeItem(key) : undefined),
    }
  : {
      getItem: (key: string) => SecureStore.getItemAsync(key),
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    };

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
