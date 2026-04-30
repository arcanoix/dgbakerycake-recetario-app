"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Lock, ArrowRight } from "lucide-react";

interface PremiumAIGateProps {
  children: React.ReactNode;
  hasAccess: boolean;
}

export const PremiumAIGate = ({ children, hasAccess }: PremiumAIGateProps) => {
  const router = useRouter();

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-fuchsia-50">
      <CardContent className="py-8 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-purple-900 mb-1 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Funcionalidad Premium
          </h3>
          <p className="text-purple-700 text-sm max-w-sm">
            El Asistente de IA está disponible para los planes{" "}
            <strong>Profesional</strong> y <strong>Empresarial</strong>.
            Actualiza tu plan para acceder a esta funcionalidad.
          </p>
        </div>
        <Button
          onClick={() => router.push("/pricing")}
          className="gap-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 border-0 text-white"
        >
          Ver planes disponibles
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
