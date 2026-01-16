/**
 * SERVICIO DE PRODUCTOS - ADAPTADO AL BACKEND
 * Ahora usa inventario-service para conectar con el backend real
 *
 * Ubicación: src/services/producto-service.ts
 */

import {
  IProducto,
  IMovimientoProducto,
  ICrearProducto,
  IActualizarProducto,
  ICrearMovimiento
} from '../types/producto.types';

// Importar el servicio real de inventario
import {
  obtenerProductosService as obtenerProductosBackend,
  eliminarProductoService as eliminarProductoBackend,
  obtenerProductoPorIdService as obtenerProductoPorIdBackend,
  crearProductoService as crearProductoBackend,
  actualizarProductoService as actualizarProductoBackend,
} from './inventario-service';

// Importar servicio real de movimientos
import {
  crearMovimientoService as crearMovimientoBackend,
  obtenerMovimientosFiltradosService as obtenerMovimientosBackend
} from './movimiento-service';
import { CreateMovimientoRequest, MovimientoFilterRequest, IMovimiento } from '../types/movimiento.types';

import { obtenerUsuarioActualService } from './auth-service';

/**
 * Obtiene la lista de productos del inventario desde el BACKEND REAL
 */
export const obtenerProductosService = async (): Promise<IProducto[]> => {
  return await obtenerProductosBackend();
};

/**
 * Obtiene un producto por su ID desde el BACKEND REAL
 */
export const obtenerProductoPorIdService = async (id: string): Promise<IProducto> => {
  return await obtenerProductoPorIdBackend(id);
};

/**
 * Crea un nuevo producto en el BACKEND REAL
 */
export const crearProductoService = async (productoData: ICrearProducto): Promise<IProducto> => {
  return await crearProductoBackend(productoData);
};

/**
 * Actualiza un producto existente en el BACKEND REAL
 */
export const actualizarProductoService = async (productoData: IActualizarProducto): Promise<IProducto> => {
  return await actualizarProductoBackend(productoData);
};

/**
 * Elimina un producto en el BACKEND REAL
 */
export const eliminarProductoService = async (id: string): Promise<boolean> => {
  return await eliminarProductoBackend(id);
};

/**
 * ========================================
 * MOVIMIENTOS - MANTIENEN LÓGICA LOCAL
 * ========================================
 */

/**
 * Filtros para la búsqueda de movimientos
 */
export interface IFiltrosMovimiento {
  productoId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  tipo?: 'Entrada' | 'Salida' | 'Merma';
  orden?: 'reciente' | 'antiguo' | 'cantidad_asc' | 'cantidad_desc';
}

/**
 * Obtiene los movimientos filtrados y paginados (LOCAL - HARDCODED)
 */
// ⚠️ CAMBIO: Usamos el servicio real conectado al backend

export const obtenerMovimientosFiltradosService = async (
  filtros: IFiltrosMovimiento,
  pagina: number = 1,
  limite: number = 10
): Promise<{ movimientos: IMovimientoProducto[], total: number }> => {
  console.log(`📋 Obteniendo movimientos filtrados (BACKEND)`, filtros);

  try {
    // Mapear filtros del frontend al request del backend
    const filterRequest: MovimientoFilterRequest = {
      nombreProducto: 'todos', // Por defecto 'todos' según requerimiento si no se especifica
      tipoMovimiento: filtros.tipo || null, // null es 'todos'
      orden: filtros.orden === 'antiguo' ? 'MAS_ANTIGUOS' : 'MAS_RECIENTES',
      fechaInicio: filtros.fechaInicio || null,
      fechaFin: filtros.fechaFin || null,
      idProducto: filtros.productoId === 'todos' ? undefined : filtros.productoId
    };

    // Llamada al backend
    const movimientosBackend = await obtenerMovimientosBackend(filterRequest);

    // Mapear respuesta del backend (IMovimiento) al formato del frontend (IMovimientoProducto)
    // Nota: Esto asume que el backend devuelve todos los resultados y paginamos localmente
    // O idealmente el backend soportaría paginación. Por ahora simulamos paginación sobre el resultado total.

    // Transformar datos
    const movimientosTransformados: IMovimientoProducto[] = movimientosBackend.map((m: IMovimiento) => ({
      id: m.id.toString(),
      productoId: m.producto.id, // Asumiendo estructura de IProducto
      productoNombre: m.producto.nombre,
      tipo: m.tipoMovimiento === 'ENTRADA' ? 'Entrada' : m.tipoMovimiento === 'SALIDA' ? 'Salida' : 'Merma', // Ajustar enum según respuesta
      cantidad: m.stockMovimiento,
      fechaMovimiento: m.fechaMovimiento,
      responsable: m.usuario?.nombreCompleto || 'Sistema',
      observacion: m.observacion
    }));

    const total = movimientosTransformados.length;
    const inicio = (pagina - 1) * limite;
    const fin = inicio + limite;
    const movimientosPaginados = movimientosTransformados.slice(inicio, fin);

    return {
      movimientos: movimientosPaginados,
      total
    };

  } catch (error) {
    console.error('❌ Error al obtener movimientos:', error);
    // Fallback silencioso o throw según preferencia.
    return { movimientos: [], total: 0 };
  }
};

/**
 * Obtiene los movimientos de un producto (Mantiene compatibilidad, usa el nuevo servicio)
 */
export const obtenerMovimientosProductoService = async (
  productoId: string,
  pagina: number = 1,
  limite: number = 10
): Promise<{ movimientos: IMovimientoProducto[], total: number }> => {
  return obtenerMovimientosFiltradosService(
    { productoId, orden: 'reciente' },
    pagina,
    limite
  );
};

/**
 * Crea un nuevo movimiento de producto (LOCAL - HARDCODED)
 */
// ⚠️ CAMBIO: Usamos el servicio real conectado al backend

export const crearMovimientoService = async (movimientoData: ICrearMovimiento): Promise<IMovimientoProducto> => {
  console.log("📝 Creando movimiento (BACKEND):", movimientoData.tipo, movimientoData.cantidad);

  // Obtener usuario actual
  const usuario = obtenerUsuarioActualService();
  if (!usuario) throw new Error("Usuario no autenticado");

  // Primero necesitamos obtener el ID de inventario del producto
  // Usamos el servicio de producto para esto, asumiendo que podemos obtener el producto por ID
  // O el frontend ya debería tener el ID de inventario.
  // Dado que ICrearMovimiento solo tiene productoId, necesitamos resolver idInventario.

  // Opción 1: Obtener producto para sacar idInventario
  const producto = await obtenerProductoPorIdBackend(movimientoData.productoId);
  const idInventario = (producto as any)._idInventario;

  if (!idInventario) throw new Error("No se pudo obtener el ID de Inventario para el producto");

  try {
    const request: CreateMovimientoRequest = {
      idUsuario: usuario.id,
      idInventario: idInventario,
      stockMovimiento: movimientoData.cantidad,
      tipoMovimiento: movimientoData.tipo === 'Entrada' ? 'ENTRADA' : movimientoData.tipo === 'Salida' ? 'SALIDA' : 'AJUSTE', // Mapear tipos
      observacion: movimientoData.observacion
    };

    const nuevoMovimiento = await crearMovimientoBackend(request);

    console.log(`✅ Movimiento creado en backend: ID ${nuevoMovimiento.id}`);

    // Adaptar respuesta al formato del frontend
    return {
      id: nuevoMovimiento.id.toString(),
      productoId: nuevoMovimiento.producto.id,
      productoNombre: nuevoMovimiento.producto.nombre,
      tipo: movimientoData.tipo,
      cantidad: nuevoMovimiento.stockMovimiento,
      fechaMovimiento: nuevoMovimiento.fechaMovimiento,
      responsable: nuevoMovimiento.usuario?.nombreCompleto || usuario.nombreCompleto,
      observacion: nuevoMovimiento.observacion
    };

  } catch (error) {
    console.error('❌ Error al crear movimiento:', error);
    throw error;
  }
};