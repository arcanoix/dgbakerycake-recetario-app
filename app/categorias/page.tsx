"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIAS_PRODUCTOS, CATEGORIAS_RECETAS } from "@/lib/constants";

export default function CategoriasPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/productos");
  }, [router]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center py-12">
        <div className="animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-violet-500"></div>
        <p className="mt-4 text-gray-700">Redirigiendo...</p>
      </div>
    </div>
  );
}
