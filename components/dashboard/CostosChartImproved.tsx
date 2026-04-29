"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Receta } from '@/types';
import { formatearMoneda } from '@/lib/constants';
import { useConfiguracion } from '@/hooks/useConfiguracion';

interface CostosChartProps {
  recetas: Receta[];
  moneda: string;
}

export const CostosChart = ({ recetas, moneda }: CostosChartProps) => {
  const { configuracion } = useConfiguracion();
  const tasaCambio = configuracion?.tasaCambioUSD || 50;
  
  const data = recetas
    .slice(0, 8)
    .map(receta => ({
      nombre: receta.nombre.length > 12 ? receta.nombre.substring(0, 12) + '...' : receta.nombre,
      materiales: Number(receta.costoMateriales.toFixed(2)),
      manoObra: Number((receta.costoManoObra || 0).toFixed(2)),
      total: Number(receta.costoTotal.toFixed(2)),
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-border/50">
          <p className="font-semibold text-foreground mb-3 text-sm">{label}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-violet-600" />
                <span className="text-xs text-muted-foreground">Materiales</span>
              </div>
              <span className="text-xs font-semibold text-violet-600">
                {formatearMoneda(payload[0]?.value || 0, moneda, tasaCambio)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-fuchsia-600" />
                <span className="text-xs text-muted-foreground">Mano de obra</span>
              </div>
              <span className="text-xs font-semibold text-fuchsia-600">
                {formatearMoneda(payload[1]?.value || 0, moneda, tasaCambio)}
              </span>
            </div>
            <div className="border-t border-border/50 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Total</span>
                <span className="text-sm font-bold text-foreground">
                  {formatearMoneda(payload[2]?.value || 0, moneda, tasaCambio)}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-500 to-violet-600 shadow-sm" />
            <span className="text-xs font-medium text-muted-foreground">Materiales</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 shadow-sm" />
            <span className="text-xs font-medium text-muted-foreground">Mano de obra</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={8}>
          <defs>
            <linearGradient id="materialesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="manoObraGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d946ef" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#c026d3" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="hsl(var(--border))"
            opacity={0.3}
          />
          <XAxis 
            dataKey="nombre" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }} 
          />
          <Bar 
            dataKey="materiales" 
            fill="url(#materialesGradient)"
            name="Materiales"
            radius={[6, 6, 0, 0]} 
            barSize={20}
            animationDuration={800}
            animationBegin={0}
          />
          <Bar 
            dataKey="manoObra" 
            fill="url(#manoObraGradient)"
            name="Mano de obra"
            radius={[6, 6, 0, 0]} 
            barSize={20}
            animationDuration={800}
            animationBegin={200}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
