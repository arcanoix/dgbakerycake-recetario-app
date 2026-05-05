"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Producto } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrecioDual } from "@/components/ui/precio-dual";
import { formatearNumero } from "@/lib/constants";
import { 
  Edit2, 
  Trash2, 
  MoreHorizontal, 
  Package, 
  Building2, 
  ArrowUpDown 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ColumnsProps {
  onEdit: (producto: Producto) => void;
  onDelete: (id: string) => void;
  tasaCambio: number;
  moneda: string;
}

export const getProductoColumns = ({
  onEdit,
  onDelete,
  tasaCambio,
  moneda,
}: ColumnsProps): ColumnDef<Producto>[] => [
  {
    accessorKey: "nombre",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-bold"
        >
          Producto
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const producto = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{producto.nombre}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {producto.categoria || "Sin categoría"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "categoria",
    header: "Categoría",
    cell: ({ row }) => {
      const categoria = row.getValue("categoria") as string;
      return categoria ? (
        <Badge variant="outline" className="font-medium">
          {categoria}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-xs">-</span>
      );
    },
  },
  {
    accessorKey: "precioTotal",
    header: "Precio Total",
    cell: ({ row }) => {
      const precio = row.getValue("precioTotal") as number;
      return (
        <PrecioDual 
          valorUSD={precio} 
          tasaCambio={tasaCambio}
          monedaPorDefecto={moneda}
          className="text-sm font-bold"
        />
      );
    },
  },
  {
    accessorKey: "cantidadTotal",
    header: "Cantidad Total",
    cell: ({ row }) => {
      const producto = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {formatearNumero(producto.cantidadTotal)} {producto.unidadMedidaSimbolo}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {producto.cantidadPresentaciones} x {formatearNumero(producto.tamañoPresentacion)} {producto.unidadMedidaSimbolo}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "precioPorUnidad",
    header: "Costo Unitario",
    cell: ({ row }) => {
      const precio = row.getValue("precioPorUnidad") as number;
      return (
        <PrecioDual 
          valorUSD={precio} 
          tasaCambio={tasaCambio}
          monedaPorDefecto={moneda}
          className="text-sm font-medium text-muted-foreground"
        />
      );
    },
  },
  {
    accessorKey: "proveedor",
    header: "Proveedor",
    cell: ({ row }) => {
      const proveedor = row.getValue("proveedor") as string;
      return proveedor ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3" />
          <span className="truncate max-w-[120px]">{proveedor}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-xs">-</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const producto = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onEdit(producto)}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => {
                if (confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`)) {
                  onDelete(producto.id);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
