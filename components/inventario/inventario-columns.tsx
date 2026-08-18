"use client";

import { ColumnDef } from "@tanstack/react-table";
import { StockProducto, MovimientoInventario } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Trash2,
  Clock
} from "lucide-react";

export const getStockColumns = (onSeleccionar: (id: string) => void): ColumnDef<StockProducto>[] => [
  {
    accessorKey: "productoNombre",
    header: "Producto",
    cell: ({ row }) => {
      const stock = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{stock.productoNombre}</span>
          <span className="text-[10px] text-muted-foreground uppercase">
            ID: {stock.productoId.substring(0, 8)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "stockActual",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0 font-bold"
      >
        Stock Actual
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const stock = row.original;
      return (
        <span className={`font-bold ${stock.esStockCritico ? "text-destructive" : "text-foreground"}`}>
          {stock.stockActual.toLocaleString("es", { maximumFractionDigits: 2 })} {stock.unidadMedidaSimbolo}
        </span>
      );
    },
  },
  {
    accessorKey: "stockMinimo",
    header: "Mínimo",
    cell: ({ row }) => {
      const stock = row.original;
      return stock.stockMinimo > 0 ? (
        <span className="text-muted-foreground text-sm font-medium">
          {stock.stockMinimo.toLocaleString("es", { maximumFractionDigits: 2 })} {stock.unidadMedidaSimbolo}
        </span>
      ) : (
        <span className="text-muted-foreground text-xs italic">No config.</span>
      );
    },
  },
  {
    id: "status",
    header: "Estado",
    cell: ({ row }) => {
      const stock = row.original;
      const progress = stock.stockMinimo > 0 
        ? Math.min(100, (stock.stockActual / (stock.stockMinimo * 2)) * 100) 
        : 100;
      
      return (
        <div className="flex flex-col gap-2 min-w-[120px]">
          <div className="flex items-center justify-between gap-2">
            {stock.esStockCritico ? (
              <Badge variant="destructive" className="h-5 px-1.5 text-[10px] font-bold">
                <AlertTriangle className="mr-1 h-3 w-3" />
                CRÍTICO
              </Badge>
            ) : (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 border-none">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                ÓPTIMO
              </Badge>
            )}
            <span className="text-[10px] font-bold text-muted-foreground">
              {progress.toFixed(0)}%
            </span>
          </div>
          {stock.stockMinimo > 0 && (
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${stock.esStockCritico ? "bg-destructive" : "bg-emerald-500"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onSeleccionar(row.original.productoId)}
        className="h-8 px-2 hover:bg-primary/10 hover:text-primary transition-colors"
      >
        <Clock className="h-4 w-4 mr-2" />
        Kardex
      </Button>
    ),
  },
];

export const getKardexColumns = (onEliminar: (id: string) => void): ColumnDef<MovimientoInventario>[] => [
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => {
      const fecha = new Date(row.original.fecha);
      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {fecha.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {fecha.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.getValue("tipo") as string;
      const config: Record<string, { icon: any; label: string; class: string }> = {
        compra: { icon: ArrowUpRight, label: "Compra", class: "bg-emerald-100 text-emerald-700 border-none" },
        uso: { icon: ArrowDownRight, label: "Uso", class: "bg-blue-100 text-blue-700 border-none" },
        merma: { icon: AlertTriangle, label: "Merma", class: "bg-red-100 text-red-700 border-none" },
        ajuste_entrada: { icon: ArrowUpRight, label: "Ajuste +", class: "bg-emerald-100 text-emerald-700 border-none" },
        ajuste_salida: { icon: ArrowDownRight, label: "Ajuste -", class: "bg-orange-100 text-orange-700 border-none" },
      };
      const c = config[tipo] || { icon: CheckCircle2, label: tipo, class: "bg-gray-100 text-gray-700 border-none" };
      const Icon = c.icon;
      return (
        <Badge className={`h-6 gap-1 px-2 font-bold ${c.class}`}>
          <Icon className="h-3 w-3" />
          {c.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "productoNombre",
    header: "Producto",
    cell: ({ row }) => <span className="font-semibold text-sm">{row.original.productoNombre}</span>,
  },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
    cell: ({ row }) => {
      const mov = row.original;
      const esEntrada = mov.tipo === 'compra' || mov.tipo === 'ajuste_entrada';
      return (
        <span className={`font-bold text-sm ${esEntrada ? 'text-emerald-600' : 'text-amber-600'}`}>
          {esEntrada ? '+' : '-'}{row.original.cantidad.toLocaleString("es")} {row.original.unidadMedidaSimbolo || row.original.unidadMedida}
        </span>
      );
    },
  },
  {
    accessorKey: "stockNuevo",
    header: "Stock Final",
    cell: ({ row }) => (
      <span className="font-bold text-sm">
        {row.original.stockNuevo.toLocaleString("es")}
      </span>
    ),
  },
  {
    accessorKey: "notas",
    header: "Nota",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground italic truncate max-w-[150px] inline-block">
        {row.original.notas || "-"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => {
          if (confirm("¿Estás seguro de eliminar este movimiento?")) {
            onEliminar(row.original.id);
          }
        }}
        className="h-8 w-8 text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    ),
  },
];
