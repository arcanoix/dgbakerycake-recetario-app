"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Loader2,
  Package,
} from "lucide-react";
import { parsearArchivoProductos, descargarPlantillaCSV, ResultadoImportacion } from "@/lib/importarProductos";
import { ProductoFormData } from "@/types";
import { useUnidades } from "@/hooks/useUnidades";

interface ImportarProductosModalProps {
  onImportar: (productos: ProductoFormData[]) => Promise<{ importados: number; errores: number; omitidos: number; mensaje: string }>;
  onCerrar: () => void;
  canCreate: boolean;
}

type Estado = 'upload' | 'preview' | 'importando' | 'resultado';

export const ImportarProductosModal = ({
  onImportar,
  onCerrar,
  canCreate,
}: ImportarProductosModalProps) => {
  const { unidades, obtenerUnidadesActivas } = useUnidades();
  const unidadesActivas = obtenerUnidadesActivas();

  const inputRef = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<Estado>('upload');
  const [arrastre, setArrastre] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [parseoResultado, setParseoResultado] = useState<ResultadoImportacion | null>(null);
  const [parseoError, setParseoError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ importados: number; errores: number; omitidos: number; mensaje: string } | null>(null);
  const [parsando, setParsando] = useState(false);

  const procesarArchivo = async (file: File) => {
    setParsando(true);
    setParseoError(null);
    setArchivoSeleccionado(file);
    try {
      const res = await parsearArchivoProductos(file, unidadesActivas);
      setParseoResultado(res);
      setEstado('preview');
    } catch (err) {
      setParseoError(err instanceof Error ? err.message : 'Error al leer el archivo');
      setParseoResultado(null);
    } finally {
      setParsando(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) procesarArchivo(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setArrastre(false);
    const file = e.dataTransfer.files?.[0];
    if (file) procesarArchivo(file);
  };

  const handleConfirmarImport = async () => {
    if (!parseoResultado || parseoResultado.validos.length === 0) return;
    setEstado('importando');
    const res = await onImportar(parseoResultado.validos);
    setResultado(res);
    setEstado('resultado');
  };

  const handleReiniciar = () => {
    setEstado('upload');
    setArchivoSeleccionado(null);
    setParseoResultado(null);
    setParseoError(null);
    setResultado(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="border-0 shadow-xl overflow-hidden">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500" />

        <CardHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </div>
              Importar Productos
            </CardTitle>
            <Button variant="outline" size="icon" onClick={onCerrar} className="rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-gray-700 mt-1">
            Carga un archivo CSV o XLSX con tus productos para importarlos de forma masiva
          </p>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <AnimatePresence mode="wait">
            {/* ── STEP 1: Upload ── */}
            {estado === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                {/* Unidades disponibles */}
                {unidadesActivas.length > 0 && (
                  <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-200">
                    <p className="text-sm font-medium text-blue-800 mb-2">
                      Unidades de medida disponibles:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {unidadesActivas.map((u) => (
                        <Badge key={u.id} variant="secondary" className="text-xs">
                          {u.nombre} ({u.simbolo})
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Usa el nombre o símbolo de la unidad en la columna <code className="font-mono bg-blue-100 px-1 rounded">unidadMedida</code>
                    </p>
                  </div>
                )}

                {unidadesActivas.length === 0 && (
                  <div className="p-4 rounded-xl bg-amber-50/30 border border-amber-200 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                      No hay unidades de medida configuradas. Por favor, crea al menos una unidad antes de importar productos.
                    </p>
                  </div>
                )}

                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setArrastre(true); }}
                  onDragLeave={() => setArrastre(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                    arrastre
                      ? 'border-blue-500 bg-blue-50/30'
                      : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50/50'
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center gap-4">
                    {parsando ? (
                      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-blue-500" />
                      </div>
                    )}
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        {parsando ? 'Procesando archivo…' : 'Arrastra tu archivo aquí'}
                      </p>
                      {!parsando && (
                        <p className="text-sm text-gray-700 mt-1">
                          o <span className="text-blue-500 font-medium">haz clic para seleccionarlo</span>
                        </p>
                      )}
                    </div>
                    {!parsando && (
                      <div className="flex gap-2">
                        <Badge variant="secondary">.CSV</Badge>
                        <Badge variant="secondary">.XLSX</Badge>
                        <Badge variant="secondary">.XLS</Badge>
                      </div>
                    )}
                  </div>
                </div>

                {parseoError && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50/30 border border-red-200">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{parseoError}</p>
                  </div>
                )}

                {/* Template download */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50/50 border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-800">¿Primera vez?</p>
                    <p className="text-xs text-gray-700 mt-0.5">
                      Descarga la plantilla CSV con el formato y ejemplos incluidos
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={descargarPlantillaCSV}
                    className="gap-2 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Descargar plantilla
                  </Button>
                </div>

                {/* Required columns info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { col: 'nombre', req: true, desc: 'Nombre del producto' },
                    { col: 'precioTotal', req: true, desc: 'Precio total en $' },
                    { col: 'tamañoPresentacion', req: true, desc: 'Tamaño por presentación' },
                    { col: 'cantidadPresentaciones', req: true, desc: 'Número de presentaciones' },
                    { col: 'unidadMedida', req: true, desc: 'Nombre o símbolo de unidad' },
                    { col: 'categoria', req: false, desc: 'Categoría (opcional)' },
                  ].map(({ col, req, desc }) => (
                    <div key={col} className="p-3 rounded-lg bg-white border border-gray-200">
                      <div className="flex items-center gap-1.5 mb-1">
                        <code className="text-xs font-mono text-blue-600">{col}</code>
                        {req ? (
                          <Badge className="text-[10px] py-0 px-1.5 bg-red-100 text-red-700 border-0">
                            requerido
                          </Badge>
                        ) : (
                          <Badge className="text-[10px] py-0 px-1.5 bg-gray-100 text-gray-600 border-0">
                            opcional
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-700">{desc}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Preview ── */}
            {estado === 'preview' && parseoResultado && (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-200 text-center">
                    <p className="text-2xl font-bold text-blue-800">{parseoResultado.totalFilas}</p>
                    <p className="text-xs text-blue-600 mt-1">Total de filas</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-200 text-center">
                    <p className="text-2xl font-bold text-emerald-800">{parseoResultado.totalValidos}</p>
                    <p className="text-xs text-emerald-600 mt-1">Válidos</p>
                  </div>
                  <div className="p-4 rounded-xl bg-red-50/30 border border-red-200 text-center">
                    <p className="text-2xl font-bold text-red-800">{parseoResultado.totalErrores}</p>
                    <p className="text-xs text-red-600 mt-1">Con errores</p>
                  </div>
                </div>

                {/* File info */}
                {archivoSeleccionado && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50 border border-gray-200">
                    <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{archivoSeleccionado.name}</p>
                      <p className="text-xs text-gray-700">
                        {(archivoSeleccionado.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleReiniciar} className="ml-auto gap-1">
                      Cambiar
                    </Button>
                  </div>
                )}

                {/* Rows table */}
                {parseoResultado.filas.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Vista previa de filas ({Math.min(parseoResultado.filas.length, 10)} de {parseoResultado.filas.length})
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left px-3 py-2 font-medium text-gray-600 w-12">#</th>
                            <th className="text-left px-3 py-2 font-medium text-gray-600">Estado</th>
                            <th className="text-left px-3 py-2 font-medium text-gray-600">Nombre</th>
                            <th className="text-left px-3 py-2 font-medium text-gray-600">Precio Total</th>
                            <th className="text-left px-3 py-2 font-medium text-gray-600">Detalles</th>
                            <th className="text-left px-3 py-2 font-medium text-gray-600">Errores</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parseoResultado.filas.slice(0, 10).map((fila) => (
                            <tr
                              key={fila.fila}
                              className={`border-b border-gray-200 ${
                                fila.valido
                                  ? 'bg-white'
                                  : 'bg-red-50/20'
                              }`}
                            >
                              <td className="px-3 py-2 text-gray-700">{fila.fila}</td>
                              <td className="px-3 py-2">
                                {fila.valido ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                )}
                              </td>
                              <td className="px-3 py-2 font-medium text-gray-800">
                                {fila.datos?.nombre ?? <span className="text-gray-700 italic">—</span>}
                              </td>
                              <td className="px-3 py-2 text-gray-600">
                                {fila.datos ? `$${fila.datos.precioTotal}` : '—'}
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-700">
                                {fila.datos
                                  ? `${fila.datos.tamañoPresentacion} × ${fila.datos.cantidadPresentaciones} | ${fila.datos.categoria || '—'}`
                                  : '—'}
                              </td>
                              <td className="px-3 py-2 text-xs text-red-600">
                                {fila.errores.length > 0 ? fila.errores.join(' • ') : <span className="text-emerald-600">✓</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {parseoResultado.filas.length > 10 && (
                        <p className="text-xs text-gray-700 text-center py-2">
                          y {parseoResultado.filas.length - 10} filas más…
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {parseoResultado.totalValidos === 0 && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/30 border border-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                      No hay filas válidas para importar. Revisa los errores y corrige el archivo.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-2 border-t border-gray-200">
                  <Button variant="outline" onClick={handleReiniciar}>
                    Cargar otro archivo
                  </Button>
                  <Button variant="outline" onClick={onCerrar}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleConfirmarImport}
                    disabled={parseoResultado.totalValidos === 0 || !canCreate}
                    className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
                  >
                    <Upload className="w-4 h-4" />
                    Importar {parseoResultado.totalValidos} producto{parseoResultado.totalValidos !== 1 ? 's' : ''}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Importing ── */}
            {estado === 'importando' && (
              <motion.div key="importando" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-16 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <p className="text-lg font-semibold text-gray-800">Importando productos…</p>
                <p className="text-sm text-gray-700">Esto puede tardar unos segundos</p>
              </motion.div>
            )}

            {/* ── STEP 4: Result ── */}
            {estado === 'resultado' && resultado && (
              <motion.div key="resultado" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="py-8 flex flex-col items-center gap-6">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${resultado.importados > 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-red-500 to-rose-500'}`}>
                  {resultado.importados > 0 ? (
                    <CheckCircle className="w-10 h-10 text-white" />
                  ) : (
                    <XCircle className="w-10 h-10 text-white" />
                  )}
                </div>

                <div className="text-center space-y-1">
                  <p className="text-xl font-bold text-gray-800">
                    {resultado.importados > 0 ? '¡Importación completada!' : 'No se importaron productos'}
                  </p>
                  <p className="text-sm text-gray-700">{resultado.mensaje}</p>
                </div>

                {(resultado.importados > 0 || resultado.errores > 0 || resultado.omitidos > 0) && (
                  <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                    <div className="p-3 rounded-xl bg-emerald-50/30 border border-emerald-200 text-center">
                      <p className="text-xl font-bold text-emerald-800">{resultado.importados}</p>
                      <p className="text-xs text-emerald-600 mt-0.5">Importados</p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-50/30 border border-red-200 text-center">
                      <p className="text-xl font-bold text-red-800">{resultado.errores}</p>
                      <p className="text-xs text-red-600 mt-0.5">Errores</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50/30 border border-amber-200 text-center">
                      <p className="text-xl font-bold text-amber-800">{resultado.omitidos}</p>
                      <p className="text-xs text-amber-600 mt-0.5">Omitidos</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {resultado.importados > 0 && (
                    <Button variant="outline" onClick={handleReiniciar} className="gap-2">
                      <Package className="w-4 h-4" />
                      Importar más
                    </Button>
                  )}
                  <Button
                    onClick={onCerrar}
                    className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Ver productos
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};
