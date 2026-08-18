"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatearMoneda } from "@/lib/constants";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

interface Sale {
  id: string;
  cliente?: string;
  total: number;
  estado: string;
  fechaCreacion?: string | Date;
}

interface RecentSalesProps {
  ventas: Sale[];
  moneda: string;
  tasaCambio: number;
}

const getInitials = (name: string) => {
  if (!name) return "??";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getEstadoBadge = (estado: string) => {
  const estados: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
    cotizacion: { variant: "secondary", label: "Cotización" },
    confirmada: { variant: "default", label: "Confirmada" },
    entregada: { variant: "outline", label: "Entregada" },
    cancelada: { variant: "destructive", label: "Cancelada" },
  };
  return estados[estado] || { variant: "secondary", label: estado };
};

export const RecentSales = ({ ventas, moneda, tasaCambio }: RecentSalesProps) => {
  if (ventas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          No hay ventas registradas
        </p>
        <p className="text-xs text-muted-foreground">
          Las ventas recientes aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ventas.map((venta, index) => {
        const badge = getEstadoBadge(venta.estado);
        const isPositive = venta.estado === "entregada";
        
        return (
          <motion.div
            key={venta.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link href={`/ventas/${venta.id}`}>
              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 cursor-pointer group border border-transparent hover:border-border">
                <Avatar className="h-12 w-12 border-2 border-border/50">
                  <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-semibold">
                    {getInitials(venta.cliente || "Cliente")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {venta.cliente || "Cliente sin nombre"}
                    </p>
                    <Badge variant={badge.variant} className="text-xs">
                      {badge.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {venta.fechaCreacion 
                        ? new Date(venta.fechaCreacion).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'short',
                            year: 'numeric'
                          })
                        : "Sin fecha"
                      }
                    </p>
                    <span className="text-xs text-muted-foreground">•</span>
                    <p className="text-xs text-muted-foreground">
                      #{venta.id.substring(0, 8)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      {formatearMoneda(venta.total, moneda, tasaCambio)}
                    </p>
                    {isPositive && (
                      <div className="flex items-center justify-end gap-1 text-emerald-600">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-xs font-medium">Completada</span>
                      </div>
                    )}
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};
