"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Loading fullScreen icon={<div className="text-4xl">⏳</div>} />;
  }

  return <ProtectedContent>{children}</ProtectedContent>;
};

const ProtectedContent = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loading text="Verificando autenticación..." fullScreen icon={<div className="text-4xl">⏳</div>} />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};
