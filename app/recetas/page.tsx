"use client";

import { useState } from "react";
import { Receta, MaterialReceta } from "@/types";
import { useRecetas } from "@/hooks/useRecetas";
import { useProductos } from "@/hooks/useProductos";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { MaterialSelector } from "@/components/recetas/MaterialSelector";
import { DesgloseCostos } from "@/components/recetas/DesgloseCostos";
import { RecetaList } from "@/components/recetas/RecetaList";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIAS_RECETAS } from "@/lib/constants";
import { generarDesgloseCostos } from "@/lib/calculations";

export default function RecetasPage() {
  const { recetas, cargando, error, crearReceta, actualizarReceta, eliminar, agregarMaterial } = useRecetas();
  const { productos } = useProductos();
  const { configuracion } = useConfiguracion();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [recetaEditando, setRecetaEditando] = useState<Receta | undefined>();
  const [terminoBusqueda, setTerminoBusqueda] = useState("");

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
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
    setMargenGanancia(receta.margenGanancia || 0);
    setMateriales(receta.materiales);
    setMostrarFormulario(true);
  };

  const desglose = materiales.length > 0 ? generarDesgloseCostos({
    id: "temp",
    nombre,
    descripcion,
    materiales,
    tiempoPreparacion: 0,
    costoPorHora: 0,
    costoManoObra: 0,
    costoMateriales: 0,
    costoTotal: 0,
    margenGanancia,
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
  }) : null;

  if (cargando) return <div className="container mx-auto p-6">Cargando...</div>;

  // Validar que existan productos antes de permitir crear recetas
  const hayProductos = productos.length > 0;

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recetas</h1>
          <p className="text-muted-foreground">Gestiona tus recetas y calcula costos</p>
        </div>
        <Button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)} 
          size="lg"
          disabled={!hayProductos && !mostrarFormulario}
        >
          {mostrarFormulario ? "Cancelar" : "+ Nueva Receta"}
        </Button>
      </div>

      {!hayProductos && (
        <Card className="border-amber-500 bg-amber-50">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⚠️</div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 mb-2">No hay productos registrados</h3>
                <p className="text-amber-800 mb-4">
                  Para poder crear recetas, primero debes registrar al menos un producto en tu inventario.
                  Los productos son los ingredientes o materiales que utilizarás en tus recetas.
                </p>
                <a href="/productos">
                  <Button variant="default" className="bg-amber-600 hover:bg-amber-700">
                    <span className="mr-2">📦</span>
                    Ir a Productos
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && <Card className="border-destructive"><CardContent className="py-4"><p className="text-destructive">{error}</p></CardContent></Card>}

      {mostrarFormulario && hayProductos ? (
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
          <RecetaList recetas={recetasFiltradas} onEdit={handleEdit} onDelete={async (id: string) => {
            await eliminar(id);
          }} />
        </>
      )}
      </div>
    </ProtectedRoute>
  );
}
