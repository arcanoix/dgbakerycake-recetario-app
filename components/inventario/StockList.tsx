"use client";

import { StockProducto } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { getStockColumns } from "./inventario-columns";

interface StockListProps {
  stocks: StockProducto[];
  soloConMovimientos?: boolean;
  onSeleccionar?: (productoId: string) => void;
}

export const StockList = ({
  stocks,
  soloConMovimientos = false,
  onSeleccionar = () => {},
}: StockListProps) => {
  const stocksMostrados = soloConMovimientos
    ? stocks.filter((s) => s.ultimaActualizacion.getTime() > 0)
    : stocks;

  const columns = getStockColumns(onSeleccionar);

  return (
    <DataTable 
      columns={columns} 
      data={stocksMostrados} 
      searchKey="productoNombre"
      placeholder="Buscar producto en stock..."
    />
  );
};
