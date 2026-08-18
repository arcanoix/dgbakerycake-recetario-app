"use client";

import { MovimientoInventario, Producto } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { getKardexColumns } from "./inventario-columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface KardexTableProps {
  movimientos: MovimientoInventario[];
  onEliminar: (id: string) => Promise<void>;
  productoFiltro?: string;
  onFiltroChange?: (id: string) => void;
  productos?: Producto[];
}

export const KardexTable = ({
  movimientos,
  onEliminar,
  productoFiltro,
  onFiltroChange,
  productos = [],
}: KardexTableProps) => {
  const columns = getKardexColumns(onEliminar);

  return (
    <div className="space-y-4">
      {onFiltroChange && (
        <div className="flex flex-col sm:flex-row items-end gap-4 bg-muted/30 p-4 rounded-xl border">
          <div className="space-y-2 w-full sm:w-[300px]">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filtrar por Producto</Label>
            <Select value={productoFiltro || "all"} onValueChange={(val) => onFiltroChange(val === "all" ? "" : val)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Todos los productos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los productos</SelectItem>
                {productos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs text-muted-foreground font-medium">
              Mostrando <span className="text-foreground font-bold">{movimientos.length}</span> movimientos registrados
            </p>
          </div>
        </div>
      )}
      
      <DataTable 
        columns={columns} 
        data={movimientos} 
        searchKey="notas"
        placeholder="Buscar en notas del kardex..."
      />
    </div>
  );
};
