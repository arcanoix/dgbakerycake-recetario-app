"use client";

import { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";
import { Cliente } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Edit2, 
  Trash2, 
  MoreHorizontal, 
  User, 
  Mail, 
  Phone, 
  MapPin,
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
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
}

export const getClienteColumns = ({
  onEdit,
  onDelete,
}: ColumnsProps): ColumnDef<Cliente>[] => [
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0 font-bold"
      >
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const cliente = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
            {cliente.nombre.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-sm">{cliente.nombre}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return email ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <span>{email}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-xs italic">-</span>
      );
    },
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
    cell: ({ row }) => {
      const telefono = row.getValue("telefono") as string;
      return telefono ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          <span>{telefono}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-xs italic">-</span>
      );
    },
  },
  {
    accessorKey: "direccion",
    header: "Dirección",
    cell: ({ row }) => {
      const direccion = row.getValue("direccion") as string;
      return direccion ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground truncate max-w-[200px]">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{direccion}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-xs italic">-</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const cliente = row.original;

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
              onClick={() => onEdit(cliente)}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => {
                if (confirm(`¿Estás seguro de eliminar a "${cliente.nombre}"?`)) {
                  onDelete(cliente.id);
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
