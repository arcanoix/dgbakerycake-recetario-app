import { RecetaFormSchema } from './lib/validators';
import { sanitizeStringFields } from './lib/sanitize';

const receta = {
  nombre: 'Prueba',
  descripcion: 'Descr',
  rendimiento: undefined,
  unidadRendimiento: undefined,
  cantidadHoras: 2,
  margenGanancia: 30,
  categoria: '',
  imagen: undefined,
  notas: undefined,
};

const sanitized = sanitizeStringFields({
  nombre: receta.nombre,
  descripcion: receta.descripcion,
  unidadRendimiento: receta.unidadRendimiento,
  categoria: receta.categoria,
  imagen: receta.imagen,
  notas: receta.notas,
});

const parsed = RecetaFormSchema.safeParse({
  ...sanitized,
  rendimiento: receta.rendimiento,
  cantidadHoras: receta.cantidadHoras,
  margenGanancia: receta.margenGanancia,
});

console.log(parsed.success ? 'Success' : JSON.stringify(parsed.error.issues, null, 2));
