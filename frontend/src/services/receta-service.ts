/**
 * SERVICIO DE RECETAS CON PERSISTENCIA REAL (AXIOS)
 * 
 * Ubicación: src/services/receta-service.ts
 */

import axios from '../config/Axios';
import {
  IReceta,
  IGuardarReceta,
} from '../types/receta.types';

/**
 * Obtiene todas las recetas activas con sus detalles.
 * Endpoint: GET /api/v1/receta/find-all-recipe-with-details-active
 */
export const obtenerRecetasService = async (): Promise<IReceta[]> => {
  try {
    const response = await axios.get<IReceta[]>('/receta/find-all-recipe-with-details-active');
    return response.data;
  } catch (error) {
    console.error('Error al obtener recetas:', error);
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


// --- MÉTODOS MOCK / NO IMPLEMENTADOS EN BACKEND AÚN ---

/**
 * Crea una nueva receta.
 * MOCK: No hay endpoint proporcionado.
 */
export const crearRecetaService = async (recetaData: IGuardarReceta): Promise<IReceta> => {
  console.warn('Endpoint de crear receta no implementado. MOCK activo.');
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    ...recetaData,
    idReceta: Math.floor(Math.random() * 10000),
    cambioReceta: false,
    cambioDetalles: false
  } as IReceta;
};

/**
 * Actualiza una receta existente.
 * MOCK: No hay endpoint proporcionado para editar contenido.
 */
export const actualizarRecetaService = async (recetaData: IGuardarReceta): Promise<IReceta> => {
  console.warn('Endpoint de actualizar receta no implementado. MOCK activo.');
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    ...recetaData,
    cambioReceta: true
  } as IReceta;
};

/**
 * Servicio legacy para compatibilidad si fuera necesario, redirige a obtenerRecetasService.
 */
export const obtenerRecetasActivasService = async (): Promise<IReceta[]> => {
  return obtenerRecetasService();
};
