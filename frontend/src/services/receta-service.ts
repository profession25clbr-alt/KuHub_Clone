/**
 * SERVICIO DE RECETAS CON PERSISTENCIA REAL (AXIOS)
 * 
 * Ubicación: src/services/receta-service.ts
 */

import axios from '../config/Axios';
import {
  IReceta,
  ICrearRecetaPayload,
  IActualizarRecetaPayload,
  IProductoParaReceta,
} from '../types/receta.types';

/**
 * Obtiene todas las recetas activas con sus detalles.
 * Endpoint: GET /api/v1/receta/find-all-recipe-with-details-active
 */
export const obtenerRecetasService = async (): Promise<IReceta[]> => {
  try {
    const response = await axios.get<IReceta[]>('/receta/find-all-recipe-with-details-active/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener recetas:', error);
    throw error;
  }
};

/**
 * Obtiene los productos disponibles para usar en recetas.
 * Endpoint: GET /api/v1/producto/find-all-product-active-for-recipe
 */
export const obtenerProductosParaRecetaService = async (): Promise<IProductoParaReceta[]> => {
  try {
    const response = await axios.get<IProductoParaReceta[]>('/producto/find-all-product-active-for-recipe');
    console.log('📦 Productos para receta obtenidos:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos para receta:', error);
    throw error;
  }
};

/**
 * Cambia el estado de una receta (Activar/Desactivar).
 * Endpoint: PUT /api/v1/receta/update-changing-status-recipe-with/{id}
 */
export const cambiarEstadoRecetaService = async (idReceta: number, activo: boolean): Promise<IReceta> => {
  try {
    // Nota: El endpoint parece solo cambiar el estado, asumimos que devuelve la receta actualizada o void.
    // Ajustaremos según la respuesta real.
    const response = await axios.put<IReceta>(`/receta/update-changing-status-recipe-with/${idReceta}`);
    return response.data;
  } catch (error) {
    console.error(`Error al cambiar estado de receta ${idReceta}:`, error);
    throw error;
  }
};

/**
 * Elimina una receta (Eliminación lógica).
 * Endpoint: PUT /api/v1/receta/update-status-active-false-recipe-with-details/{id}
 */
export const eliminarRecetaService = async (idReceta: number): Promise<boolean> => {
  try {
    await axios.put(`/receta/update-status-active-false-recipe-with-details/${idReceta}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar receta ${idReceta}:`, error);
    throw error;
  }
};

/**
 * Obtiene una receta por ID.
 * Nota: No se proporcionó endpoint específico para GET por ID, usamos find-all y filtramos o simulamos por ahora.
 */
export const obtenerRecetaPorIdService = async (id: number): Promise<IReceta> => {
  // TODO: Reemplazar con endpoint real cuando exista
  const recetas = await obtenerRecetasService();
  const receta = recetas.find(r => r.idReceta === id);
  if (!receta) throw new Error(`Receta ${id} no encontrada`);
  return receta;
};


/**
 * Crea una nueva receta enviando el payload completo.
 * Endpoint: POST /api/v1/receta/create-recipe-with-details/
 */
export const crearRecetaService = async (recetaData: ICrearRecetaPayload): Promise<IReceta> => {
  console.log('➕ Creando receta con detalle:', recetaData);
  try {
    const response = await axios.post<IReceta>('/receta/create-recipe-with-details/', recetaData);
    console.log(`✅ Receta creada ID: ${response.data.idReceta}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear receta:', error);
    throw error;
  }
};

/**
 * Actualiza una receta enviando las diferencias (agregados, modificados, eliminados).
 * Endpoint: PUT /api/v1/receta/update-recipe-with-details/
 */
export const actualizarRecetaService = async (payload: IActualizarRecetaPayload): Promise<IReceta> => {
  console.log('✏️ Actualizando receta con diferencias:', payload);
  try {
    // Nota: El backend retorna void (200 OK) según la documentación del usuario en algunos casos, 
    // pero idealmente retornaría la receta actualizada. Asumiremos que retorna la receta O void.
    // Si retorna void, tendremos que volver a buscarla o retornar lo que enviamos transformado.
    // Revisando el request del usuario: "response ... retorna json" con la receta.
    const response = await axios.put<IReceta>('/receta/update-recipe-with-details/', payload);
    console.log(`✅ Receta actualizada ID: ${payload.idReceta}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al actualizar receta:', error);
    throw error;
  }
};

/**
 * Servicio legacy para compatibilidad si fuera necesario, redirige a obtenerRecetasService.
 */
export const obtenerRecetasActivasService = async (): Promise<IReceta[]> => {
  return obtenerRecetasService();
};
