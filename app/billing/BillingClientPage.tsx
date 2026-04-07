"use client";

import { Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import BillingContent from "./BillingContent";

// Página completa de facturación — solo ejecutada en el cliente
export default function BillingClientPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-violet-500 animate-spin" />
        </div>
      }>
        <BillingContent />
      </Suspense>
    </ProtectedRoute>
  );
}
