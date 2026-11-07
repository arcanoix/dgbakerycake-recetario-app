"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Crown, Users } from "lucide-react";
import { formatearMoneda } from "@/lib/constants";
import type { ClienteVentas, VentaMesResumen } from "@/lib/ventasStats";

interface VentasClientesResumenProps {
  meses: VentaMesResumen[];
  ranking: ClienteVentas[];
  nombresMeses: string[];
  moneda: string;
  tasaCambio: number;
  anio: number;
}

export function VentasClientesResumen({
  meses,
  ranking,
  nombresMeses,
  moneda,
  tasaCambio,
  anio,
}: VentasClientesResumenProps) {
  const hayVentas = meses.some((m) => m.ordenes > 0);
  const mejor = ranking[0];
  const data = meses.map((m) => ({ ...m, etiqueta: nombresMeses[m.mes] }));
  const mesesConVentas = meses.filter((m) => m.ordenes > 0);

  if (!hayVentas) {
    return (
      <p className="py-10 text-center text-sm text-slate-500">
        Aún no hay ventas entregadas en {anio}.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="h-[260px]" role="img" aria-label={`Ventas totales por mes de ${anio}`}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e7e5e4" strokeDasharray="3 5" />
            <XAxis dataKey="etiqueta" axisLine={false} tickLine={false} tick={{ fill: "#78716c", fontSize: 11 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a8a29e", fontSize: 11 }}
              tickFormatter={(value) => `${Math.round(value)}`}
              width={42}
            />
            <Tooltip
              cursor={{ fill: "rgba(59, 130, 246, 0.06)" }}
              content={({ active, payload }) => {
                const punto = payload?.[0]?.payload as (VentaMesResumen & { etiqueta: string }) | undefined;
                if (!active || !punto) return null;
                return (
                  <div className="min-w-48 rounded-xl border border-stone-200 bg-white p-3 shadow-xl shadow-slate-900/10">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      {punto.etiqueta} {anio}
                    </p>
                    <p className="mt-2 font-mono text-lg font-bold tabular-nums text-blue-700">
                      {formatearMoneda(punto.total, moneda, tasaCambio)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{punto.ordenes} órdenes entregadas</p>
                    {punto.topCliente && (
                      <p className="mt-2 border-t border-stone-100 pt-2 text-xs text-slate-500">
                        Mejor cliente:{" "}
                        <span className="font-semibold text-slate-800">{punto.topCliente.nombre}</span>
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Crown aria-hidden="true" className="h-4 w-4 text-amber-500" />
            Clientes que más compran en {anio}
          </div>
          {mejor && (
            <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-amber-700">Mejor cliente</p>
              <p className="mt-1 font-semibold text-slate-900">{mejor.nombre}</p>
              <p className="font-mono text-lg font-bold tabular-nums text-slate-900">
                {formatearMoneda(mejor.total, moneda, tasaCambio)}
              </p>
              <p className="text-xs text-slate-500">{mejor.ordenes} órdenes entregadas</p>
            </div>
          )}
          <ol className="space-y-2">
            {ranking.map((cliente, i) => (
              <li key={cliente.clienteId} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="w-5 text-right font-mono text-slate-400">{i + 1}</span>
                  <span className="truncate text-slate-800">{cliente.nombre}</span>
                </span>
                <span className="font-mono tabular-nums text-slate-900">
                  {formatearMoneda(cliente.total, moneda, tasaCambio)}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Users aria-hidden="true" className="h-4 w-4 text-slate-500" />
            Total y mejor cliente por mes
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-[0.06em] text-slate-500">
                <th className="pb-2 font-medium">Mes</th>
                <th className="pb-2 text-right font-medium">Total</th>
                <th className="pb-2 pl-3 font-medium">Mejor cliente</th>
              </tr>
            </thead>
            <tbody>
              {mesesConVentas.map((m) => (
                <tr key={m.mes} className="border-b border-stone-100 last:border-0">
                  <td className="py-2 capitalize text-slate-700">{nombresMeses[m.mes]}</td>
                  <td className="py-2 text-right font-mono tabular-nums text-slate-900">
                    {formatearMoneda(m.total, moneda, tasaCambio)}
                  </td>
                  <td className="max-w-[9rem] truncate py-2 pl-3 text-slate-700">{m.topCliente?.nombre ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
