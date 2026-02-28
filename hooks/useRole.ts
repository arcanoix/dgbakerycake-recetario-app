"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/subscription";
import { supabase } from "@/lib/supabase";

export const useRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (user) {
      cargarRole();
    } else {
      setRole(null);
      setIsAdmin(false);
      setCargando(false);
    }
  }, [user]);

  const cargarRole = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error al cargar rol:', error);
        setRole('cliente'); // Por defecto
        setIsAdmin(false);
      } else {
        const userRole = data.role as UserRole;
        setRole(userRole);
        setIsAdmin(userRole === 'admin');
      }
    } catch (err) {
      console.error(err);
      setRole('cliente');
      setIsAdmin(false);
    } finally {
      setCargando(false);
    }
  };

  return {
    role,
    isAdmin,
    cargando,
    recargar: cargarRole,
  };
};
