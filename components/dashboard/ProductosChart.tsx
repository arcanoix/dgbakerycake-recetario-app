"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ProductosChartProps {
  productos: { categoria: string; cantidad: number }[];
}

const COLORS = ['#8b5cf6', '#d946ef', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];

export const ProductosChart = ({ productos }: ProductosChartProps) => {
  const total = productos.reduce((sum, p) => sum + p.cantidad, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-300">
          <p className="font-bold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-700">
            {payload[0].value} productos ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Productos por Categoría</h3>
          <p className="text-sm text-gray-700">Distribución de inventario</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-violet-600">{total}</p>
          <p className="text-xs text-gray-700">Total productos</p>
        </div>
      </div>
      
      <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={productos}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="cantidad"
              nameKey="categoria"
            >
              {productos.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {productos.slice(0, 6).map((producto, index) => (
          <div key={producto.categoria} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-xs text-gray-600 truncate">
              {producto.categoria}
            </span>
            <span className="text-xs font-medium text-gray-900 ml-auto">
              {producto.cantidad}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
