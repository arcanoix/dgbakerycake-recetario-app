"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PaymentRequestForm } from "@/components/subscription/PaymentRequestForm";
import { SubscriptionPlan } from "@/types/subscription";
import { obtenerPlanPorId } from "@/lib/subscriptionStorage";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("plan");
  
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (planId) {
      cargarPlan();
    } else {
      router.push("/pricing");
    }
  }, [planId]);

  const cargarPlan = async () => {
    if (!planId) return;
    
    const planData = await obtenerPlanPorId(planId);
    if (planData) {
      setPlan(planData);
    } else {
      router.push("/pricing");
    }
    setCargando(false);
  };

  const handleSuccess = () => {
    router.push("/billing?success=true");
  };

  const handleCancel = () => {
    router.push("/pricing");
  };

  if (cargando) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <p className="text-center">Cargando...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-3xl">
        <PaymentRequestForm
          plan={plan}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </ProtectedRoute>
  );
}
