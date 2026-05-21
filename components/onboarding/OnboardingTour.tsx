"use client";

import { useEffect, useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseAuth } from "@/lib/supabase-auth";

/**
 * Componente que gestiona el tour de bienvenida.
 * Se puede disparar automáticamente para nuevos usuarios o manualmente.
 */
export const OnboardingTour = () => {
  const { user } = useAuth();

  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayClickDismiss: false,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      progressText: '{{current}} de {{total}}',
      steps: [
        {
          element: 'nav a[href="/productos"]',
          popover: {
            title: 'Paso 1: Registra tus productos',
            description: 'Aquí puedes agregar todos los ingredientes y materiales que usas en tus preparaciones.',
            side: "right",
            align: 'start'
          }
        },
        {
          element: 'nav a[href="/recetas"]',
          popover: {
            title: 'Paso 2: Crea tus recetas',
            description: 'Combina tus productos registrados para calcular los costos exactos de cada preparación.',
            side: "right",
            align: 'start'
          }
        },
        {
          element: 'nav a[href="/gastos-fijos"]',
          popover: {
            title: 'Paso 3: Gastos Fijos',
            description: 'Verifica y ajusta los costos básicos como electricidad, internet o alquiler para prorratearlos en tus recetas.',
            side: "right",
            align: 'start'
          }
        },
        {
          element: 'nav a[href="/configuracion"]',
          popover: {
            title: 'Paso 4: Configuración General',
            description: 'Ajusta tu costo por hora de trabajo y el porcentaje de ganancia que deseas obtener.',
            side: "right",
            align: 'start'
          }
        },
        {
          element: '#main-content', // Un selector genérico para el medio
          popover: {
            title: '¡Todo listo!',
            description: 'Con estos 4 pasos ya tendrás el control total de tus costos. ¡Mucho éxito!',
            side: "bottom",
            align: 'center'
          }
        }
      ],
      onDestroyed: async () => {
        // Marcar como visto si el usuario está logueado
        if (user && !user.user_metadata?.visto_tour) {
          await supabaseAuth.auth.updateUser({
            data: { visto_tour: true }
          });
        }
      }
    });

    driverObj.drive();
  }, [user]);

  useEffect(() => {
    // Si el usuario acaba de entrar por primera vez (no tiene visto_tour en metadata)
    if (user && user.user_metadata && user.user_metadata.visto_tour === undefined) {
        // Pequeño delay para asegurar que el DOM esté listo y el sidebar cargado
        const timer = setTimeout(() => {
            startTour();
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [user, startTour]);

  // Exponemos el método startTour globalmente para poder llamarlo desde el botón
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).startAppTour = startTour;
    }
  }, [startTour]);

  return null; // El componente no renderiza nada visualmente por sí mismo
};
