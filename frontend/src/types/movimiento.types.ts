import { IProducto } from './producto.types';
import { IUsuario } from './usuario.types';

export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export interface IMovimiento {
    id: number;
    producto: IProducto;
    usuario: IUsuario;
    stockMovimiento: number;
    tipoMovimiento: TipoMovimiento;
    observacion: string;
    fechaMovimiento: string;
}

export interface CreateMovimientoRequest {
    idUsuario: string | number;
    idInventario: string | number;
    stockMovimiento: number;
    tipoMovimiento: TipoMovimiento;
    observacion: string;
}

export interface MovimientoFilterRequest {
    nombreProducto: string; // "todos" o nombre
    tipoMovimiento: string | null; // "todos" si es null, o el valor
    orden: 'MAS_RECIENTES' | 'MAS_ANTIGUOS' | null; // Default MAS_RECIENTES
    idProducto?: string | number;
    idInventario?: string | number;
    fechaInicio?: string | null;
    fechaFin?: string | null;
}
