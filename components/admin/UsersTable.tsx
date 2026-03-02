"use client";

import { useState } from "react";
import { UserData } from "@/types/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface UsersTableProps {
  usuarios: UserData[];
}

export const UsersTable = ({ usuarios }: UsersTableProps) => {
  const [busqueda, setBusqueda] = useState("");

  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Activo</Badge>;
      case "expired":
        return <Badge className="bg-red-500">Expirado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case "canceled":
        return <Badge className="bg-gray-500">Cancelado</Badge>;
      default:
        return <Badge className="bg-gray-400">N/A</Badge>;
    }
  };

  const getRoleBadge = (role?: string) => {
    if (role === "admin") {
      return <Badge className="bg-purple-500">Admin</Badge>;
    }
    return <Badge variant="outline">Cliente</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-VE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios Registrados ({usuarios.length})</CardTitle>
        <div className="mt-4">
          <Input
            type="text"
            placeholder="Buscar por email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">Productos</TableHead>
                <TableHead className="text-center">Recetas</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Vencimiento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuariosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">
                      {usuario.email}
                    </TableCell>
                    <TableCell>{getRoleBadge(usuario.role)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {usuario.plan_display_name || "N/A"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {usuario.plan_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(usuario.subscription_status)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono">
                        {usuario.productos_count || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono">
                        {usuario.recetas_count || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(usuario.start_date)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(usuario.end_date)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {usuariosFiltrados.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
          </div>
        )}
      </CardContent>
    </Card>
  );
};
