/**
 * Cliente Supabase para React Native
 * 
 * Usa AsyncStorage para persistir a sessão entre reinicializações do app.
 */

import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config';

const supabaseUrl = CONFIG.SUPABASE_URL;
const supabaseAnonKey = CONFIG.SUPABASE_ANON_KEY;

class SupabaseStorage {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('[Supabase] AsyncStorage getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('[Supabase] AsyncStorage setItem error:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('[Supabase] AsyncStorage removeItem error:', error);
    }
  }
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new SupabaseStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function signInWithEmail(email: string, password: string): Promise<{
  user: User | null;
  session: Session | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Supabase] Sign in error:', error.message);
      return { user: null, session: null, error };
    }

    console.log('[Supabase] Sign in success:', data.user?.email);
    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    console.error('[Supabase] Sign in exception:', error);
    return { user: null, session: null, error: error as Error };
  }
}

export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[Supabase] Sign out error:', error.message);
      return { error };
    }
    console.log('[Supabase] Sign out success');
    return { error: null };
  } catch (error) {
    console.error('[Supabase] Sign out exception:', error);
    return { error: error as Error };
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('[Supabase] Get session error:', error);
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('[Supabase] Get user error:', error);
    return null;
  }
}

export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('[Supabase] Auth state change:', event);
    callback(event, session);
  });
}
