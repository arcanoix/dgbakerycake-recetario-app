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
  title?: string;
  emptyMessage?: string;
}

const ACTION_LABELS: Record<string, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
  create: { label: "Creación", variant: "default" },
  update: { label: "Edición", variant: "outline" },
  delete: { label: "Eliminación", variant: "destructive" },
  login: { label: "Inicio sesión", variant: "default" },
  logout: { label: "Cierre sesión", variant: "secondary" },
  view: { label: "Consulta", variant: "outline" },
  error: { label: "Error", variant: "destructive" },
};

const MODULE_LABELS: Record<string, string> = {
  recetas: "Recetas",
  productos: "Productos",
  auth: "Autenticación",
  configuracion: "Configuración",
  categorias: "Categorías",
  unidades: "Unidades",
  subscription: "Suscripción",
  system: "Sistema",
};

export const ActivityLogsTable = ({ logs, title, emptyMessage }: ActivityLogsTableProps) => {
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
    const info = ACTION_LABELS[action] || { label: action, variant: "secondary" as const };
    return <Badge variant={info.variant} className="text-xs">{info.label}</Badge>;
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
          {title || `Registro de Actividades (${logs.length} registros totales)`}
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
            className="flex h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
            className="flex h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
          <p className="text-center text-muted-foreground py-8">
            {emptyMessage || "No se encontraron registros de actividad."}
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
                      <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell className="text-sm font-medium max-w-[180px] truncate">
                        {log.email || (
                          <span className="text-muted-foreground text-xs font-mono">
                            {log.user_id?.slice(0, 8)}…
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{getModuleBadge(log.module)}</TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="text-sm max-w-[240px] truncate" title={log.description}>
                        {log.description || "—"}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {log.ip_address || "—"}
                      </TableCell>
                      <TableCell
                        className="text-xs text-muted-foreground max-w-[160px] truncate"
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
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
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
