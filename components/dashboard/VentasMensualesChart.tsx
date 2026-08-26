"use client";

import { useId } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, PackageCheck } from "lucide-react";
import { formatearMoneda } from "@/lib/constants";

export interface VentaMensual {
  mes: string;
  ventas: number;
  ganancia: number;
  ordenes: number;
}

interface VentasMensualesChartProps {
  data: VentaMensual[];
  moneda: string;
  tasaCambio: number;
  totalMesActual: number;
  ordenesMesActual: number;
  anio: number;
}

export function VentasMensualesChart({
  data,
  moneda,
  tasaCambio,
  totalMesActual,
  ordenesMesActual,
  anio,
}: VentasMensualesChartProps) {
  const gradientId = `sales-bar-${useId().replace(/:/g, "")}`;
  const hasSales = data.some((item) => item.ordenes > 0);

  if (!hasSales) {
    return (
      <div className="flex min-h-[296px] flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/70 px-6 text-center">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
          <BarChart3 aria-hidden="true" className="h-5 w-5" />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-800">Aún no hay ventas entregadas en {anio}</p>
        <p className="mt-1 max-w-sm text-sm leading-5 text-slate-500">Cuando entregues una orden, aquí verás su ganancia y el ritmo de ventas mes a mes.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 border-b border-stone-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-emerald-700">Mes en curso</p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-[-0.05em] text-slate-950 tabular-nums sm:text-3xl">
            {formatearMoneda(totalMesActual, moneda, tasaCambio)}
          </p>
          <p className="mt-1 text-sm text-slate-500">Total vendido en órdenes entregadas</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-slate-600">
          <PackageCheck aria-hidden="true" className="h-4 w-4 text-emerald-600" />
          <span><strong className="font-mono font-semibold tabular-nums text-slate-900">{ordenesMesActual}</strong> entregadas</span>
        </div>
      </div>

      <div className="h-[270px]" role="img" aria-label={`Ganancia estimada por mes de ${anio}`}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }} barCategoryGap="28%">
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.74" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e7e5e4" strokeDasharray="3 5" />
            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "#78716c", fontSize: 11 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a8a29e", fontSize: 11 }} tickFormatter={(value) => `${Math.round(value)}`} width={42} />
            <Tooltip
              cursor={{ fill: "rgba(16, 185, 129, 0.06)" }}
              content={({ active, payload, label }) => {
                const point = payload?.[0]?.payload as VentaMensual | undefined;
                if (!active || !point) return null;
                return (
                  <div className="min-w-48 rounded-xl border border-stone-200 bg-white p-3 shadow-xl shadow-slate-900/10">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label} {anio}</p>
                    <p className="mt-2 text-sm text-slate-500">Ganancia estimada</p>
                    <p className="font-mono text-lg font-bold tabular-nums text-emerald-700">{formatearMoneda(point.ganancia, moneda, tasaCambio)}</p>
                    <div className="mt-3 border-t border-stone-100 pt-2 text-xs text-slate-500">
                      <p>Vendido: <span className="font-semibold text-slate-800">{formatearMoneda(point.ventas, moneda, tasaCambio)}</span></p>
                      <p className="mt-1">{point.ordenes} órdenes entregadas</p>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="ganancia" maxBarSize={36} radius={[8, 8, 2, 2]}>
              {data.map((entry) => (
                <Cell key={entry.mes} fill={entry.ganancia < 0 ? "#e11d48" : `url(#${gradientId})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-slate-500">La ganancia estimada descuenta el costo actual de las recetas incluidas en cada orden.</p>
    </div>
  );
}
