"use client";

import { useState } from "react";
import { GastoFijo, TotalesGastosFijos } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GastosFijosTableProps {
  gastosFijos: GastoFijo[];
  totales: TotalesGastosFijos;
  onEditar: (gastoFijo: GastoFijo) => void;
  onEliminar: (id: string) => void;
  moneda: string;
}

export const GastosFijosTable = ({
  gastosFijos,
  totales,
  onEditar,
  onEliminar,
  moneda = "USD",
}: GastosFijosTableProps) => {
  const [gastoAEliminar, setGastoAEliminar] = useState<string | null>(null);

  const handleEliminar = () => {
    if (gastoAEliminar) {
      onEliminar(gastoAEliminar);
      setGastoAEliminar(null);
    }
  };

  const formatearNumero = (valor: number) => {
    return valor.toFixed(2);
  };

  const formatearPorcentaje = (valor: number) => {
    return valor.toFixed(2);
  };

  if (gastosFijos.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-2xl border-2 border-dashed">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">No hay gastos fijos registrados</p>
            <p className="text-xs text-muted-foreground">
              Los gastos fijos por defecto se crearán automáticamente
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-black text-xs uppercase tracking-wider">Nombre</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-wider text-right">
                Monto Mensual
              </TableHead>
              <TableHead className="font-black text-xs uppercase tracking-wider text-right">
                Unidades Estimadas
              </TableHead>
              <TableHead className="font-black text-xs uppercase tracking-wider text-right">
                Costo Asignado
              </TableHead>
              <TableHead className="font-black text-xs uppercase tracking-wider text-right">
                % Distribución
              </TableHead>
              <TableHead className="font-black text-xs uppercase tracking-wider text-center w-[120px]">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gastosFijos.map((gasto, index) => {
              const porcentajeDistribucion = totales.totalCostoAsignado > 0 
                ? (gasto.costoAsignado / totales.totalCostoAsignado) * 100 
                : 0;
              
              return (
                <motion.tr
                  key={gasto.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-bold text-sm">{gasto.nombre}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {moneda} {formatearNumero(gasto.montoMensual)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatearNumero(gasto.unidadesEstimadas)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-bold text-primary">
                    {moneda} {formatearNumero(gasto.costoAsignado)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatearPorcentaje(porcentajeDistribucion)}%
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditar(gasto)}
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setGastoAEliminar(gasto.id)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-primary/5 hover:bg-primary/5 border-t-2 border-primary/20">
              <TableCell className="font-black text-sm uppercase">TOTALES</TableCell>
              <TableCell className="text-right font-mono text-base font-black text-primary">
                {moneda} {formatearNumero(totales.totalMontoMensual)}
              </TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right font-mono text-base font-black text-primary">
                {moneda} {formatearNumero(totales.totalCostoAsignado)}
              </TableCell>
              <TableCell className="text-right font-mono text-sm font-bold">100.00%</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <AlertDialog open={!!gastoAEliminar} onOpenChange={() => setGastoAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente este gasto fijo. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
