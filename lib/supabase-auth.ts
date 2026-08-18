import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Usamos createBrowserClient de @supabase/ssr que garantiza
// una única instancia (singleton) en el browser, eliminando el
// warning "Multiple GoTrueClient instances detected".
export const supabaseAuth = createBrowserClient(supabaseUrl, supabaseAnonKey);


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

export const signInWithGoogle = async () => {
  const { data, error } = await supabaseAuth.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
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

export interface ActualizarPerfilData {
  nombre?: string;
  email?: string;
}

export const actualizarPerfil = async (datos: ActualizarPerfilData) => {
  const updates: Parameters<typeof supabaseAuth.auth.updateUser>[0] = {};

  if (datos.nombre !== undefined) {
    updates.data = { nombre: datos.nombre };
  }

  if (datos.email !== undefined) {
    updates.email = datos.email;
  }

  const { data, error } = await supabaseAuth.auth.updateUser(updates);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
};
