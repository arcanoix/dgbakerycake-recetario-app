"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
        <div className="bg-card p-4 rounded-lg shadow-lg border">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-amber-700">
              <span className="font-medium">Materiales:</span> {formatearMoneda(payload[0]?.value || 0, moneda, tasaCambio)}
            </p>
            <p className="text-sm text-emerald-700">
              <span className="font-medium">Mano de obra:</span> {formatearMoneda(payload[1]?.value || 0, moneda, tasaCambio)}
            </p>
            <div className="border-t pt-1 mt-1">
              <p className="text-sm font-semibold text-foreground">
                Total: {formatearMoneda(payload[2]?.value || 0, moneda, tasaCambio)}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-xs text-muted-foreground">Materiales</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-muted-foreground">Mano de obra</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
          <XAxis 
            dataKey="nombre" 
            axisLine={false} 
            tickLine={false}
            className="text-muted-foreground"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            className="text-muted-foreground"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
          <Bar 
            dataKey="materiales" 
            fill="#d97706"
            name="Materiales"
            radius={[4, 4, 0, 0]} 
            barSize={16}
          />
          <Bar 
            dataKey="manoObra" 
            fill="#059669"
            name="Mano de obra"
            radius={[4, 4, 0, 0]} 
            barSize={16}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
