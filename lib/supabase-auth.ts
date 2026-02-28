import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Tipos para autenticación
export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface SignUpData {
  email: string;
  password: string;
  nombre?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Funciones de autenticación
export const signUp = async ({ email, password, nombre }: SignUpData) => {
  const { data, error } = await supabaseAuth.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre: nombre || email.split('@')[0],
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
};

export const signIn = async ({ email, password }: SignInData) => {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user, session: data.session };
};

export const signOut = async () => {
  const { error } = await supabaseAuth.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabaseAuth.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabaseAuth.auth.getSession();

  if (error || !session) {
    return null;
  }

  return session;
};

export const resetPassword = async (email: string) => {
  const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabaseAuth.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};
