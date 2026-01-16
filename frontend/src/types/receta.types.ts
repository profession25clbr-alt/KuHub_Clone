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
  activo: boolean; // Utilizado para saber si el item está habilitado o mostrar INDISPONIBLE
}

/**
 * Interfaz para el producto simplificado para usar en recetas.
 */
export interface IProductoParaReceta {
  idProducto: number;
  nombreProducto: string;
  unidadMedida: string;
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

/**
 * Payload para crear una nueva receta.
 * POST /api/v1/receta/create-recipe-with-details/
 */
export interface ICrearRecetaPayload {
  nombreReceta: string;
  descripcionReceta: string;
  instrucciones: string;
  estadoReceta: 'ACTIVO' | 'INACTIVO';
  listaItems: IItemReceta[];
}

/**
 * Payload para actualizar una receta con lógica de diferencias.
 * PUT /api/v1/receta/update-recipe-with-details/
 */
export interface IActualizarRecetaPayload {
  idReceta: number;
  cambioReceta: boolean;
  nombreReceta: string;
  descripcionReceta: string;
  instrucciones: string;
  estadoReceta: 'ACTIVO' | 'INACTIVO';
  itemsAgregados: IItemReceta[];
  itemsModificados: IItemReceta[];
  idsItemsEliminados: number[]; // Lista de IDs de los productos/items eliminados
}

/**
 * Interfaz unificada para el formulario de receta (Frontend).
 */
export interface IGuardarReceta {
  idReceta?: number;
  nombreReceta: string;
  descripcionReceta: string;
  instrucciones: string;
  estadoReceta: 'ACTIVO' | 'INACTIVO';
  listaItems: IItemReceta[];
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
