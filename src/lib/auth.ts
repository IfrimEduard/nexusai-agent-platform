import { supabase } from './supabase';

export async function getUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? '';
}

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export function onAuthStateChange(callback: (userId: string | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    (async () => {
      callback(session?.user?.id ?? null);
    })();
  });
}