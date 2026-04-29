"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { useState } from 'react';

interface ProductosChartProps {
  productos: { categoria: string; cantidad: number }[];
}

const COLORS = [
  { start: '#8b5cf6', end: '#7c3aed' }, // violet
  { start: '#d946ef', end: '#c026d3' }, // fuchsia
  { start: '#06b6d4', end: '#0891b2' }, // cyan
  { start: '#10b981', end: '#059669' }, // emerald
  { start: '#f59e0b', end: '#d97706' }, // amber
  { start: '#ef4444', end: '#dc2626' }, // red
  { start: '#6366f1', end: '#4f46e5' }, // indigo
  { start: '#ec4899', end: '#db2777' }, // pink
];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export const ProductosChart = ({ productos }: ProductosChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const total = productos.reduce((sum, p) => sum + p.cantidad, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-card/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-border/50">
          <p className="font-semibold text-foreground text-sm mb-2">{payload[0].name}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Cantidad</span>
              <span className="text-sm font-bold text-foreground">{payload[0].value}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Porcentaje</span>
              <span className="text-sm font-semibold text-primary">{percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="text-left">
          <p className="text-3xl font-bold tracking-tight">{total}</p>
          <p className="text-xs text-muted-foreground mt-1">Total productos</p>
        </div>
      </div>
      
      <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <defs>
              {COLORS.map((color, index) => (
                <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color.start} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={color.end} stopOpacity={0.7} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={productos}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="cantidad"
              nameKey="categoria"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              animationDuration={800}
              animationBegin={0}
            >
              {productos.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#gradient-${index % COLORS.length})`}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                  className="transition-all duration-300 hover:opacity-90"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend mejorada */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        {productos.slice(0, 6).map((producto, index) => {
          const percentage = ((producto.cantidad / total) * 100).toFixed(0);
          return (
            <div 
              key={producto.categoria} 
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" 
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS[index % COLORS.length].start}, ${COLORS[index % COLORS.length].end})`
                }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-muted-foreground truncate block">
                  {producto.categoria}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground">
                  {producto.cantidad}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
