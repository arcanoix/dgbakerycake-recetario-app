import type { Orden } from "@/types";

export interface ClienteVentas {
  clienteId: string;
  nombre: string;
  total: number;
  ordenes: number;
}

export interface VentaMesResumen {
  /** Month index, 0 = January */
  mes: number;
  total: number;
  ordenes: number;
  topCliente?: ClienteVentas;
}

const NOMBRE_POR_DEFECTO = "Cliente sin nombre";

const esVentaDelAnio = (orden: Orden, anio: number): boolean =>
  orden.estado === "entregada" && new Date(orden.fechaCreacion).getFullYear() === anio;

const acumular = (
  mapa: Map<string, ClienteVentas>,
  orden: Orden,
  nombres: Map<string, string>
) => {
  const actual = mapa.get(orden.clienteId);
  if (actual) {
    actual.total += orden.total;
    actual.ordenes += 1;
    return;
  }
  mapa.set(orden.clienteId, {
    clienteId: orden.clienteId,
    nombre: orden.clienteNombre || nombres.get(orden.clienteId) || NOMBRE_POR_DEFECTO,
    total: orden.total,
    ordenes: 1,
  });
};

const mejorCliente = (mapa: Map<string, ClienteVentas>): ClienteVentas | undefined =>
  Array.from(mapa.values()).sort((a, b) => b.total - a.total)[0];

/**
 * Delivered-order totals per month (12 entries) with the top client of each month.
 * Amounts stay in USD, as everywhere else in the app.
 */
export const calcularVentasPorMes = (
  ordenes: Orden[],
  anio: number,
  nombresClientes: Map<string, string> = new Map()
): VentaMesResumen[] => {
  const clientesPorMes: Map<string, ClienteVentas>[] = Array.from({ length: 12 }, () => new Map());
  const meses: VentaMesResumen[] = Array.from({ length: 12 }, (_, mes) => ({ mes, total: 0, ordenes: 0 }));

  ordenes.forEach((orden) => {
    if (!esVentaDelAnio(orden, anio)) return;
    const mes = new Date(orden.fechaCreacion).getMonth();
    meses[mes].total += orden.total;
    meses[mes].ordenes += 1;
    acumular(clientesPorMes[mes], orden, nombresClientes);
  });

  return meses.map((resumen, mes) => ({ ...resumen, topCliente: mejorCliente(clientesPorMes[mes]) }));
};

/** Clients ranked by total purchased in delivered orders of the given year. */
export const calcularRankingClientes = (
  ordenes: Orden[],
  anio: number,
  limite = 5,
  nombresClientes: Map<string, string> = new Map()
): ClienteVentas[] => {
  const acumulado = new Map<string, ClienteVentas>();
  ordenes.forEach((orden) => {
    if (esVentaDelAnio(orden, anio)) acumular(acumulado, orden, nombresClientes);
  });
  return Array.from(acumulado.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, limite);
};
