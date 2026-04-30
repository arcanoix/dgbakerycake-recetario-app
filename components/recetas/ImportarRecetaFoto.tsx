"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Producto, MaterialReceta } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Camera, Upload, Loader2, AlertTriangle, CheckCircle2, X, ArrowRight, Lock } from "lucide-react";
import { generarId } from "@/lib/storageSupabase";
import type { RecetaExtraida } from "@/app/api/recetas/importar-foto/route";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MaterialResuelto {
  nombre: string;
  cantidad: number;
  unidad: string;
  productoEncontrado: Producto | null;
}

interface RecetaImportada {
  nombre: string;
  descripcion: string;
  categoria: string;
  materiales: MaterialReceta[];
}

interface ImportarRecetaFotoProps {
  /** List of products currently registered – used to match extracted ingredients */
  productos: Producto[];
  /** Whether the current user has the premium plan feature */
  tieneAcceso: boolean;
  /** Called when the user confirms the import with the resolved recipe data */
  onImportar: (receta: RecetaImportada) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Case-insensitive partial-match of an ingredient name against the product list */
function encontrarProducto(nombre: string, productos: Producto[]): Producto | null {
  const normalizado = nombre.trim().toLowerCase();
  return (
    productos.find((p) => p.nombre.toLowerCase() === normalizado) ||
    productos.find((p) =>
      p.nombre.toLowerCase().includes(normalizado) ||
      normalizado.includes(p.nombre.toLowerCase())
    ) ||
    null
  );
}

/** Build a MaterialReceta from an extracted material and a matched product */
function construirMaterial(
  materialExtraido: { nombre: string; cantidad: number; unidad: string },
  producto: Producto | null
): MaterialReceta {
  if (producto) {
    const costoMaterial = producto.precioPorUnidad * materialExtraido.cantidad;
    return {
      id: generarId("material"),
      productoId: producto.id,
      nombreProducto: producto.nombre,
      cantidadUtilizada: materialExtraido.cantidad,
      unidadMedida: producto.unidadMedida,
      unidadMedidaNombre: producto.unidadMedidaNombre,
      unidadMedidaSimbolo: producto.unidadMedidaSimbolo,
      costoUnitario: producto.precioPorUnidad,
      costoMaterial,
    };
  }

  // No matching product – add as a custom ingredient with 0 cost
  return {
    id: generarId("material"),
    productoId: "__OTRO__",
    nombreProducto: materialExtraido.nombre,
    cantidadUtilizada: materialExtraido.cantidad,
    unidadMedida: materialExtraido.unidad,
    unidadMedidaNombre: materialExtraido.unidad,
    unidadMedidaSimbolo: materialExtraido.unidad,
    costoUnitario: 0,
    costoMaterial: 0,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

type Paso = "idle" | "procesando" | "vista_previa" | "advertencia_productos";

export const ImportarRecetaFoto = ({
  productos,
  tieneAcceso,
  onImportar,
}: ImportarRecetaFotoProps) => {
  const [abierto, setAbierto] = useState(false);
  const [paso, setPaso] = useState<Paso>("idle");
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recetaExtraida, setRecetaExtraida] = useState<RecetaExtraida | null>(null);
  const [materialesResueltos, setMaterialesResueltos] = useState<MaterialResuelto[]>([]);
  const [arrastrandoFoto, setArrastrandoFoto] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const productosNoEncontrados = materialesResueltos.filter((m) => !m.productoEncontrado);

  // ── Reset ────────────────────────────────────────────────────────────────
  const resetearEstado = () => {
    setPaso("idle");
    setImagenPreview(null);
    setImagenFile(null);
    setError(null);
    setRecetaExtraida(null);
    setMaterialesResueltos([]);
    setArrastrandoFoto(false);
  };

  const cerrarDialog = () => {
    setAbierto(false);
    resetearEstado();
  };

  // ── Handle file selection ─────────────────────────────────────────────────
  const procesarArchivo = useCallback((file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Tipo de imagen no válido. Se aceptan: JPEG, PNG, WebP o GIF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("La imagen es demasiado grande. El tamaño máximo es 10 MB.");
      return;
    }
    setError(null);
    setImagenFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagenPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) procesarArchivo(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrandoFoto(false);
    const file = e.dataTransfer.files?.[0];
    if (file) procesarArchivo(file);
  };

  // ── Send image to AI ──────────────────────────────────────────────────────
  const analizarImagen = async () => {
    if (!imagenFile) return;

    setPaso("procesando");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("imagen", imagenFile);

      const res = await fetch("/api/recetas/importar-foto", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Error al procesar la imagen.");
        setPaso("idle");
        return;
      }

      const receta: RecetaExtraida = data.receta;
      setRecetaExtraida(receta);

      // Resolve ingredients against the product catalogue
      const resueltos: MaterialResuelto[] = receta.materiales.map((m) => ({
        nombre: m.nombre,
        cantidad: m.cantidad,
        unidad: m.unidad,
        productoEncontrado: encontrarProducto(m.nombre, productos),
      }));
      setMaterialesResueltos(resueltos);

      // If there are missing products, show the warning step first
      const hayFaltantes = resueltos.some((m) => !m.productoEncontrado);
      setPaso(hayFaltantes ? "advertencia_productos" : "vista_previa");
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
      setPaso("idle");
    }
  };

  // ── Confirm import ────────────────────────────────────────────────────────
  const confirmarImportacion = () => {
    if (!recetaExtraida) return;

    const materiales: MaterialReceta[] = materialesResueltos.map((m) =>
      construirMaterial(m, m.productoEncontrado)
    );

    onImportar({
      nombre: recetaExtraida.nombre,
      descripcion: recetaExtraida.descripcion,
      categoria: recetaExtraida.categoria ?? "",
      materiales,
    });

    cerrarDialog();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Trigger button */}
      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          if (!tieneAcceso) return;
          setAbierto(true);
        }}
        disabled={!tieneAcceso}
        title={tieneAcceso ? "Importar receta desde foto" : "Disponible en planes Profesional y Empresarial"}
        className="gap-2"
      >
        {tieneAcceso ? (
          <Camera className="w-4 h-4" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
        Importar desde foto
        {!tieneAcceso && (
          <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
            PRO
          </span>
        )}
      </Button>

      {/* Dialog */}
      <Dialog open={abierto} onOpenChange={(open) => { if (!open) cerrarDialog(); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" />
              Importar receta desde fotografía
            </DialogTitle>
            <DialogDescription>
              Sube una foto de tu receta y la IA extraerá los ingredientes y datos automáticamente.
            </DialogDescription>
          </DialogHeader>

          {/* ── PASO: idle / subir imagen ─────────────────────────────── */}
          {(paso === "idle" || paso === "procesando") && (
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setArrastrandoFoto(true); }}
                onDragLeave={() => setArrastrandoFoto(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
                  ${arrastrandoFoto ? "border-amber-400 bg-amber-50" : "border-gray-300 hover:border-amber-400 hover:bg-amber-50/30"}
                  ${paso === "procesando" ? "pointer-events-none opacity-60" : ""}
                `}
              >
                {imagenPreview ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagenPreview}
                      alt="Vista previa"
                      className="max-h-48 mx-auto rounded-lg object-contain"
                    />
                    {paso !== "procesando" && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setImagenPreview(null); setImagenFile(null); }}
                        className="absolute top-1 right-1 bg-white rounded-full shadow p-0.5 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                      <Upload className="w-7 h-7 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Arrastra tu foto aquí</p>
                      <p className="text-sm text-gray-500 mt-1">o haz clic para seleccionar</p>
                      <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP o GIF · máx. 10 MB</p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleInputChange}
              />

              {error && (
                <Card className="border-destructive">
                  <CardContent className="py-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </CardContent>
                </Card>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={cerrarDialog} disabled={paso === "procesando"}>
                  Cancelar
                </Button>
                <Button
                  onClick={analizarImagen}
                  disabled={!imagenFile || paso === "procesando"}
                  className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0"
                >
                  {paso === "procesando" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analizando con IA...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Analizar receta
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* ── PASO: advertencia de productos no encontrados ─────────── */}
          {paso === "advertencia_productos" && recetaExtraida && (
            <div className="space-y-4">
              <Card className="border-amber-300 bg-amber-50">
                <CardContent className="py-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-900">
                        {productosNoEncontrados.length === 1
                          ? "1 ingrediente no registrado"
                          : `${productosNoEncontrados.length} ingredientes no registrados`}
                      </p>
                      <p className="text-sm text-amber-800 mt-1">
                        Los siguientes ingredientes de la receta no existen en tu catálogo de productos.
                        Se recomienda registrarlos primero para calcular costos correctamente.
                      </p>
                    </div>
                  </div>

                  <ul className="ml-8 space-y-1">
                    {productosNoEncontrados.map((m, i) => (
                      <li key={i} className="text-sm text-amber-900 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                        <span className="font-medium">{m.nombre}</span>
                        <span className="text-amber-700">
                          ({m.cantidad} {m.unidad})
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <p className="text-sm text-gray-600">
                Puedes ir a <strong>Productos</strong> para registrarlos y luego volver a importar,
                o continuar y estos ingredientes se agregarán como ingredientes personalizados sin costo asociado.
              </p>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={cerrarDialog}
                  className="sm:mr-auto"
                >
                  Cancelar
                </Button>
                <Link href="/productos">
                  <Button variant="outline" className="gap-2 w-full sm:w-auto">
                    Ir a Productos
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>                <Button
                  onClick={() => setPaso("vista_previa")}
                  className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0"
                >
                  Continuar de todos modos
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* ── PASO: vista previa de la receta extraída ──────────────── */}
          {paso === "vista_previa" && recetaExtraida && (
            <div className="space-y-4">
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="py-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">Receta extraída correctamente</p>
                    <p className="text-sm text-green-800 mt-0.5">
                      Revisa los datos antes de importar. Podrás editarlos después.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recipe summary */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</p>
                  <p className="font-medium text-gray-900">{recetaExtraida.nombre}</p>
                </div>
                {recetaExtraida.descripcion && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Descripción</p>
                    <p className="text-sm text-gray-700">{recetaExtraida.descripcion}</p>
                  </div>
                )}
                {recetaExtraida.categoria && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</p>
                    <p className="text-sm text-gray-700">{recetaExtraida.categoria}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Ingredientes ({recetaExtraida.materiales.length})
                  </p>
                  <div className="space-y-1.5">
                    {materialesResueltos.map((m, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between text-sm px-3 py-2 rounded-lg border
                          ${m.productoEncontrado
                            ? "bg-white border-gray-200"
                            : "bg-amber-50 border-amber-200"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          {m.productoEncontrado ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          )}
                          <span className={m.productoEncontrado ? "text-gray-800" : "text-amber-800"}>
                            {m.nombre}
                          </span>
                          {!m.productoEncontrado && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                              sin costo
                            </span>
                          )}
                        </div>
                        <span className="text-gray-500 text-xs">
                          {m.cantidad} {m.unidad}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={cerrarDialog}>
                  Cancelar
                </Button>
                <Button
                  onClick={confirmarImportacion}
                  className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Importar receta
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
