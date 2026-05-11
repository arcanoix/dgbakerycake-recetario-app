"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Receta } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrecioDual } from "@/components/ui/precio-dual";
import { 
  Edit2, 
  Trash2, 
  MoreHorizontal, 
  ChefHat, 
  FileText, 
  Copy, 
  Eye, 
  ArrowUpDown,
  UtensilsCrossed
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
  onEdit: (receta: Receta) => void;
  onView?: (receta: Receta) => void;
  onDelete: (id: string) => void;
  onDuplicate: (receta: Receta) => void;
  onExportPDF: (receta: Receta) => void;
  tasaCambio: number;
  moneda: string;
}

export const getRecetaColumns = ({
  onEdit,
  onView,
  onDelete,
  onDuplicate,
  onExportPDF,
  tasaCambio,
  moneda,
}: ColumnsProps): ColumnDef<Receta>[] => [
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0 font-bold"
      >
        Receta
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const receta = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <ChefHat className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{receta.nombre}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {receta.categoria || "Sin categoría"}
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
    id: "materiales",
    header: "Ingredientes",
    cell: ({ row }) => {
      const materiales = row.original.materiales || [];
      return (
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm font-medium">
            {materiales.length} {materiales.length === 1 ? 'ítem' : 'ítems'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "costoTotal",
    header: "Costo Total",
    cell: ({ row }) => (
      <PrecioDual 
        valorUSD={row.original.costoTotal} 
        tasaCambio={tasaCambio}
        monedaPorDefecto={moneda}
        className="text-sm font-bold"
      />
    ),
  },
  {
    accessorKey: "precioVentaSugerido",
    header: "Precio Venta",
    cell: ({ row }) => {
      const precio = row.original.precioVentaSugerido;
      return precio ? (
        <div className="flex flex-col gap-1">
          <PrecioDual 
            valorUSD={precio} 
            tasaCambio={tasaCambio}
            monedaPorDefecto={moneda}
            className="text-sm font-bold text-emerald-600"
          />
          {row.original.margenGanancia && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-100 w-fit">
              +{row.original.margenGanancia}%
            </span>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground text-xs italic">No config.</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const receta = row.original;

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
            {onView && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onView(receta)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onEdit(receta)}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onDuplicate(receta)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onExportPDF(receta)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Exportar PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => {
                if (confirm(`¿Estás seguro de eliminar "${receta.nombre}"?`)) {
                  onDelete(receta.id);
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
