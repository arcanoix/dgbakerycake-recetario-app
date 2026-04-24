"use client";

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabaseAuth, getCurrentUser } from '@/lib/supabase-auth';
import { useRouter } from 'next/navigation';
import { sincronizarPrecioBCVAlLogin } from '@/lib/bcvSync';
import { registrarActividad } from '@/lib/subscriptionStorage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // Prevent logging a login event on every token refresh
  const loginLogged = useRef(false);

  useEffect(() => {
    // Verificar sesión actual
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error al verificar usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);

          // Sincronizar precio BCV al iniciar sesión
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            sincronizarPrecioBCVAlLogin().catch(err => {
              console.error('Error en sincronización BCV:', err);
            });
          }

          // Log login event only once per session (not on token refresh)
          if (event === 'SIGNED_IN' && !loginLogged.current) {
            loginLogged.current = true;
            registrarActividad(
              'login',
              'auth',
              `Inicio de sesión: ${session.user.email}`
            ).catch(() => {});
          }
        } else {
          setUser(null);
          loginLogged.current = false;
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      // Log before signing out (user still has a session)
      await registrarActividad('logout', 'auth', 'Cierre de sesión').catch(() => {});
      await supabaseAuth.auth.signOut();
      setUser(null);
      loginLogged.current = false;
      router.push('/auth/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};
