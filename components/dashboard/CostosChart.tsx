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
        <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100">
          <p className="font-bold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-violet-600">
              <span className="font-medium">Materiales:</span> {formatearMoneda(payload[0]?.value || 0, moneda, tasaCambio)}
            </p>
            <p className="text-sm text-fuchsia-600">
              <span className="font-medium">Mano de obra:</span> {formatearMoneda(payload[1]?.value || 0, moneda, tasaCambio)}
            </p>
            <div className="border-t pt-1 mt-1">
              <p className="text-sm font-bold text-gray-900">
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
    <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Costos por Receta</h3>
          <p className="text-sm text-gray-500">Desglose de materiales y mano de obra</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-500"></div>
            <span className="text-xs text-gray-500">Materiales</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-fuchsia-500"></div>
            <span className="text-xs text-gray-500">Mano de obra</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis 
            dataKey="nombre" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
          <Bar 
            dataKey="materiales" 
            fill="#8b5cf6" 
            name="Materiales"
            radius={[4, 4, 0, 0]} 
            barSize={16}
          />
          <Bar 
            dataKey="manoObra" 
            fill="#d946ef" 
            name="Mano de obra"
            radius={[4, 4, 0, 0]} 
            barSize={16}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
