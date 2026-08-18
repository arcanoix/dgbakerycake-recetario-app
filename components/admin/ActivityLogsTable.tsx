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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, Copy, Check } from "lucide-react";

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
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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
                    <TableHead className="text-right">Acciones</TableHead>
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
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                              className="h-8 gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="hidden sm:inline">Ver detalle</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                Detalle del Log
                                {getActionBadge(log.action)}
                              </DialogTitle>
                              <DialogDescription>
                                Información completa del registro de actividad
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 mt-4">
                              {/* Fecha y hora */}
                              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
                                <div className="col-span-3">
                                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Fecha y hora
                                  </label>
                                  <p className="text-sm font-mono mt-1">
                                    {formatDate(log.created_at)}
                                  </p>
                                </div>
                              </div>

                              {/* Usuario e IP */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg border">
                                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Usuario
                                  </label>
                                  <p className="text-sm font-medium mt-1 break-all">
                                    {log.email || (
                                      <span className="text-muted-foreground font-mono text-xs">
                                        {log.user_id}
                                      </span>
                                    )}
                                  </p>
                                </div>
                                <div className="p-4 rounded-lg border">
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                      Dirección IP
                                    </label>
                                    {log.ip_address && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(log.ip_address!, 'ip')}
                                      >
                                        {copiedField === 'ip' ? (
                                          <Check className="h-3 w-3 text-green-600" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                  <p className="text-sm font-mono mt-1">
                                    {log.ip_address || "—"}
                                  </p>
                                </div>
                              </div>

                              {/* Módulo y Acción */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg border">
                                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Módulo
                                  </label>
                                  <div className="mt-2">
                                    {getModuleBadge(log.module)}
                                  </div>
                                </div>
                                <div className="p-4 rounded-lg border">
                                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Acción
                                  </label>
                                  <div className="mt-2">
                                    {getActionBadge(log.action)}
                                  </div>
                                </div>
                              </div>

                              {/* Descripción */}
                              <div className="p-4 rounded-lg border">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                  Descripción
                                </label>
                                <p className="text-sm mt-2 whitespace-pre-wrap break-words">
                                  {log.description || "Sin descripción"}
                                </p>
                              </div>

                              {/* Entidad */}
                              {log.entity_name && (
                                <div className="p-4 rounded-lg border">
                                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Entidad afectada
                                  </label>
                                  <p className="text-sm font-medium mt-2">
                                    {log.entity_name}
                                  </p>
                                  {log.entity_id && (
                                    <p className="text-xs text-muted-foreground font-mono mt-1">
                                      ID: {log.entity_id}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* User Agent */}
                              <div className="p-4 rounded-lg border">
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Navegador / User Agent
                                  </label>
                                  {log.user_agent && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => copyToClipboard(log.user_agent!, 'ua')}
                                    >
                                      {copiedField === 'ua' ? (
                                        <Check className="h-3 w-3 text-green-600" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                  )}
                                </div>
                                <p className="text-xs font-mono mt-2 break-all text-muted-foreground">
                                  {log.user_agent || "—"}
                                </p>
                              </div>

                            </div>
                          </DialogContent>
                        </Dialog>
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
