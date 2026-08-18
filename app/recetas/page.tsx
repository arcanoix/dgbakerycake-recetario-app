"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Receta, MaterialReceta } from "@/types";
import { useRecetas } from "@/hooks/useRecetas";
import { useProductos } from "@/hooks/useProductos";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { useGastosFijos } from "@/hooks/useGastosFijos";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { MaterialSelector } from "@/components/recetas/MaterialSelector";
import { DesgloseCostos } from "@/components/recetas/DesgloseCostos";
import { RecetaList } from "@/components/recetas/RecetaList";
import { RecetaDetailModal } from "@/components/recetas/RecetaDetailModal";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { CATEGORIAS_RECETAS } from "@/lib/constants";
import { generarDesgloseCostos } from "@/lib/calculations";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  AlertCircle, 
  Lock, 
  ArrowRight, 
  Plus, 
  X, 
  Save, 
  ChefHat,
  Package,
  TrendingUp,
  RefreshCw,
  Search
} from "lucide-react";

export default function RecetasPage() {
  const router = useRouter();
  const { recetas, cargando, error, errorCarga: errorCargaRecetas, crearReceta, actualizarReceta, eliminar, agregarMaterial, cargarRecetas } = useRecetas();
  const { productos, errorCarga: errorCargaProductos, cargarProductos } = useProductos();
  const { configuracion } = useConfiguracion();
  const { totales } = useGastosFijos();
  const { getCurrentCount, getPlanDisplayName, getPlanName, cargando: cargandoPlan } = usePlanAccess();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [recetaEditando, setRecetaEditando] = useState<Receta | undefined>();
  const [recetaVisualizando, setRecetaVisualizando] = useState<Receta | null>(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cantidadHoras, setCantidadHoras] = useState(0);
  const [margenGanancia, setMargenGanancia] = useState(configuracion?.margenGananciaDefecto || 30);
  const [materiales, setMateriales] = useState<MaterialReceta[]>([]);
  const [guardando, setGuardando] = useState(false);

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
    if (guardando) return;

    setGuardando(true);
    const datos = {
      nombre,
      descripcion,
      categoria,
      cantidadHoras,
      margenGanancia,
    };

    const costoPorHora = configuracion?.costoPorHoraDefecto || 0;
    const totalGastosMensuales = totales.totalMontoMensual;
    const porcentajeGastosFijos = configuracion?.porcentajeGastosFijos || 0;

    try {
      let exito = false;
      if (recetaEditando) {
        exito = await actualizarReceta(recetaEditando.id, datos, materiales, costoPorHora, totalGastosMensuales, porcentajeGastosFijos);
      } else {
        exito = await crearReceta(datos, materiales, costoPorHora, totalGastosMensuales, porcentajeGastosFijos);
      }

      if (exito) {
        resetForm();
      }
    } finally {
      setGuardando(false);
    }
  };

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setCategoria("");
    setCantidadHoras(0);
    setMargenGanancia(configuracion?.margenGananciaDefecto || 30);
    setMateriales([]);
    setMostrarFormulario(false);
    setRecetaEditando(undefined);
  };

  const populateFormWithReceta = (receta: Receta) => {
    setNombre(receta.nombre);
    setDescripcion(receta.descripcion);
    setCategoria(receta.categoria || "");
    setCantidadHoras(receta.cantidadHoras || 0);
    setMargenGanancia(receta.margenGanancia || 0);
    setMateriales(receta.materiales);
  };

  const handleEdit = (receta: Receta) => {
    populateFormWithReceta(receta);
    setRecetaEditando(receta);
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicate = (receta: Receta) => {
    populateFormWithReceta(receta);
    setNombre(`Copia de ${receta.nombre}`);
    setRecetaEditando(undefined);
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleView = (receta: Receta) => {
    setRecetaVisualizando(receta);
    setModalDetalleAbierto(true);
  };

  const costoPorHora = configuracion?.costoPorHoraDefecto || 0;
  const totalGastosMensualesPreview = totales.totalMontoMensual;
  const porcentajeGastosFijosPreview = configuracion?.porcentajeGastosFijos || 0;
  const costoGastosFijosPreview = totalGastosMensualesPreview > 0 && porcentajeGastosFijosPreview > 0
    ? totalGastosMensualesPreview * (porcentajeGastosFijosPreview / 100)
    : 0;
  
  const desglose = materiales.length > 0 ? generarDesgloseCostos({
    id: "temp",
    nombre,
    descripcion,
    materiales,
    cantidadHoras,
    costoPorHora,
    costoManoObra: 0,
    costoGastosFijos: costoGastosFijosPreview,
    costoMateriales: 0,
    costoTotal: 0,
    margenGanancia,
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
  }) : null;

  if (cargando || cargandoPlan) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Cargando recetas...</p>
      </div>
    );
  }

  const hayProductos = productos.length > 0;
  const limitInfo = getCurrentCount('recetas', recetas.length);
  const canCreate = limitInfo.canCreate;
  const isLimited = getPlanName() === 'free' || getPlanName() === 'basico';

  const handleNuevo = () => {
    if (!canCreate && !mostrarFormulario) {
      router.push('/pricing');
      return;
    }
    if (mostrarFormulario) {
      resetForm();
    } else {
      setMostrarFormulario(true);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex-1 space-y-6">
        {/* Header con estética shadcn-admin */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Recetario Maestro
            </h2>
            <p className="text-sm text-muted-foreground">
              Gestiona tus recetas y calcula costos de producción en tiempo real
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleNuevo}
              size="sm"
              variant={mostrarFormulario ? "outline" : "default"}
              disabled={!hayProductos && !mostrarFormulario}
              className={`gap-2 h-10 px-4 ${!mostrarFormulario && canCreate ? 'bg-primary shadow-sm' : ''}`}
            >
              {mostrarFormulario ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{mostrarFormulario ? "Cancelar" : "+ Nueva Receta"}</span>
            </Button>
          </div>
        </div>

        {/* Alerta de Límite de Plan */}
        {!mostrarFormulario && isLimited && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-amber-200 bg-amber-50/50 shadow-none">
              <CardContent className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-100">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900 text-sm">
                      Plan: {getPlanDisplayName()} - Límite de {limitInfo.limit} recetas
                    </p>
                    <p className="text-xs text-amber-700">
                      Has usado {recetas.length} de {limitInfo.limit} recetas ({limitInfo.remaining} restantes)
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/pricing')}
                  className="gap-2 border-amber-200 bg-white text-amber-900 hover:bg-amber-100"
                >
                  Mejorar plan
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!hayProductos && !errorCargaProductos && (
          <Card className="border-amber-200 bg-amber-50/50 shadow-none">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="p-4 rounded-2xl bg-amber-100 text-amber-600">
                  <Package className="w-10 h-10" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-amber-900">No hay productos registrados</h3>
                  <p className="text-amber-800 text-sm max-w-2xl">
                    Para poder crear recetas, primero debes registrar al menos un producto en tu inventario.
                    Los productos son los ingredientes o materiales que utilizarás en tus recetas.
                  </p>
                  <Button variant="default" className="bg-amber-600 hover:bg-amber-700 mt-2" onClick={() => router.push('/productos')}>
                    <Package className="w-4 h-4 mr-2" />
                    Ir a Productos e Insumos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <AnimatePresence mode="wait">
          {mostrarFormulario && hayProductos ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div className="space-y-6">
                <Card className="border-0 shadow-lg bg-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <ChefHat className="w-5 h-5 text-primary" />
                      {recetaEditando ? "Editar" : "Crear Nueva"} Receta
                    </CardTitle>
                    <CardDescription>Completa la información básica de tu receta.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre de la Receta *</Label>
                        <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Ej: Torta de Chocolate de la Casa" className="h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="descripcion" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descripción o Instrucciones *</Label>
                        <Textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required placeholder="Describe brevemente la receta o añade pasos importantes..." className="min-h-[100px] resize-none" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="categoria" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoría</Label>
                          <select 
                            id="categoria" 
                            value={categoria} 
                            onChange={(e) => setCategoria(e.target.value)}
                            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Seleccionar</option>
                            {CATEGORIAS_RECETAS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cantidadHoras" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Horas Mano Obra</Label>
                          <div className="relative">
                            <Input id="cantidadHoras" type="number" step="0.5" min="0" value={cantidadHoras} onChange={(e) => setCantidadHoras(parseFloat(e.target.value) || 0)} className="h-11 pr-8" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">h</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="margen" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Margen de Ganancia (%)</Label>
                          <div className="relative">
                            <Input id="margen" type="number" step="0.01" value={margenGanancia} onChange={(e) => setMargenGanancia(parseFloat(e.target.value) || 0)} className="h-11 pr-8" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">%</span>
                          </div>
                        </div>
                      </div>
                      <Button type="submit" className="w-full h-11 font-bold shadow-md bg-primary" disabled={guardando || materiales.length === 0}>
                        {guardando ? (
                          <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
                        ) : (
                          <><Save className="w-4 h-4 mr-2" /> {recetaEditando ? "Actualizar" : "Crear"} Receta</>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                <MaterialSelector
                  productos={productos}
                  materiales={materiales}
                  disabled={guardando}
                  onAgregarMaterial={handleAgregarMaterial}
                  onEliminarMaterial={handleEliminarMaterial}
                />
              </div>
              <div className="lg:sticky lg:top-24 h-fit">
                {desglose ? (
                  <DesgloseCostos desglose={desglose} />
                ) : (
                  <Card className="border-dashed border-2 bg-muted/20">
                    <CardContent className="py-20 text-center space-y-4">
                      <div className="p-4 rounded-full bg-muted w-fit mx-auto">
                        <TrendingUp className="w-10 h-10 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground font-medium max-w-[200px] mx-auto">Añade ingredientes para ver el desglose de costos en tiempo real.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Buscador y Estadísticas */}
              {!cargando && recetas.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div className="md:col-span-2 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Buscar por nombre de receta..." 
                        value={terminoBusqueda} 
                        onChange={(e) => setTerminoBusqueda(e.target.value)} 
                        className="pl-10 h-11 bg-card border-none shadow-sm" 
                      />
                   </div>
                   <Card className="border-0 shadow-sm bg-muted/30 h-11 flex items-center justify-center">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-2">Total Recetas:</p>
                      <p className="text-lg font-black">{recetas.length}</p>
                   </Card>
                   <Card className="border-0 shadow-sm bg-muted/30 h-11 flex items-center justify-center">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-2">Con Margen:</p>
                      <p className="text-lg font-black text-emerald-600">{recetas.filter(r => (r.margenGanancia || 0) > 0).length}</p>
                   </Card>
                </div>
              )}

              {(!errorCargaRecetas || recetas.length > 0) && (
                <RecetaList 
                  recetas={recetasFiltradas} 
                  onEdit={handleEdit}
                  onView={handleView}
                  onDuplicate={handleDuplicate} 
                  onDelete={async (id: string) => {
                    await eliminar(id);
                  }} 
                />
              )}

              {/* Modal de Detalles */}
              <RecetaDetailModal 
                receta={recetaVisualizando}
                open={modalDetalleAbierto}
                onOpenChange={setModalDetalleAbierto}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
