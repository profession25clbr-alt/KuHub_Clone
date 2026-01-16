import axios from '../config/Axios';
import { CreateMovimientoRequest, IMovimiento, MovimientoFilterRequest } from '../types/movimiento.types';

const BASE_URL = '/movimiento';

export const crearMovimientoService = async (request: CreateMovimientoRequest): Promise<IMovimiento> => {
    console.log('📝 Creando movimiento:', request);
    try {
        const response = await axios.post(`${BASE_URL}/create-motion`, request);
        return response.data;
    } catch (error) {
        console.error('❌ Error al crear movimiento:', error);
        throw error;
    }
};

export const obtenerMovimientosFiltradosService = async (filter: MovimientoFilterRequest): Promise<IMovimiento[]> => {
    console.log('📋 Buscando movimientos con filtros:', filter);
    try {
        const response = await axios.post(`${BASE_URL}/find-all-motion-filter`, filter);
        return response.data;
    } catch (error) {
        console.error('❌ Error al obtener movimientos filtrados:', error);
        throw error;
    }
};
