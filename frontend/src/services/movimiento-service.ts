import axios from '../config/Axios';
import { CreateMovimientoRequest, IMovimiento, MovimientoFilterRequest } from '../types/movimiento.types';

const BASE_URL = '/movimiento';

export const crearMovimientoService = async (request: CreateMovimientoRequest): Promise<IMovimiento> => {
    const response = await axios.post(`${BASE_URL}/create-motion`, request);
    return response.data;
};

export const obtenerMovimientosFiltradosService = async (filter: MovimientoFilterRequest): Promise<IMovimiento[]> => {
    const response = await axios.post(`${BASE_URL}/find-all-motion-filter`, filter);
    return response.data;
};
