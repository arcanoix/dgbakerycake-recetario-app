"use client";

import { useState } from "react";
import { Orden, EstadoOrden } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  FileText, 
  Calendar, 
  Edit2, 
  Trash2, 
  Download, 
  MessageCircle,
  LayoutGrid,
  Table as TableIcon,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DataTable } from "@/components/ui/data-table";
import { getOrdenColumns } from "./orden-columns";
import { formatearUSD } from "@/lib/currency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ESTADO_VARIANTS: Record<EstadoOrden, "default" | "secondary" | "destructive" | "outline" | "blue"> = {
  cotizacion: "outline",
  confirmada: "default",
  entregada: "secondary",
  cancelada: "destructive",
};

const ESTADO_LABELS: Record<EstadoOrden, string> = {
  cotizacion: "Cotización",
  confirmada: "Confirmada",
  entregada: "Entregada",
  cancelada: "Cancelada",
};

const ESTADO_ICONS: Record<EstadoOrden, any> = {
  cotizacion: Clock,
  confirmada: FileText,
  entregada: CheckCircle2,
  cancelada: XCircle,
};

interface OrdenListProps {
  ordenes: Orden[];
  cargando: boolean;
  onEditar: (orden: Orden) => void;
  onEliminar: (id: string) => void;
  onCambiarEstado: (id: string, estado: EstadoOrden) => void;
  onExportarPDF?: (orden: Orden) => void;
  puedeExportarPDF?: boolean;
  onCompartirWhatsApp?: (orden: Orden) => void;
}

export const OrdenList = ({
  ordenes,
  cargando,
  onEditar,
  onEliminar,
  onCambiarEstado,
  onExportarPDF,
  puedeExportarPDF,
  onCompartirWhatsApp,
}: OrdenListProps) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [accionEnCursoId, setAccionEnCursoId] = useState<string | null>(null);

  const columns = getOrdenColumns({
    onEdit: onEditar,
    onDelete: (id) => {
      setAccionEnCursoId(id);
      Promise.resolve(onEliminar(id)).finally(() => setAccionEnCursoId(null));
    },
    onExportPDF: onExportarPDF || (() => {}),
    onWhatsApp: onCompartirWhatsApp || (() => {}),
    onCambiarEstado: (id, estado) => {
      setAccionEnCursoId(id);
      Promise.resolve(onCambiarEstado(id, estado)).finally(() => setAccionEnCursoId(null));
    }
  });

  if (cargando && ordenes.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Cargando órdenes...</p>
      </div>
    );
  }

  if (ordenes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed rounded-3xl bg-muted/20"
      >
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">Sin órdenes registradas</h3>
        <p className="text-muted-foreground max-w-md leading-relaxed">
          Crea tu primera cotización u orden para comenzar a gestionar tus ventas y entregas.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">
          Mostrando <span className="text-foreground font-bold">{ordenes.length}</span> órdenes
        </p>
        <div className="flex bg-muted p-1 rounded-lg border">
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className={viewMode === 'table' ? 'shadow-sm' : ''}
          >
            <TableIcon className="w-4 h-4 mr-2" />
            Tabla
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'shadow-sm' : ''}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Cuadrícula
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <DataTable 
              columns={columns} 
              data={ordenes} 
              searchKey="numeroOrden"
              placeholder="Buscar por N° de orden..."
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {ordenes.map((orden, index) => {
              const EstadoIcon = ESTADO_ICONS[orden.estado];
              const finalizada = orden.estado === "entregada" || orden.estado === "cancelada";

              return (
                <Card key={orden.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-md bg-card">
                  <CardHeader className="pb-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-bold truncate flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <span className="truncate font-mono group-hover:text-primary transition-colors">{orden.numeroOrden}</span>
                        </CardTitle>
                        <CardDescription className="truncate mt-1 font-medium">
                          {orden.clienteNombre || "Cliente desconocido"}
                        </CardDescription>
                      </div>
                      <Badge variant={ESTADO_VARIANTS[orden.estado] as any} className="font-bold uppercase tracking-wider text-[10px] h-6">
                        <EstadoIcon className="w-3 h-3 mr-1" />
                        {ESTADO_LABELS[orden.estado]}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="bg-muted/30 rounded-xl p-4 space-y-3 border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          Total Orden
                        </span>
                        <span className="text-xl font-black text-foreground">
                          {formatearUSD(orden.total)}
                        </span>
                      </div>

                      {orden.saldoPendiente > 0 && (
                        <>
                          <div className="h-px bg-border/50" />
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-orange-600">Saldo Pendiente</span>
                            <span className="text-sm font-black text-orange-600">
                              {formatearUSD(orden.saldoPendiente)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {orden.fechaEntrega && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          Entrega: {new Date(orden.fechaEntrega).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Creada: {new Date(orden.fechaCreacion || "").toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 font-bold text-[10px] h-9"
                        onClick={() => onEditar(orden)}
                        disabled={finalizada || accionEnCursoId === orden.id}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        EDITAR
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-9 px-2 hover:bg-muted">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                           <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                           {puedeExportarPDF && onExportarPDF && (
                             <DropdownMenuItem onClick={() => onExportarPDF(orden)}>
                               <Download className="mr-2 h-4 w-4" /> Exportar PDF
                             </DropdownMenuItem>
                           )}
                           {onCompartirWhatsApp && (
                             <DropdownMenuItem className="text-green-600" onClick={() => onCompartirWhatsApp(orden)}>
                               <MessageCircle className="mr-2 h-4 w-4" /> Enviar WhatsApp
                             </DropdownMenuItem>
                           )}
                           <DropdownMenuSeparator />
                           <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground">Estado</DropdownMenuLabel>
                           {Object.entries(ESTADO_LABELS).map(([key, label]) => (
                             <DropdownMenuItem 
                              key={key} 
                              onClick={() => onCambiarEstado(orden.id, key as EstadoOrden)}
                              disabled={orden.estado === key}
                             >
                               {label}
                             </DropdownMenuItem>
                           ))}
                           <DropdownMenuSeparator />
                           <DropdownMenuItem 
                            className="text-destructive focus:text-destructive" 
                            onClick={() => onEliminar(orden.id)}
                            disabled={finalizada}
                           >
                             <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
