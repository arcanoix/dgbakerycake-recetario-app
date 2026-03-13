"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Receta } from '@/types';
import { formatearMoneda } from '@/lib/constants';

interface CostosChartProps {
  recetas: Receta[];
  moneda: string;
}

export const CostosChart = ({ recetas, moneda }: CostosChartProps) => {
  const data = recetas
    .slice(0, 10)
    .map(receta => ({
      nombre: receta.nombre.length > 15 ? receta.nombre.substring(0, 15) + '...' : receta.nombre,
      materiales: receta.costoMateriales,
      total: receta.costoTotal,
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          <p className="text-sm text-blue-600">
            Materiales: {formatearMoneda(payload[0].value, moneda)}
          </p>
          <p className="text-sm font-bold text-purple-600">
            Total: {formatearMoneda(payload[1].value, moneda)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-bold mb-4">Desglose de Costos por Receta</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="materiales" fill="#3b82f6" name="Materiales" />
          <Bar dataKey="total" fill="#8b5cf6" name="Total" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
