/**
 * TIPOS PARA SEMANAS ACADÉMICAS
 * 
 * Ubicación: src/types/semana.types.ts
 */

export interface ISemana {
    idSemana: number;
    numeroSemana: number;
    fechaInicio: string;
    fechaFin: string;
    anio: number;
    semestre: number;
    activo: boolean;
}
