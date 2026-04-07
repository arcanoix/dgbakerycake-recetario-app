"use client";

// IMPORTANTE: Este archivo DEBE ser un Client Component para poder usar
// dynamic() con ssr:false en Next.js 16 + Turbopack.
// El "use client" aquí NO causa prerendering de los hooks internos porque
// next/dynamic con ssr:false omite la ejecución del módulo importado en el servidor.

import dynamic from "next/dynamic";

const BillingClientPage = dynamic(() => import("./BillingClientPage"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-violet-500 animate-spin" />
    </div>
  ),
});

export default function BillingPage() {
  return <BillingClientPage />;
}
