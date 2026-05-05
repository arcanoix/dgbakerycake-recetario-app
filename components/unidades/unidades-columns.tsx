"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UnidadMedidaAdmin } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Edit2, 
  Trash2, 
  ArrowUpDown,
  Scale,
  Droplets,
  Hash,
  Box,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TYPE_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  peso: { icon: Scale, label: 'Peso', color: 'text-blue-600 bg-blue-50' },
  volumen: { icon: Droplets, label: 'Volumen', color: 'text-cyan-600 bg-cyan-50' },
  cantidad: { icon: Hash, label: 'Cantidad', color: 'text-amber-600 bg-amber-50' },
  otro: { icon: Box, label: 'Otro', color: 'text-slate-600 bg-slate-50' },
};

interface ColumnsProps {
  onEdit: (unidad: UnidadMedidaAdmin) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (unidad: UnidadMedidaAdmin) => void;
}

export const getUnidadColumns = ({
  onEdit,
  onDelete,
  onToggleStatus,
}: ColumnsProps): ColumnDef<UnidadMedidaAdmin>[] => [
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0 font-bold"
      >
        Unidad
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const unidad = row.original;
      const typeConfig = TYPE_CONFIG[unidad.tipo] || TYPE_CONFIG.otro;
      const Icon = typeConfig.icon;
      
      return (
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${typeConfig.color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{unidad.nombre}</span>
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
              Símbolo: {unidad.simbolo}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.getValue("tipo") as string;
      const config = TYPE_CONFIG[tipo] || TYPE_CONFIG.otro;
      return (
        <Badge variant="outline" className="font-bold uppercase tracking-wider text-[10px]">
          {config.label}
        </Badge>
      );
    },
  },
  {
    id: "conversion",
    header: "Factor de Conversión",
    cell: ({ row }) => {
      const unidad = row.original;
      return unidad.factorConversionBase ? (
        <div className="flex items-center gap-2 text-sm font-medium">
          <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
          <span>1 {unidad.simbolo} = {unidad.factorConversionBase} {unidad.unidadBase || 'base'}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-xs italic">Unidad base</span>
      );
    },
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }) => {
      const activo = row.getValue("activo") as boolean;
      return (
        <Badge className={`h-6 gap-1 px-2 font-bold ${activo ? "bg-emerald-100 text-emerald-700 border-none" : "bg-muted text-muted-foreground border-none"}`}>
          {activo ? (
            <><CheckCircle2 className="h-3 w-3" /> ACTIVO</>
          ) : (
            <><XCircle className="h-3 w-3" /> INACTIVO</>
          )}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const unidad = row.original;

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
              onClick={() => onEdit(unidad)}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onToggleStatus(unidad)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {unidad.activo ? "Desactivar" : "Activar"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => {
                if (confirm(`¿Estás seguro de eliminar "${unidad.nombre}"?`)) {
                  onDelete(unidad.id);
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
