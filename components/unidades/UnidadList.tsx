"use client";

import { useState } from "react";
import { UnidadMedidaAdmin } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { getUnidadColumns } from "./unidades-columns";
import { motion } from "framer-motion";
import { Scale } from "lucide-react";

interface UnidadListProps {
  unidades: UnidadMedidaAdmin[];
  onEdit: (unidad: UnidadMedidaAdmin) => void;
  onDelete: (id: string) => Promise<boolean>;
  onToggleEstado: (unidad: UnidadMedidaAdmin) => Promise<boolean>;
}

export const UnidadList = ({ unidades, onEdit, onDelete, onToggleEstado }: UnidadListProps) => {
  const [accionEnCursoId, setAccionEnCursoId] = useState<string | null>(null);

  const columns = getUnidadColumns({
    onEdit,
    onDelete: (id) => {
      setAccionEnCursoId(id);
      Promise.resolve(onDelete(id)).finally(() => setAccionEnCursoId(null));
    },
    onToggleStatus: (unidad) => {
      setAccionEnCursoId(unidad.id);
      Promise.resolve(onToggleEstado(unidad)).finally(() => setAccionEnCursoId(null));
    }
  });

  if (unidades.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl bg-muted/20"
      >
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
          <Scale className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">No hay unidades de medida</h3>
        <p className="text-muted-foreground max-w-md leading-relaxed">
          Comienza creando tu primera unidad para gestionar las presentaciones de tus insumos.
        </p>
      </motion.div>
    );
  }

  return (
    <DataTable 
      columns={columns} 
      data={unidades} 
      searchKey="nombre"
      placeholder="Filtrar por nombre..."
    />
  );
};
