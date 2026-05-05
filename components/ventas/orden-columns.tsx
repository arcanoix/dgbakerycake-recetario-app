"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Orden, EstadoOrden } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Edit2, 
  Trash2, 
  MoreHorizontal, 
  ShoppingBag, 
  FileText, 
  Download, 
  MessageCircle,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatearUSD } from "@/lib/currency";

const ESTADO_CONFIG: Record<EstadoOrden, { label: string; class: string; icon: any }> = {
  cotizacion: { label: "Cotización", class: "bg-muted text-muted-foreground border-none", icon: Clock },
  confirmada: { label: "Confirmada", class: "bg-blue-100 text-blue-700 border-none", icon: FileText },
  entregada: { label: "Entregada", class: "bg-emerald-100 text-emerald-700 border-none", icon: CheckCircle2 },
  cancelada: { label: "Cancelada", class: "bg-red-100 text-red-700 border-none", icon: XCircle },
};

interface ColumnsProps {
  onEdit: (orden: Orden) => void;
  onDelete: (id: string) => void;
  onExportPDF: (orden: Orden) => void;
  onWhatsApp: (orden: Orden) => void;
  onCambiarEstado: (id: string, estado: EstadoOrden) => void;
}

export const getOrdenColumns = ({
  onEdit,
  onDelete,
  onExportPDF,
  onWhatsApp,
  onCambiarEstado,
}: ColumnsProps): ColumnDef<Orden>[] => [
  {
    accessorKey: "numeroOrden",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0 font-bold"
      >
        Orden
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-mono font-bold text-sm">{row.original.numeroOrden}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {new Date(row.original.fechaCreacion || "").toLocaleDateString()}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "clienteNombre",
    header: "Cliente",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
          {row.original.clienteNombre?.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-sm truncate max-w-[150px]">
          {row.original.clienteNombre || "Sin nombre"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as EstadoOrden;
      const config = ESTADO_CONFIG[estado];
      const Icon = config.icon;
      return (
        <Badge className={`h-6 gap-1 px-2 font-bold ${config.class}`}>
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-bold text-sm">{formatearUSD(row.original.total)}</span>
        {row.original.saldoPendiente > 0 && (
          <span className="text-[10px] font-bold text-orange-600">
            Pendiente: {formatearUSD(row.original.saldoPendiente)}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "fechaEntrega",
    header: "Entrega",
    cell: ({ row }) => {
      const fecha = row.original.fechaEntrega ? new Date(row.original.fechaEntrega) : null;
      return fecha ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{fecha.toLocaleDateString()}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-xs italic">-</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const orden = row.original;
      const finalizada = orden.estado === "entregada" || orden.estado === "cancelada";

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
              onClick={() => onEdit(orden)}
              disabled={finalizada}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onExportPDF(orden)}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-green-600"
              onClick={() => onWhatsApp(orden)}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground">Cambiar Estado</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onCambiarEstado(orden.id, "cotizacion")} disabled={orden.estado === "cotizacion"}>
              <Clock className="mr-2 h-4 w-4" /> Cotización
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCambiarEstado(orden.id, "confirmada")} disabled={orden.estado === "confirmada"}>
              <FileText className="mr-2 h-4 w-4" /> Confirmar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCambiarEstado(orden.id, "entregada")} disabled={orden.estado === "entregada"}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Entregada
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onCambiarEstado(orden.id, "cancelada")} disabled={orden.estado === "cancelada"}>
              <XCircle className="mr-2 h-4 w-4" /> Cancelar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => {
                if (confirm(`¿Estás seguro de eliminar la orden ${orden.numeroOrden}?`)) {
                  onDelete(orden.id);
                }
              }}
              disabled={finalizada}
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
