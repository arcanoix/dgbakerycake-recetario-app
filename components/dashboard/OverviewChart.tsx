"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatearMoneda } from '@/lib/constants';

interface OverviewChartProps {
  data: {
    mes: string;
    ventas: number;
    costos: number;
  }[];
  moneda: string;
  tasaCambio: number;
}

export const OverviewChart = ({ data, moneda, tasaCambio }: OverviewChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const ganancia = (payload[0]?.value || 0) - (payload[1]?.value || 0);
      return (
        <div className="bg-card/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-border/50">
          <p className="font-semibold text-foreground mb-3 text-sm">{label}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600" />
                <span className="text-xs text-muted-foreground">Ventas</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600">
                {formatearMoneda(payload[0]?.value || 0, moneda, tasaCambio)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-500 to-red-600" />
                <span className="text-xs text-muted-foreground">Costos</span>
              </div>
              <span className="text-xs font-semibold text-red-600">
                {formatearMoneda(payload[1]?.value || 0, moneda, tasaCambio)}
              </span>
            </div>
            <div className="border-t border-border/50 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Ganancia</span>
                <span className={`text-sm font-bold ${ganancia >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatearMoneda(ganancia, moneda, tasaCambio)}
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
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm" />
            <span className="text-xs font-medium text-muted-foreground">Ventas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-sm" />
            <span className="text-xs font-medium text-muted-foreground">Costos</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="ventasGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="costosGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="hsl(var(--border))"
            opacity={0.3}
          />
          <XAxis 
            dataKey="mes" 
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
            cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }} 
          />
          <Area
            type="monotone"
            dataKey="ventas"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#ventasGradient)"
            animationDuration={800}
            animationBegin={0}
          />
          <Area
            type="monotone"
            dataKey="costos"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#costosGradient)"
            animationDuration={800}
            animationBegin={200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
