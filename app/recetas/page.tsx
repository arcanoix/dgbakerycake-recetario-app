"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Receta, MaterialReceta } from "@/types";
import { useRecetas } from "@/hooks/useRecetas";
import { useProductos } from "@/hooks/useProductos";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { usePlanAccess } from "@/hooks/usePlanAccess";
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
import { Loading } from "@/components/ui/loading";
import { CATEGORIAS_RECETAS } from "@/lib/constants";
import { generarDesgloseCostos } from "@/lib/calculations";
import { motion } from "motion/react";
import { BookOpen, AlertCircle, Lock, ArrowRight } from "lucide-react";

export default function RecetasPage() {
  const router = useRouter();
  const { recetas, cargando, error, errorCarga: errorCargaRecetas, crearReceta, actualizarReceta, eliminar, agregarMaterial, cargarRecetas } = useRecetas();
  const { productos, errorCarga: errorCargaProductos, cargarProductos } = useProductos();
  const { configuracion } = useConfiguracion();
  const { getCurrentCount, getPlanDisplayName, getPlanName, cargando: cargandoPlan } = usePlanAccess();

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

  const handleAgregarMaterial = async (productoId: string, cantidad: number, unidadId: string, otroNombre?: string, otroPrecio?: number) => {
    const material = await agregarMaterial(productoId, cantidad, unidadId, otroNombre, otroPrecio);
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

  if (cargando || cargandoPlan) return <Loading text="Cargando recetas..." />;

  const hayProductos = productos.length > 0;
  const limitInfo = getCurrentCount('recetas', recetas.length);
  const canCreate = limitInfo.canCreate && getPlanName() !== 'free';
  const isLimited = getPlanName() === 'free' || getPlanName() === 'basico';

  const handleNuevo = () => {
    if (!canCreate) {
      router.push('/pricing');
      return;
    }
    setMostrarFormulario(!mostrarFormulario);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            Recetas
          </h1>
          <p className="text-gray-700 mt-1">Gestiona tus recetas y calcula costos</p>
        </div>
        <Button 
          onClick={handleNuevo}
          size="lg"
          disabled={!hayProductos && !mostrarFormulario}
          className={`gap-2 ${canCreate ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0' : ''}`}
        >
          {!canCreate && <Lock className="w-4 h-4" />}
          {mostrarFormulario ? "Cancelar" : "+ Nueva Receta"}
        </Button>
      </motion.div>

      {isLimited && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-medium text-amber-900">
                    Plan: {getPlanDisplayName()} - Límite de {limitInfo.limit} recetas
                  </p>
                  <p className="text-sm text-amber-700">
                    Has usado {recetas.length} de {limitInfo.limit} recetas ({limitInfo.remaining} restantes)
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => router.push('/pricing')}
                className="gap-2"
              >
                Actualizar plan
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!hayProductos && !errorCargaProductos && (
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

      {!cargando && errorCargaProductos && productos.length === 0 && (
        <Card className="border-amber-200 bg-amber-50/70">
          <CardContent className="py-4 space-y-3">
            <p className="font-semibold text-amber-900">No pudimos cargar los productos</p>
            <p className="text-amber-800 text-sm">{errorCargaProductos}</p>
            <Button variant="outline" onClick={() => cargarProductos()} className="border-amber-300 text-amber-900 hover:bg-amber-100">
              Reintentar carga
            </Button>
          </CardContent>
        </Card>
      )}

      {!cargando && errorCargaRecetas && recetas.length === 0 && (
        <Card className="border-amber-200 bg-amber-50/70">
          <CardContent className="py-4 space-y-3">
            <p className="font-semibold text-amber-900">No pudimos cargar las recetas</p>
            <p className="text-amber-800 text-sm">{errorCargaRecetas}</p>
            <Button variant="outline" onClick={() => cargarRecetas()} className="border-amber-300 text-amber-900 hover:bg-amber-100">
              Reintentar carga
            </Button>
          </CardContent>
        </Card>
      )}

      {error && <Card className="border-destructive"><CardContent className="py-4"><p className="text-destructive">{error}</p></CardContent></Card>}

      {(!errorCargaRecetas || recetas.length > 0) && (mostrarFormulario && hayProductos ? (
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
          {(!errorCargaRecetas || recetas.length > 0) && (
            <RecetaList recetas={recetasFiltradas} onEdit={handleEdit} onDelete={async (id: string) => {
              await eliminar(id);
            }} />
          )}
        </>
      ))}
      </div>
    </ProtectedRoute>
  );
}
