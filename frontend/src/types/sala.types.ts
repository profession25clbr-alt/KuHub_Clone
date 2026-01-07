/**
 * TIPOS PARA GESTIÓN DE SALAS Y HORARIOS
 */

// Enumeración de días de la semana
export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO';

// Interfaz básica de Sala
export interface ISala {
    id: string; // Identificador único
    codigo: string; // e.g. "LG1-402"
    nombre: string; // e.g. "Bollería y Masas Dulces"
    capacidad: number; // Capacidad de alumnos
    descripcion?: string; // Descripción opcional
}

// Bloque horario estándar (definición estática del sistema)
export interface IBloqueSistema {
    id: number; // 1, 2, 3...
    horaInicio: string; // "08:01"
    horaFin: string; // "08:40"
}

// Representa una asignación en el horario (una celda en la grilla)
export interface IAsignacionHoraria {
    salaId: string;
    dia: DiaSemana;
    bloqueId: number;
    // Referencia a quien ocupa el bloque
    seccionId: string;
    asignaturaNombre: string;
    seccionNumero: string; // e.g. "018D"
    profesorNombre: string;
}

// Para creación de sala
export interface ISalaCreacion {
    codigo: string;
    nombre: string;
    capacidad?: number;
    descripcion?: string;
}

// Bloques horarios del sistema (Hardcoded based on typical schedules or user config)
export const BLOQUES_HORARIOS_SISTEMA: IBloqueSistema[] = [
    { id: 1, horaInicio: '08:01', horaFin: '08:40' },
    { id: 2, horaInicio: '08:41', horaFin: '09:20' },
    { id: 3, horaInicio: '09:31', horaFin: '10:10' },
    { id: 4, horaInicio: '10:11', horaFin: '10:50' },
    { id: 5, horaInicio: '11:01', horaFin: '11:40' },
    { id: 6, horaInicio: '11:41', horaFin: '12:20' },
    { id: 7, horaInicio: '12:31', horaFin: '13:10' },
    { id: 8, horaInicio: '13:11', horaFin: '13:50' },
    { id: 9, horaInicio: '14:01', horaFin: '14:40' },
    { id: 10, horaInicio: '14:41', horaFin: '15:20' },
    { id: 11, horaInicio: '15:31', horaFin: '16:10' },
    { id: 12, horaInicio: '16:11', horaFin: '16:50' },
    { id: 13, horaInicio: '17:01', horaFin: '17:40' },
    { id: 14, horaInicio: '17:41', horaFin: '18:20' },
    { id: 15, horaInicio: '18:21', horaFin: '19:00' },
    { id: 16, horaInicio: '19:11', horaFin: '19:50' },
    { id: 17, horaInicio: '19:51', horaFin: '20:30' },
    { id: 18, horaInicio: '20:41', horaFin: '21:20' },
    { id: 19, horaInicio: '21:21', horaFin: '22:00' },
    { id: 20, horaInicio: '22:11', horaFin: '22:50' }
];
