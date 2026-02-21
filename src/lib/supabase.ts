/**
 * Supabase Client - STUB VERSION
 * 
 * Este arquivo é um stub que será substituído quando as dependências
 * nativas (AsyncStorage) estiverem instaladas via CocoaPods.
 * 
 * Por enquanto, o login é feito via WebView.
 */

// Stub - não faz nada, login é simulado no LoginScreen
export async function signInWithEmail(email: string, password: string) {
  console.warn('[Supabase] Stub version - real auth not available');
  return {
    user: null,
    session: null,
    error: { message: 'Supabase not configured - using simulated login' }
  };
}

export async function signOut() {
  console.warn('[Supabase] Stub version - signOut called');
  return { error: null };
}

export async function getCurrentSession() {
  return null;
}

export async function getCurrentUser() {
  return null;
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return { data: { subscription: { unsubscribe: () => {} } } };
}
