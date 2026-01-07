/**
 * SERVICIO DE GESTIÓN DE ASIGNATURAS - CONECTADO AL BACKEND
 * Maneja la comunicación con la API REST de Spring Boot
 */

import api from '../config/Axios';
import {
  IAsignatura,
  ISeccion,
  IAsignaturaCreacion,
  IAsignaturaActualizacion,
  ISeccionCreacion,
  ISeccionActualizacion,
  IBloqueHorario,
  EstadoSeccion,
  DiaSemana
} from '../types/asignatura.types';

// ============================================
// INTERFACES PARA RESPUESTAS DEL BACKEND
// ============================================

interface CourserAnswerDTGOD {
  idAsignatura: number;
  codAsignatura: string;
  nombreAsignatura: string;
  idCompletoProfesor: number;
  nombreProfesor: string;
  descripcionAsignatura: string;
  secciones: SectionAnswerUpdateDTO[];
}

interface SectionAnswerUpdateDTO {
  idSeccion: number;
  idAsignatura: number;
  nombreSeccion: string;
  estadoSeccion: EstadoSeccion;
  idDocente: number;
  nombreCompletoDocente: string;
  capacidadMaxInscritos: number;
  cantInscritos: number;
  bloquesHorarios: BookTImeBlocksRequestDTO[]
  crearSala?: boolean;
}

interface BookTImeBlocksRequestDTO {
  numeroBloque: number;
  horaInicio: string;
  horaFin: string;
  diaSemana: DiaSemana;
  idSala: number;
  codSala: string;
  nombreSala: string;
}

interface CourseCreateDTO {
  codAsignatura: string;
  nombreAsignatura: string;
  idProfesor: number;
  nombreProfesor: string;
  descripcionAsignatura: string;
}

interface CourseUpdateDTO {
  idAsignatura: number;
  codAsignatura: string;
  nombreAsignatura: string;
  idProfesor: number;
  nombreCompletoProfesor: string;
  descripcionAsignatura: string;
}

// ============================================
// TRANSFORMADORES: BACKEND → FRONTEND
// ============================================

/**
 * Transforma un bloque horario del backend al formato frontend
 */
const transformarBloqueHorario = (bloque: BookTImeBlocksRequestDTO): IBloqueHorario => {
  return {
    numeroBloque: typeof bloque.numeroBloque === 'string' ? parseInt(bloque.numeroBloque) : (bloque.numeroBloque || 0),
    horaInicio: bloque.horaInicio || '00:00',
    horaFin: bloque.horaFin || '00:00',
    diaSemana: bloque.diaSemana || 'LUNES',
    idSala: typeof bloque.idSala === 'string' ? parseInt(bloque.idSala) : (bloque.idSala || 0),
    codSala: bloque.codSala || 'SIN-COD',
    nombreSala: bloque.nombreSala || 'Sin sala'
  };
};

/**
 * Transforma una sección del backend al formato frontend
 */
const transformarSeccion = (seccion: SectionAnswerUpdateDTO): ISeccion => {
  return {
    id: seccion.idSeccion?.toString() || '0',
    numeroSeccion: seccion.nombreSeccion || 'Sin nombre',
    profesorAsignado: seccion.nombreCompletoDocente || 'Sin asignar',
    profesorAsignadoId: seccion.idDocente?.toString() || '0',
    capacidadMax: seccion.capacidadMaxInscritos || 0,
    cantInscritos: seccion.cantInscritos || 0,
    estado: seccion.estadoSeccion || 'ACTIVA',
    bloquesHorarios: seccion.bloquesHorarios?.map(transformarBloqueHorario) || []
  };
};

/**
 * Transforma una asignatura del backend al formato frontend
 */
const transformarAsignatura = (asignatura: CourserAnswerDTGOD): IAsignatura => {
  return {
    id: asignatura.idAsignatura?.toString() || '0',
    codigo: asignatura.codAsignatura || 'SIN-COD',
    nombre: asignatura.nombreAsignatura || 'Sin nombre',
    profesorACargoId: asignatura.idCompletoProfesor?.toString() || '0',
    profesorACargoNombre: asignatura.nombreProfesor || 'Sin asignar',
    descripcion: asignatura.descripcionAsignatura || '',
    secciones: asignatura.secciones?.map(transformarSeccion) || [],
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  };
};

// ============================================
// SERVICIOS - ASIGNATURAS
// ============================================

/**
 * Obtener todas las asignaturas activas con sus secciones
 */
export const obtenerAsignaturasService = async (): Promise<IAsignatura[]> => {
  try {
    const response = await api.get<CourserAnswerDTGOD[]>(
      '/asignatura/find-all-courses-active-true/'
    );



    if (!response.data || !Array.isArray(response.data)) {
      console.error('❌ Respuesta inválida del backend:', response.data);
      return [];
    }

    const asignaturas = response.data.map((asignatura, index) => {
      try {
        return transformarAsignatura(asignatura);
      } catch (error) {
        console.error(`❌ Error al transformar asignatura ${index}:`, asignatura, error);
        throw error;
      }
    });


    return asignaturas;

  } catch (error: any) {
    console.error('❌ Error completo:', error);
    console.error('❌ Respuesta del servidor:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Error al obtener las asignaturas');
  }
};

/**
 * Obtener TODAS las asignaturas (incluso no activas) para filtros
 * Endpoint: /asignatura/find-all/
 */
export const obtenerTodasAsignaturasSimplesService = async (): Promise<IAsignatura[]> => {
  try {
    const response = await api.get<CourserAnswerDTGOD[]>('/asignatura/find-all/');

    if (!response.data || !Array.isArray(response.data)) {
      console.error('❌ Respuesta inválida del backend:', response.data);
      return [];
    }

    // Reuse the existing transformer
    const asignaturas = response.data.map((asignatura) => {
      // We might need a safer transform if the DTO is different, but user implies it's "all subjects"
      // Trying standard transform first.
      try {
        return transformarAsignatura(asignatura);
      } catch (e) {
        console.warn("Skipping invalid subject", asignatura);
        return null;
      }
    }).filter((a): a is IAsignatura => a !== null);

    return asignaturas;
  } catch (error: any) {
    console.error('Error al obtener todas las asignaturas:', error);
    return [];
  }
};

/**
 * Obtener asignatura por ID
 */
export const obtenerAsignaturaPorIdService = async (id: string): Promise<IAsignatura | null> => {
  try {
    const asignaturas = await obtenerAsignaturasService();
    return asignaturas.find(a => a.id === id) || null;
  } catch (error: any) {
    console.error('Error al obtener asignatura:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener la asignatura');
  }
};

/**
 * Crear nueva asignatura
 */
export const crearAsignaturaService = async (data: IAsignaturaCreacion): Promise<IAsignatura> => {
  try {
    const payload: CourseCreateDTO = {
      codAsignatura: data.codigo,
      nombreAsignatura: data.nombre,
      idProfesor: parseInt(data.profesorACargoId),
      nombreProfesor: '', // Se llena automáticamente en el backend
      descripcionAsignatura: data.descripcion
    };

    const response = await api.post<CourseCreateDTO>(
      '/asignatura/create-course/',
      payload
    );

    // Recargar la lista completa para obtener el objeto completo
    const asignaturas = await obtenerAsignaturasService();
    const nuevaAsignatura = asignaturas.find(
      a => a.codigo === response.data.codAsignatura
    );

    if (!nuevaAsignatura) {
      throw new Error('No se pudo encontrar la asignatura creada');
    }

    return nuevaAsignatura;
  } catch (error: any) {
    console.error('Error al crear asignatura:', error);
    throw new Error(error.response?.data?.message || 'Error al crear la asignatura');
  }
};

/**
 * Actualizar asignatura
 */
export const actualizarAsignaturaService = async (
  id: string,
  data: Partial<IAsignatura>
): Promise<IAsignatura> => {
  try {
    const payload: CourseUpdateDTO = {
      idAsignatura: parseInt(id),
      codAsignatura: data.codigo || '',
      nombreAsignatura: data.nombre || '',
      idProfesor: data.profesorACargoId ? parseInt(data.profesorACargoId) : 0,
      nombreCompletoProfesor: data.profesorACargoNombre || '',
      descripcionAsignatura: data.descripcion || ''
    };

    await api.put<CourseUpdateDTO>(
      '/asignatura/update-course/',
      payload
    );

    // Recargar la asignatura actualizada
    const asignaturaActualizada = await obtenerAsignaturaPorIdService(id);
    if (!asignaturaActualizada) {
      throw new Error('No se pudo encontrar la asignatura actualizada');
    }

    return asignaturaActualizada;
  } catch (error: any) {
    console.error('Error al actualizar asignatura:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar la asignatura');
  }
};

/**
 * Eliminar asignatura (soft delete)
 */
export const eliminarAsignaturaService = async (id: string): Promise<void> => {
  try {
    await api.put(`/asignatura/soft-delete-course/${id}`);
  } catch (error: any) {
    console.error('Error al eliminar asignatura:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar la asignatura');
  }
};

// ============================================
// SERVICIOS - SECCIONES
// ============================================

/**
 * Agregar sección a una asignatura
 */
export const agregarSeccionService = async (
  asignaturaId: string,
  seccion: Omit<ISeccionCreacion, 'idAsignatura'>
): Promise<IAsignatura> => {
  try {
    const payload = {
      idAsignatura: parseInt(asignaturaId),
      nombreSeccion: seccion.nombreSeccion,
      idUsuarioDocente: seccion.idUsuarioDocente,
      capacidadMaxInscritos: seccion.capacidadMaxInscritos,
      cantInscritos: seccion.cantInscritos,
      estadoSeccion: seccion.estadoSeccion || 'ACTIVA',
      bloquesHorarios: seccion.bloquesHorarios,
      crearSala: seccion.crearSala || false
    };

    await api.post('/seccion/create-seccion-frontend/', payload);

    // Recargar la asignatura completa
    const asignaturaActualizada = await obtenerAsignaturaPorIdService(asignaturaId);
    if (!asignaturaActualizada) {
      throw new Error('No se pudo encontrar la asignatura actualizada');
    }

    return asignaturaActualizada;
  } catch (error: any) {
    console.error('Error al agregar sección:', error);
    throw new Error(error.response?.data?.message || 'Error al agregar la sección');
  }
};

/**
 * Actualizar sección completa (incluye bloques horarios)
 */
export const actualizarSeccionService = async (
  asignaturaId: string,
  seccionId: string,
  seccion: SectionAnswerUpdateDTO
): Promise<IAsignatura> => {
  try {
    const bloquesSanitizados = seccion.bloquesHorarios?.map(b => ({
      numeroBloque: typeof b.numeroBloque === 'string' ? parseInt(b.numeroBloque) : b.numeroBloque,
      horaInicio: (b.horaInicio && b.horaInicio.length === 5) ? `${b.horaInicio}:00` : (b.horaInicio || '00:00:00'),
      horaFin: (b.horaFin && b.horaFin.length === 5) ? `${b.horaFin}:00` : (b.horaFin || '00:00:00'),
      diaSemana: b.diaSemana || 'LUNES',
      idSala: typeof b.idSala === 'string' ? parseInt(b.idSala) : (b.idSala || 0),
      codSala: b.codSala || '',
      nombreSala: b.nombreSala || ''
    })).filter(b => b.idSala > 0 && b.numeroBloque > 0) || [];

    const payload: SectionAnswerUpdateDTO = {
      idSeccion: parseInt(seccionId),
      idAsignatura: parseInt(asignaturaId),
      nombreSeccion: seccion.nombreSeccion,
      estadoSeccion: seccion.estadoSeccion,
      idDocente: seccion.idDocente,
      nombreCompletoDocente: seccion.nombreCompletoDocente || '',
      capacidadMaxInscritos: seccion.capacidadMaxInscritos,
      cantInscritos: seccion.cantInscritos,
      bloquesHorarios: bloquesSanitizados,
      crearSala: seccion.crearSala || false
    };

    const response = await api.put('/seccion/update-seccion-frontend/', payload);
    console.log('🔄 Update Response (Bloques):', response.data);

    // Recargar la asignatura completa
    const asignaturaActualizada = await obtenerAsignaturaPorIdService(asignaturaId);
    if (!asignaturaActualizada) {
      throw new Error('No se pudo encontrar la asignatura actualizada');
    }

    return asignaturaActualizada;
  } catch (error: any) {
    console.error('Error al actualizar sección:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar la sección');
  }
};

/**
 * Eliminar sección (soft delete)
 */
export const eliminarSeccionService = async (
  asignaturaId: string,
  seccionId: string
): Promise<IAsignatura> => {
  try {
    await api.put(`/seccion/soft-delete/${seccionId}`);

    // Recargar la asignatura completa
    const asignaturaActualizada = await obtenerAsignaturaPorIdService(asignaturaId);
    if (!asignaturaActualizada) {
      throw new Error('No se pudo encontrar la asignatura actualizada');
    }

    return asignaturaActualizada;
  } catch (error: any) {
    console.error('Error al eliminar sección:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar la sección');
  }
};

/**
 * Calcular total de alumnos de una asignatura
 */
export const calcularTotalAlumnosService = async (asignaturaId: string): Promise<number> => {
  try {
    const asignatura = await obtenerAsignaturaPorIdService(asignaturaId);
    if (!asignatura) return 0;

    return asignatura.secciones
      .filter(s => s.estado === 'ACTIVA')
      .reduce((sum, s) => sum + s.cantInscritos, 0);
  } catch (error) {
    console.error('Error al calcular total de alumnos:', error);
    return 0;
  }
};

/**
 * Filtra bloques ocupados por sala y día
 */
export const filtrarBloquesPorSalaYDiaService = async (
  diaSemana: DiaSemana,
  idSala: number
): Promise<IBloqueHorario[]> => {
  try {
    const payload = {
      diaSemana,
      idSala
    };


    const response = await api.post<BookTImeBlocksRequestDTO[]>(
      '/bloque-horario/filter-by-day-week-and-id-room/',
      payload
    );



    if (!response.data) return [];
    return response.data.map(transformarBloqueHorario);
  } catch (error: any) {
    console.error('Error al filtrar bloques:', error);
    return [];
  }
};