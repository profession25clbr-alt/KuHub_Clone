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
    nombreProducto: string;
    tipoMovimiento: string; // 'todos' | TipoMovimiento
    orden: 'MAS_RECIENTES' | 'MAS_ANTIGUOS';
    idProducto?: string | number;
    idInventario?: string | number;
    fechaInicio?: string;
    fechaFin?: string;
}
