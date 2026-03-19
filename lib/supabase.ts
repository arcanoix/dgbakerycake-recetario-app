// Re-exportamos el cliente singleton de supabase-auth para evitar
// múltiples instancias de GoTrueClient en el mismo browser context.
// NUNCA crear un segundo createClient() aparte de supabase-auth.ts.
export { supabaseAuth as supabase } from '@/lib/supabase-auth';


// Tipos para las tablas de Supabase
export type Database = {
  public: {
    Tables: {
      productos: {
        Row: {
          id: string;
          nombre: string;
          precio_total: number;
          cantidad_total: number;
          unidad_medida: string;
          precio_por_unidad: number;
          categoria: string | null;
          proveedor: string | null;
          notas: string | null;
          fecha_actualizacion: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          precio_total: number;
          cantidad_total: number;
          unidad_medida: string;
          precio_por_unidad: number;
          categoria?: string | null;
          proveedor?: string | null;
          notas?: string | null;
          fecha_actualizacion?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          precio_total?: number;
          cantidad_total?: number;
          unidad_medida?: string;
          precio_por_unidad?: number;
          categoria?: string | null;
          proveedor?: string | null;
          notas?: string | null;
          fecha_actualizacion?: string;
        };
      };
      recetas: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string;
          materiales: any;
          rendimiento: number | null;
          unidad_rendimiento: string | null;
          tiempo_preparacion: number;
          costo_por_hora: number;
          costo_mano_obra: number;
          costo_materiales: number;
          costo_total: number;
          margen_ganancia: number | null;
          precio_venta_sugerido: number | null;
          categoria: string | null;
          imagen: string | null;
          notas: string | null;
          fecha_creacion: string;
          fecha_actualizacion: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion: string;
          materiales: any;
          rendimiento?: number | null;
          unidad_rendimiento?: string | null;
          tiempo_preparacion: number;
          costo_por_hora: number;
          costo_mano_obra: number;
          costo_materiales: number;
          costo_total: number;
          margen_ganancia?: number | null;
          precio_venta_sugerido?: number | null;
          categoria?: string | null;
          imagen?: string | null;
          notas?: string | null;
          fecha_creacion?: string;
          fecha_actualizacion?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          descripcion?: string;
          materiales?: any;
          rendimiento?: number | null;
          unidad_rendimiento?: string | null;
          tiempo_preparacion?: number;
          costo_por_hora?: number;
          costo_mano_obra?: number;
          costo_materiales?: number;
          costo_total?: number;
          margen_ganancia?: number | null;
          precio_venta_sugerido?: number | null;
          categoria?: string | null;
          imagen?: string | null;
          notas?: string | null;
          fecha_actualizacion?: string;
        };
      };
      configuracion: {
        Row: {
          id: string;
          costo_por_hora_defecto: number;
          moneda: string;
          margen_ganancia_defecto: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          costo_por_hora_defecto: number;
          moneda: string;
          margen_ganancia_defecto: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          costo_por_hora_defecto?: number;
          moneda?: string;
          margen_ganancia_defecto?: number;
          updated_at?: string;
        };
      };
    };
  };
};
