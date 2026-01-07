
import api from '../config/Axios';
import { ISala, ISalaCreacion } from '../types/sala.types';

const STORAGE_KEY_SALAS = 'kuhub_salas';

interface SalaDTO {
    idSala: number;
    codSala: string;
    nombreSala: string;
    capacidadAlumnos: number;
    // Add other fields if present in backend
}

const transformarSala = (dto: SalaDTO): ISala => ({
    id: dto.idSala.toString(),
    codigo: dto.codSala,
    nombre: dto.nombreSala,
    capacidad: dto.capacidadAlumnos
});

export const obtenerSalasService = async (): Promise<ISala[]> => {
    try {
        const response = await api.get<SalaDTO[]>('/sala/find-all-active-rooms-true/');
        if (!response.data) return [];
        return response.data.map(transformarSala);
    } catch (error) {
        console.error('Error al obtener salas del backend:', error);
        // Fallback to local storage if needed? No, let's signal error or return empty.
        // Or maybe fallback for dev purposes if backend is down? 
        // Better to fail gracefully or show empty.
        return [];
    }
};

// DTO for creating a room
interface SalaCreationDTO {
    codSala?: string;
    nombreSala: string;
    capacidadAlumnos?: number;
}

export const crearSalaService = async (sala: ISalaCreacion): Promise<ISala> => {
    try {
        const payload: SalaCreationDTO = {
            nombreSala: sala.nombre,
            codSala: sala.codigo || undefined
        };

        const response = await api.post<SalaDTO>('/sala/create-sala/', payload);

        console.log('✅ Sala creada:', response.data);
        return transformarSala(response.data);
    } catch (error: any) {
        console.error('Error al crear sala:', error);
        throw new Error(error.response?.data?.message || 'Error al crear la sala');
    }
};

// DTO for updating a room
interface SalaUpdateDTO {
    idSala: number;
    codSala?: string;
    nombreSala: string;
    capacidadAlumnos?: number;
}

export const actualizarSalaService = async (id: string, updates: Partial<ISalaCreacion>): Promise<ISala> => {
    try {
        const payload: SalaUpdateDTO = {
            idSala: parseInt(id),
            codSala: updates.codigo || '',
            nombreSala: updates.nombre || ''
        };

        const response = await api.put<SalaDTO>('/sala/update-sala/', payload);

        console.log('✅ Sala actualizada:', response.data);
        return transformarSala(response.data);
    } catch (error: any) {
        console.error('Error al actualizar sala:', error);
        throw new Error(error.response?.data?.message || 'Error al actualizar la sala');
    }
};

export const eliminarSalaService = async (id: string): Promise<void> => {
    console.warn('Backend endpoint for delete room not provided yet.');
};
