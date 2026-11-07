import { calcularRankingClientes, calcularVentasPorMes } from "@/lib/ventasStats";
import type { Orden } from "@/types";

const crearOrden = (parcial: Partial<Orden>): Orden =>
  ({
    id: "o",
    userId: "u",
    clienteId: "c1",
    numeroOrden: "1",
    estado: "entregada",
    items: [],
    subtotal: 0,
    descuentoPorcentaje: 0,
    descuentoMonto: 0,
    total: 0,
    pagoAdelantado: 0,
    saldoPendiente: 0,
    fechaCreacion: new Date(2026, 0, 10),
    fechaActualizacion: new Date(2026, 0, 10),
    ...parcial,
  }) as Orden;

describe("ventasStats", () => {
  const ordenes = [
    crearOrden({ id: "1", clienteId: "a", clienteNombre: "Ana", total: 100, fechaCreacion: new Date(2026, 0, 5) }),
    crearOrden({ id: "2", clienteId: "b", clienteNombre: "Beto", total: 40, fechaCreacion: new Date(2026, 0, 20) }),
    crearOrden({ id: "3", clienteId: "b", clienteNombre: "Beto", total: 90, fechaCreacion: new Date(2026, 1, 3) }),
    crearOrden({ id: "4", clienteId: "a", clienteNombre: "Ana", total: 500, estado: "cotizacion", fechaCreacion: new Date(2026, 1, 4) }),
    crearOrden({ id: "5", clienteId: "a", clienteNombre: "Ana", total: 70, fechaCreacion: new Date(2025, 5, 4) }),
  ];

  it("sums only delivered orders of the year per month and finds the top client", () => {
    const meses = calcularVentasPorMes(ordenes, 2026);
    expect(meses).toHaveLength(12);
    expect(meses[0]).toMatchObject({ total: 140, ordenes: 2 });
    expect(meses[0].topCliente).toMatchObject({ nombre: "Ana", total: 100 });
    expect(meses[1]).toMatchObject({ total: 90, ordenes: 1 });
    expect(meses[1].topCliente?.nombre).toBe("Beto");
    expect(meses[2]).toMatchObject({ total: 0, ordenes: 0, topCliente: undefined });
  });

  it("ranks clients by total and respects the limit", () => {
    const ranking = calcularRankingClientes(ordenes, 2026, 1);
    expect(ranking).toHaveLength(1);
    expect(ranking[0]).toMatchObject({ clienteId: "b", total: 130, ordenes: 2 });
  });

  it("falls back to the clients map for the name", () => {
    const sinNombre = [crearOrden({ clienteId: "z", clienteNombre: undefined, total: 10 })];
    const ranking = calcularRankingClientes(sinNombre, 2026, 5, new Map([["z", "Zoe"]]));
    expect(ranking[0].nombre).toBe("Zoe");
  });
});
