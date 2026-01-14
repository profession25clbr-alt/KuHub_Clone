/**
 * TIPOS PARA RECETAS Y SOLICITUDES
 * 
 * Ubicación: src/types/receta.types.ts
 */

/**
 * Interfaz para un ingrediente de receta.
 */
/**
 * Interfaz para un item de receta (ingrediente).
 */
export interface IItemReceta {
  idProducto: number;
  nombreProducto: string;
  unidadMedida: string;
  cantUnidadMedida: number;
  activo: boolean;
}

/**
 * Interfaz que define la estructura de una receta desde el backend.
 */
export interface IReceta {
  idReceta: number;
  nombreReceta: string;
  descripcionReceta: string;
  listaItems: IItemReceta[];
  instrucciones: string;
  estadoReceta: 'ACTIVO' | 'INACTIVO';
  cambioReceta?: boolean;
  cambioDetalles?: boolean;
}

/**
 * Interfaz para crear/actualizar una receta (Frontend -> Backend).
 * Nota: Adaptada para coincidir con lo que esperaría el backend o para uso interno temporal.
 */
export interface IGuardarReceta {
  idReceta?: number;
  nombreReceta: string;
  descripcionReceta: string;
  listaItems: IItemReceta[];
  instrucciones: string;
  estadoReceta: 'ACTIVO' | 'INACTIVO';
}

/**
 * Interfaz para un item de solicitud (legacy/frontend usage).
 * Se mantiene para compatibilidad con el módulo de solicitudes por ahora.
 */
export interface IItemSolicitud {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  unidadMedida: string;
  esAdicional: boolean;
}

/**
 * Interfaz que define la estructura de una solicitud.
 */
export interface ISolicitud {
  id: string;
  asignaturaId: string;
  asignaturaNombre: string;
  fecha: string;
  recetaId?: number | null; // Updated to number
  recetaNombre?: string | null;
  items: IItemSolicitud[];
  observaciones: string;
  esCustom: boolean;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Completada';
  usuarioId: string;
  usuarioNombre: string;
  solicitante: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}
