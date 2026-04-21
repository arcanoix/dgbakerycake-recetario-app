"use client";

import { useState } from "react";
import { ActivityLog } from "@/types/user";
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
import { Button } from "@/components/ui/button";

interface ActivityLogsTableProps {
  logs: ActivityLog[];
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  create: { label: "Creación", color: "bg-green-500" },
  update: { label: "Edición", color: "bg-blue-500" },
  delete: { label: "Eliminación", color: "bg-red-500" },
  login: { label: "Inicio sesión", color: "bg-purple-500" },
  logout: { label: "Cierre sesión", color: "bg-gray-1000" },
  view: { label: "Consulta", color: "bg-yellow-500" },
};

const MODULE_LABELS: Record<string, string> = {
  recetas: "Recetas",
  productos: "Productos",
  auth: "Autenticación",
  configuracion: "Configuración",
  categorias: "Categorías",
  unidades: "Unidades",
  subscription: "Suscripción",
};

export const ActivityLogsTable = ({ logs }: ActivityLogsTableProps) => {
  const [busqueda, setBusqueda] = useState("");
  const [filtroModulo, setFiltroModulo] = useState("all");
  const [filtroAccion, setFiltroAccion] = useState("all");
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 25;

  const logsFiltrados = logs.filter((log) => {
    const coincideBusqueda =
      !busqueda ||
      log.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.description?.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.ip_address?.includes(busqueda) ||
      log.entity_name?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideModulo = filtroModulo === "all" || log.module === filtroModulo;
    const coincideAccion = filtroAccion === "all" || log.action === filtroAccion;

    return coincideBusqueda && coincideModulo && coincideAccion;
  });

  const totalPaginas = Math.ceil(logsFiltrados.length / registrosPorPagina);
  const logsEnPagina = logsFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  const modulosUnicos = Array.from(new Set(logs.map((l) => l.module)));
  const accionesUnicas = Array.from(new Set(logs.map((l) => l.action)));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-VE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionBadge = (action: string) => {
    const info = ACTION_LABELS[action] || { label: action, color: "bg-gray-400" };
    return <Badge className={`${info.color} text-white text-xs`}>{info.label}</Badge>;
  };

  const getModuleBadge = (module: string) => {
    const label = MODULE_LABELS[module] || module;
    return (
      <Badge variant="outline" className="text-xs font-mono">
        {label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Registro de Actividades ({logs.length} registros totales)
        </CardTitle>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-3">
          <Input
            type="text"
            placeholder="Buscar por email, descripción, IP..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            className="max-w-xs"
          />

          <select
            value={filtroModulo}
            onChange={(e) => {
              setFiltroModulo(e.target.value);
              setPaginaActual(1);
            }}
            className="border rounded-md px-3 py-2 text-sm bg-background"
          >
            <option value="all">Todos los módulos</option>
            {modulosUnicos.map((m) => (
              <option key={m} value={m}>
                {MODULE_LABELS[m] || m}
              </option>
            ))}
          </select>

          <select
            value={filtroAccion}
            onChange={(e) => {
              setFiltroAccion(e.target.value);
              setPaginaActual(1);
            }}
            className="border rounded-md px-3 py-2 text-sm bg-background"
          >
            <option value="all">Todas las acciones</option>
            {accionesUnicas.map((a) => (
              <option key={a} value={a}>
                {ACTION_LABELS[a]?.label || a}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>

      <CardContent>
        {logsFiltrados.length === 0 ? (
          <p className="text-center text-gray-700 py-8">
            No se encontraron registros de actividad.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha y hora</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Navegador</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsEnPagina.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs whitespace-nowrap text-gray-700">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell className="text-sm font-medium max-w-[180px] truncate">
                        {log.email || (
                          <span className="text-gray-700 text-xs font-mono">
                            {log.user_id?.slice(0, 8)}…
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{getModuleBadge(log.module)}</TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="text-sm max-w-[240px] truncate" title={log.description}>
                        {log.description || "—"}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-gray-700 whitespace-nowrap">
                        {log.ip_address || "—"}
                      </TableCell>
                      <TableCell
                        className="text-xs text-gray-700 max-w-[160px] truncate"
                        title={log.user_agent}
                      >
                        {log.user_agent
                          ? log.user_agent.split(" ").slice(0, 2).join(" ")
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPaginas > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm text-gray-700">
                <span>
                  Página {paginaActual} de {totalPaginas} ·{" "}
                  {logsFiltrados.length} registros
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                  >
                    ← Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPaginaActual((p) => Math.min(totalPaginas, p + 1))
                    }
                    disabled={paginaActual === totalPaginas}
                  >
                    Siguiente →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
