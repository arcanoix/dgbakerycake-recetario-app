"use client";

import { useSubscription } from "@/hooks/useSubscription";
import { PLAN_FEATURES, PlanFeature, PlanFeatures, SubscriptionPlanName } from "@/types/subscription";
import { useRole } from "./useRole";

export const usePlanAccess = () => {
  const { infoSuscripcion, cargando } = useSubscription();
  const { isAdmin } = useRole();

  const getPlanFeatures = (): PlanFeatures => {
    if (isAdmin) {
      return {
        ...PLAN_FEATURES['empresarial'],
        menu_admin: true,
      };
    }

    if (!infoSuscripcion) {
      return PLAN_FEATURES['free'];
    }

    return PLAN_FEATURES[infoSuscripcion.plan_name] || PLAN_FEATURES['free'];
  };

  const canAccess = (feature: PlanFeature): boolean => {
    const features = getPlanFeatures();
    return features[feature] as boolean;
  };

  const getMaxProductos = (): number => {
    const features = getPlanFeatures();
    return features.max_productos;
  };

  const getMaxRecetas = (): number => {
    const features = getPlanFeatures();
    return features.max_recetas;
  };

  const getCurrentCount = (type: 'productos' | 'recetas', currentCount: number): {
    canCreate: boolean;
    remaining: number;
    reached: boolean;
    limit: number;
  } => {
    const features = getPlanFeatures();
    const limit = type === 'productos' ? features.max_productos : features.max_recetas;
    
    if (limit === -1) {
      return {
        canCreate: true,
        remaining: -1,
        reached: false,
        limit,
      };
    }

    const remaining = limit - currentCount;
    return {
      canCreate: remaining > 0,
      remaining,
      reached: remaining <= 0,
      limit,
    };
  };

  const getPlanName = (): SubscriptionPlanName => {
    if (isAdmin) {
      return 'empresarial';
    }
    return infoSuscripcion?.plan_name || 'free';
  };

  const getPlanDisplayName = (): string => {
    if (isAdmin) {
      return 'Admin';
    }
    return infoSuscripcion?.plan_display_name || 'Plan Gratuito';
  };

  return {
    features: getPlanFeatures(),
    canAccess,
    getMaxProductos,
    getMaxRecetas,
    getCurrentCount,
    getPlanName,
    getPlanDisplayName,
    isAdmin,
    isFree: getPlanName() === 'free',
    isBasico: getPlanName() === 'basico',
    isProfesional: getPlanName() === 'profesional',
    isEmpresarial: getPlanName() === 'empresarial',
    cargando,
  };
};
