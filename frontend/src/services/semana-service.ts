/**
 * SERVICIO DE SEMANAS
 * 
 * Ubicación: src/services/semana-service.ts
 */

import axios from '../config/Axios';
import { ISemana } from '../types/semana.types';

/**
 * Obtiene las semanas activas para el año en curso.
 * Endpoint: GET /api/v1/semanas/find-week-active-for-year/
 */
export const obtenerSemanasActivasService = async (): Promise<ISemana[]> => {
    try {
        const response = await axios.get<ISemana[]>('/semanas/find-week-active-for-year/');
        console.log('📅 Semanas activas cargadas:', response.data.length);
        return response.data;
    } catch (error) {
        console.error('❌ Error al obtener semanas activas:', error);
        throw error;
    }
};
