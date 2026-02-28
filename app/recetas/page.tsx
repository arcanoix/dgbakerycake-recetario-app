"use client";

import { useState } from "react";
import { Receta, MaterialReceta } from "@/types";
import { useRecetas } from "@/hooks/useRecetas";
import { useProductos } from "@/hooks/useProductos";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { RecetaList } from "@/components/recetas/RecetaList";
import { MaterialSelector } from "@/components/recetas/MaterialSelector";
import { DesgloseCostos } from "@/components/recetas/DesgloseCostos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIAS_RECETAS } from "@/lib/constants";
import { generarDesgloseCostos } from "@/lib/calculations";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function RecetasPageContent() {
  const { recetas, cargando, error, crearReceta, actualizarReceta, eliminar, agregarMaterial } = useRecetas();
  const { productos } = useProductos();
  const { configuracion } = useConfiguracion();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [recetaEditando, setRecetaEditando] = useState<Receta | undefined>();
  const [terminoBusqueda, setTerminoBusqueda] = useState("");

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tiempoPreparacion, setTiempoPreparacion] = useState(60);
  const [costoPorHora, setCostoPorHora] = useState(configuracion?.costoPorHoraDefecto || 10);
  const [margenGanancia, setMargenGanancia] = useState(configuracion?.margenGananciaDefecto || 30);
  const [materiales, setMateriales] = useState<MaterialReceta[]>([]);

  const recetasFiltradas = terminoBusqueda
    ? recetas.filter(r => r.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()))
    : recetas;

  const handleAgregarMaterial = async (productoId: string, cantidad: number) => {
    const material = await agregarMaterial(productoId, cantidad);
    if (material) {
      setMateriales([...materiales, material]);
    }
  };

  const handleEliminarMaterial = (materialId: string) => {
    setMateriales(materiales.filter(m => m.id !== materialId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const datos = {
      nombre,
      descripcion,
      categoria,
      tiempoPreparacion,
      costoPorHora,
      margenGanancia,
    };

    let exito = false;
    if (recetaEditando) {
      exito = await actualizarReceta(recetaEditando.id, datos, materiales);
    } else {
      exito = await crearReceta(datos, materiales);
    }

    if (exito) {
      resetForm();
    }
  };

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setCategoria("");
    setTiempoPreparacion(60);
    setCostoPorHora(configuracion?.costoPorHoraDefecto || 10);
    setMargenGanancia(configuracion?.margenGananciaDefecto || 30);
    setMateriales([]);
    setMostrarFormulario(false);
    setRecetaEditando(undefined);
  };

  const handleEdit = (receta: Receta) => {
    setRecetaEditando(receta);
    setNombre(receta.nombre);
    setDescripcion(receta.descripcion);
    setCategoria(receta.categoria || "");
    setTiempoPreparacion(receta.tiempoPreparacion);
    setCostoPorHora(receta.costoPorHora);
    setMargenGanancia(receta.margenGanancia || 0);
    setMateriales(receta.materiales);
    setMostrarFormulario(true);
  };

  const desglose = materiales.length > 0 ? generarDesgloseCostos({
    id: "temp",
    nombre,
    descripcion,
    materiales,
    tiempoPreparacion,
    costoPorHora,
    costoManoObra: 0,
    costoMateriales: 0,
    costoTotal: 0,
    margenGanancia,
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
  }) : null;

  if (cargando) return <div className="container mx-auto p-6">Cargando...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recetas</h1>
          <p className="text-muted-foreground">Gestiona tus recetas y calcula costos</p>
        </div>
        <Button onClick={() => setMostrarFormulario(!mostrarFormulario)} size="lg">
          {mostrarFormulario ? "Cancelar" : "+ Nueva Receta"}
        </Button>
      </div>

      {error && <Card className="border-destructive"><CardContent className="py-4"><p className="text-destructive">{error}</p></CardContent></Card>}

      {mostrarFormulario ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>{recetaEditando ? "Editar" : "Nueva"} Receta</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción *</Label>
                    <Textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoría</Label>
                      <Select id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                        <option value="">Seleccionar</option>
                        {CATEGORIAS_RECETAS.map(c => <option key={c} value={c}>{c}</option>)}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tiempo">Tiempo (min) *</Label>
                      <Input id="tiempo" type="number" value={tiempoPreparacion} onChange={(e) => setTiempoPreparacion(parseInt(e.target.value))} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="costoHora">Costo/Hora *</Label>
                      <Input id="costoHora" type="number" step="0.01" value={costoPorHora} onChange={(e) => setCostoPorHora(parseFloat(e.target.value))} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="margen">Margen (%)</Label>
                      <Input id="margen" type="number" step="0.01" value={margenGanancia} onChange={(e) => setMargenGanancia(parseFloat(e.target.value))} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={materiales.length === 0}>
                    {recetaEditando ? "Actualizar" : "Crear"} Receta
                  </Button>
                </form>
              </CardContent>
            </Card>
            <MaterialSelector
              productos={productos}
              materiales={materiales}
              onAgregarMaterial={handleAgregarMaterial}
              onEliminarMaterial={handleEliminarMaterial}
            />
          </div>
          <div>
            {desglose && <DesgloseCostos desglose={desglose} />}
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-4">
            <Input placeholder="Buscar recetas..." value={terminoBusqueda} onChange={(e) => setTerminoBusqueda(e.target.value)} className="max-w-md" />
          </div>
          <RecetaList recetas={recetasFiltradas} onEdit={handleEdit} onDelete={eliminar} />
        </>
      )}
    </div>
  );
}
