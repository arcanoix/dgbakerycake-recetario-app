import Papa from 'papaparse';
import { ProductoFormData, UnidadMedidaAdmin } from '@/types';

// ============================================
// TIPOS
// ============================================

export interface FilaImportacion {
  fila: number;
  datos?: ProductoFormData;
  errores: string[];
  valido: boolean;
}

export interface ResultadoImportacion {
  filas: FilaImportacion[];
  validos: ProductoFormData[];
  totalFilas: number;
  totalValidos: number;
  totalErrores: number;
}

type FilaCruda = Record<string, string>;
type CeldaExcel = string | number | boolean | Date | null;

// ============================================
// MAPEO DE COLUMNAS
// ============================================

const COLUMNAS_REQUERIDAS = [
  'nombre',
  'precioTotal',
  'tamañoPresentacion',
  'cantidadPresentaciones',
  'unidadMedida',
];

// Alias en minúsculas sin acentos para identificar cada columna
const ALIAS_COLUMNAS: Record<string, string> = {
  nombre: 'nombre',
  producto: 'nombre',
  product: 'nombre',
  name: 'nombre',
  preciototal: 'precioTotal',
  precio: 'precioTotal',
  price: 'precioTotal',
  total: 'precioTotal',
  tamanopresentacion: 'tamañoPresentacion',
  tamaopresentacion: 'tamañoPresentacion',
  tamano: 'tamañoPresentacion',
  presentacion: 'tamañoPresentacion',
  size: 'tamañoPresentacion',
  cantidadpresentaciones: 'cantidadPresentaciones',
  cantidadpresentacion: 'cantidadPresentaciones',
  cantidad: 'cantidadPresentaciones',
  quantity: 'cantidadPresentaciones',
  unidadmedida: 'unidadMedida',
  unidad: 'unidadMedida',
  unit: 'unidadMedida',
  medida: 'unidadMedida',
  categoria: 'categoria',
  category: 'categoria',
  proveedor: 'proveedor',
  supplier: 'proveedor',
  vendor: 'proveedor',
  notas: 'notas',
  notes: 'notas',
  note: 'notas',
};

function normalizarNombreColumna(nombre: string): string {
  return nombre
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/[áà]/g, 'a')
    .replace(/[éè]/g, 'e')
    .replace(/[íì]/g, 'i')
    .replace(/[óò]/g, 'o')
    .replace(/[úù]/g, 'u')
    .replace(/ñ/g, 'n');
}

function mapearColumnas(headers: string[]): Record<string, string> {
  const mapa: Record<string, string> = {};
  for (const header of headers) {
    const normalizado = normalizarNombreColumna(header);
    const campo = ALIAS_COLUMNAS[normalizado];
    if (campo) {
      mapa[header] = campo;
    }
  }
  return mapa;
}

// ============================================
// VALIDACIÓN
// ============================================

function buscarUnidad(valor: string, unidades: UnidadMedidaAdmin[]): UnidadMedidaAdmin | null {
  const v = valor.toLowerCase().trim();
  return unidades.find((u) => u.nombre.toLowerCase() === v || u.simbolo.toLowerCase() === v) ?? null;
}

function validarFila(
  fila: FilaCruda,
  mapaColumnas: Record<string, string>,
  indice: number,
  unidades: UnidadMedidaAdmin[]
): FilaImportacion {
  const errores: string[] = [];

  // Construir mapa inverso campo → header original
  const campoAHeader: Record<string, string> = {};
  for (const [header, campo] of Object.entries(mapaColumnas)) {
    if (!(campo in campoAHeader)) {
      campoAHeader[campo] = header;
    }
  }

  const obtenerValor = (campo: string): string => {
    const header = campoAHeader[campo];
    return header ? String(fila[header] ?? '').trim() : '';
  };

  const nombre = obtenerValor('nombre');
  const precioTotalStr = obtenerValor('precioTotal');
  const tamañoPresentacionStr = obtenerValor('tamañoPresentacion');
  const cantidadPresentacionesStr = obtenerValor('cantidadPresentaciones');
  const unidadMedidaStr = obtenerValor('unidadMedida');

  if (!nombre) {
    errores.push('El nombre es requerido');
  } else if (nombre.length > 150) {
    errores.push('El nombre no puede superar 150 caracteres');
  }

  const precioTotal = parseFloat(precioTotalStr);
  if (!precioTotalStr || isNaN(precioTotal) || precioTotal <= 0) {
    errores.push('precioTotal debe ser un número mayor a 0');
  }

  const tamañoPresentacion = parseFloat(tamañoPresentacionStr);
  if (!tamañoPresentacionStr || isNaN(tamañoPresentacion) || tamañoPresentacion <= 0) {
    errores.push('tamañoPresentacion debe ser un número mayor a 0');
  }

  const cantidadPresentaciones = parseFloat(cantidadPresentacionesStr);
  if (
    !cantidadPresentacionesStr ||
    isNaN(cantidadPresentaciones) ||
    cantidadPresentaciones <= 0 ||
    !Number.isInteger(cantidadPresentaciones)
  ) {
    errores.push('cantidadPresentaciones debe ser un entero mayor a 0');
  }

  let unidadEncontrada: UnidadMedidaAdmin | null = null;
  if (!unidadMedidaStr) {
    errores.push('La unidad de medida es requerida');
  } else {
    unidadEncontrada = buscarUnidad(unidadMedidaStr, unidades);
    if (!unidadEncontrada) {
      const disponibles = unidades.map((u) => `${u.nombre} (${u.simbolo})`).join(', ');
      errores.push(`Unidad "${unidadMedidaStr}" no encontrada. Disponibles: ${disponibles}`);
    }
  }

  if (errores.length > 0) {
    return { fila: indice + 2, errores, valido: false }; // +2: 1-based + header row
  }

  const datos: ProductoFormData = {
    nombre,
    precioTotal,
    tamañoPresentacion,
    cantidadPresentaciones,
    unidadMedida: unidadEncontrada!.id,
    categoria: obtenerValor('categoria') || undefined,
    proveedor: obtenerValor('proveedor') || undefined,
    notas: obtenerValor('notas') || undefined,
  };

  return { fila: indice + 2, datos, errores: [], valido: true };
}

// ============================================
// PARSEO DE ARCHIVOS
// ============================================

async function leerFilasExcel(file: File): Promise<{ headers: string[]; filas: FilaCruda[] }> {
  const readXlsxFile = (await import('read-excel-file/browser')).default;
  const resultado = await readXlsxFile(file);

  // El tipo de retorno de la libreria puede variar segun configuracion/version.
  // Normalizamos a matriz de filas para procesar headers y datos de forma consistente.
  const rows: CeldaExcel[][] = Array.isArray(resultado)
    ? resultado.map((fila) => (Array.isArray(fila) ? (fila as CeldaExcel[]) : []))
    : [];

  if (rows.length === 0) return { headers: [], filas: [] };

  const primeraFila = rows[0] ?? [];
  const headers: string[] = [];
  for (let j = 0; j < primeraFila.length; j++) {
    headers.push(String(primeraFila[j] ?? ''));
  }
  const filas: FilaCruda[] = [];

  for (let i = 1; i < rows.length; i++) {
    const fila: FilaCruda = {};
    for (let j = 0; j < headers.length; j++) {
      fila[headers[j]] = String(rows[i][j] ?? '');
    }
    filas.push(fila);
  }

  return { headers, filas };
}

async function leerFilasCSV(file: File): Promise<{ headers: string[]; filas: FilaCruda[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse<FilaCruda>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        resolve({ headers: result.meta.fields ?? [], filas: result.data });
      },
      error: (err) => reject(new Error(err.message)),
    });
  });
}

export async function parsearArchivoProductos(
  file: File,
  unidades: UnidadMedidaAdmin[]
): Promise<ResultadoImportacion> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (!['csv', 'xlsx', 'xls'].includes(extension)) {
    throw new Error('Formato no soportado. Use archivos CSV o XLSX.');
  }

  const { headers, filas: filasCrudas } =
    extension === 'csv' ? await leerFilasCSV(file) : await leerFilasExcel(file);

  if (headers.length === 0 || filasCrudas.length === 0) {
    return { filas: [], validos: [], totalFilas: 0, totalValidos: 0, totalErrores: 0 };
  }

  const mapaColumnas = mapearColumnas(headers);
  const camposMapeados = new Set(Object.values(mapaColumnas));
  const faltantes = COLUMNAS_REQUERIDAS.filter((col) => !camposMapeados.has(col));

  if (faltantes.length > 0) {
    throw new Error(
      `No se encontraron las columnas requeridas: ${faltantes.join(', ')}. ` +
        'Descarga la plantilla para ver el formato correcto.'
    );
  }

  const filas = filasCrudas
    .filter((fila) => Object.values(fila).some((v) => v != null && v !== '' && v !== 'undefined'))
    .map((fila, i) => validarFila(fila, mapaColumnas, i, unidades));

  const validos = filas.filter((f) => f.valido).map((f) => f.datos!);

  return {
    filas,
    validos,
    totalFilas: filas.length,
    totalValidos: validos.length,
    totalErrores: filas.filter((f) => !f.valido).length,
  };
}

// ============================================
// GENERACIÓN DE PLANTILLA
// ============================================

export function descargarPlantillaCSV(): void {
  const encabezados = [
    'nombre',
    'precioTotal',
    'tamañoPresentacion',
    'cantidadPresentaciones',
    'unidadMedida',
    'categoria',
    'proveedor',
    'notas',
  ];

  const ejemplos = [
    ['Harina de Trigo', '150', '900', '3', 'gramos', 'Harinas', 'Proveedor A', 'Harina todo uso'],
    ['Azúcar Blanca', '80', '1000', '2', 'gramos', 'Azúcares', '', ''],
    ['Aceite Vegetal', '120', '1', '2', 'litros', 'Aceites', 'Proveedor B', ''],
  ];

  const contenido = [encabezados, ...ejemplos]
    .map((fila) => fila.map((v) => `"${v}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = 'plantilla_productos.csv';
  enlace.click();
  URL.revokeObjectURL(url);
}

/**
 * Exporta una lista de productos a un archivo CSV siguiendo la estructura de la plantilla.
 */
export function exportarProductosCSV(productos: any[]): void {
  const encabezados = [
    'nombre',
    'precioTotal',
    'tamañoPresentacion',
    'cantidadPresentaciones',
    'unidadMedida',
    'categoria',
    'proveedor',
    'notas',
  ];

  const filas = productos.map((p) => [
    p.nombre || '',
    p.precioTotal || 0,
    p.tamañoPresentacion || 0,
    p.cantidadPresentaciones || 0,
    p.unidadMedidaNombre || p.unidadMedida || '', // Preferimos el nombre de la unidad si está disponible
    p.categoria || '',
    p.proveedor || '',
    p.notas || '',
  ]);

  const contenido = [encabezados, ...filas]
    .map((fila) =>
      fila
        .map((v) => {
          const stringValue = String(v ?? '');
          // Escapar comillas dobles y envolver en comillas si contiene comas o saltos de línea
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',')
    )
    .join('\r\n'); // Usar terminación CRLF para mejor compatibilidad con Excel

  const blob = new Blob(['\ufeff' + contenido], { type: 'text/csv;charset=utf-8;' }); // Añadir BOM para caracteres especiales
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `exportacion_productos_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
