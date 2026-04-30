"use client";

import { Receta } from '@/types';
import { formatearMoneda } from '@/lib/constants';
import { useConfiguracion } from '@/hooks/useConfiguracion';
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, BarChart3, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface RecetasRentablesTableProps {
  recetas: Receta[];
  moneda: string;
}

export const RecetasRentablesTable = ({ recetas, moneda }: RecetasRentablesTableProps) => {
  const { configuracion } = useConfiguracion();
  const tasaCambio = configuracion?.tasaCambioUSD || 50;
  
  const recetasConMargen = recetas
    .filter(r => r.precioVentaSugerido && r.margenGanancia)
    .map(receta => ({
      ...receta,
      ganancia: (receta.precioVentaSugerido || 0) - receta.costoTotal,
      margenReal: receta.margenGanancia || 0,
    }))
    .sort((a, b) => b.ganancia - a.ganancia)
    .slice(0, 5);

  if (recetasConMargen.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <BarChart3 className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          No hay recetas analizadas
        </p>
        <p className="text-xs text-muted-foreground">
          Configura el precio de venta en tus recetas para ver este análisis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recetasConMargen.map((receta, index) => (
        <motion.div 
          key={receta.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Link href={`/recetas/${receta.id}`}>
            <div className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-border hover:bg-muted/50 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shadow-sm">
                  {index === 0 ? (
                    <Trophy className="h-5 w-5" />
                  ) : (
                    <TrendingUp className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {receta.nombre}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Costo: {formatearMoneda(receta.costoTotal, moneda, tasaCambio)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">
                    +{formatearMoneda(receta.ganancia, moneda, tasaCambio)}
                  </p>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-bold bg-emerald-100 text-emerald-700 border-none">
                    {receta.margenReal.toFixed(0)}% MARGEN
                  </Badge>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};
