import React from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Pagination,
  Chip,
  Card,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  useDisclosure,
  Autocomplete,
  AutocompleteItem
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
// Services
import { obtenerProductosService } from '../services/producto-service';
import {
  crearMovimientoService,
  obtenerMovimientosFiltradosService
} from '../services/movimiento-service';
// Types
import { IProducto } from '../types/producto.types';
import { IMovimiento, TipoMovimiento } from '../types/movimiento.types';
// Contexts
import { useAuth } from '../contexts/auth-context';

/**
 * Interfaz para los parámetros de la URL.
 */
interface MovimientosParams {
  id?: string;
}

/**
 * Hook personalizado para obtener query params
 */
function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

/**
 * Página de movimientos de producto.
 * Muestra el historial de movimientos con filtros avanzados.
 */
const MovimientosProductoPage: React.FC = () => {
  const { id } = useParams<MovimientosParams>();
  const history = useHistory();
  const query = useQuery();
  const queryProductoId = query.get('productoId');
  const { user } = useAuth();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Estado de datos
  const [productos, setProductos] = React.useState<IProducto[]>([]);
  const [movimientos, setMovimientos] = React.useState<IMovimiento[]>([]);
  const [totalMovimientos, setTotalMovimientos] = React.useState<number>(0);
  const [productoActual, setProductoActual] = React.useState<IProducto | null>(null);

  // Estado de filtros
  // filtroProducto stores the PRODUCT ID
  const [filtroProducto, setFiltroProducto] = React.useState<string | null>(id || queryProductoId || 'todos');
  const [filtroTipo, setFiltroTipo] = React.useState<string>('todos');
  const [filtroOrden, setFiltroOrden] = React.useState<'reciente' | 'antiguo'>('reciente');
  const [filtroFecha, setFiltroFecha] = React.useState<string>('');

  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isLoadingMovimientos, setIsLoadingMovimientos] = React.useState<boolean>(true);

  // Pagination is handled by backend in slices? User example didn't show pagination params in body, 
  // but let's assume filtering returns all or we just slice locally for now if API doesn't support pagination params in body.
  const rowsPerPage = 10;

  /**
   * Carga la lista de productos para el filtro
   */
  React.useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await obtenerProductosService();
        setProductos(data);

        // Si hay un ID en la URL, buscamos ese producto para mostrar su info
        const targetId = id || queryProductoId;
        if (targetId) {
          const prod = data.find(p => p.id === targetId);
          if (prod) {
            setProductoActual(prod);
            setFiltroProducto(targetId);
          }
        }
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    };
    cargarProductos();
  }, [id, queryProductoId]);

  /**
   * Carga los movimientos basado en filtros
   */
  React.useEffect(() => {
    const cargarMovimientos = async () => {
      try {
        setIsLoadingMovimientos(true);

        // Determine product name for filter
        let nombreProductoFilter = 'todos';
        if (filtroProducto && filtroProducto !== 'todos') {
          const prod = productos.find(p => p.id === filtroProducto);
          if (prod) nombreProductoFilter = prod.nombre;
        }

        const ordenFilter = filtroOrden === 'antiguo' ? 'MAS_ANTIGUOS' : 'MAS_RECIENTES';

        const filterRequest: any = {
          tipoMovimiento: filtroTipo,
          orden: ordenFilter,
          fechaInicio: filtroFecha || undefined,
          fechaFin: filtroFecha || undefined
        };

        if (filtroProducto && filtroProducto !== 'todos') {
          const prod = productos.find(p => p.id === filtroProducto);
          // Backend filters strict by name.
          filterRequest.nombreProducto = prod ? prod.nombre : 'todos';

          // Ensure we don't send IDs if we want to rely on name match
          delete filterRequest.idProducto;
          delete filterRequest.idInventario;
        } else {
          filterRequest.nombreProducto = 'todos';
        }

        const data = await obtenerMovimientosFiltradosService(filterRequest);

        // Filter: Only show movements for products currently in active inventory
        const movimientosActivos = data.filter(m => {
          const mName = m.producto?.nombre || (m as any).nombreProducto;
          // Also check ID if available for robustness
          const mId = m.producto?.id || (m as any).idProducto;

          return productos.some(p => {
            if (mId && p.id === mId.toString()) return true;
            return p.nombre === mName;
          });
        });

        setMovimientos(movimientosActivos);
        setTotalMovimientos(movimientosActivos.length);

      } catch (error) {
        console.error('Error al cargar movimientos:', error);
      } finally {
        setIsLoadingMovimientos(false);
        setIsLoading(false);
      }
    };

    if (productos.length > 0) {
      cargarMovimientos();
    } else if (filtroProducto === 'todos' && productos.length === 0) {
      // Attempt to load even if products empty if it's 'todos', 
      // might fail finding name if logic strictly depends on it, but 'todos' is safe.
      // Better to just wait for products to ensure consistency.
    }
  }, [filtroProducto, filtroTipo, filtroOrden, filtroFecha, productos]);

  // Load initial if todos
  React.useEffect(() => {
    if (filtroProducto === 'todos' && productos.length === 0) {
      // Just let the previous effect handle it when products load.
    }
  }, []);


  /**
   * Actualiza el producto actual cuando cambia el filtro de producto
   */
  React.useEffect(() => {
    if (filtroProducto && filtroProducto !== 'todos') {
      const prod = productos.find(p => p.id === filtroProducto);
      setProductoActual(prod || null);
    } else {
      setProductoActual(null);
    }
  }, [filtroProducto, productos]);

  // Client-side pagination logic
  const paginatedMovimientos = React.useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return movimientos.slice(start, start + rowsPerPage);
  }, [movimientos, currentPage]);

  /**
   * Vuelve a la página de inventario.
   */
  const volverAInventario = () => {
    history.push('/inventario');
  };

  const renderTipoMovimiento = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA': return <Chip color="success" size="sm" variant="flat">Entrada</Chip>;
      case 'SALIDA': return <Chip color="danger" size="sm" variant="flat">Salida</Chip>;
      case 'AJUSTE': return <Chip color="warning" size="sm" variant="flat">Ajuste</Chip>;
      default: return <Chip size="sm">{tipo}</Chip>;
    }
  };

  const formatearFecha = (fechaISO: string) => {
    if (!fechaISO) return '-';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Encabezado y Filtros */}
        <Card className="shadow-sm">
          <CardBody className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">Movimientos de Inventario</h1>
                <p className="text-small text-default-500">Gestione y visualice el historial de movimientos.</p>
              </div>
              <Button
                variant="light"
                startContent={<Icon icon="lucide:arrow-left" />}
                onPress={volverAInventario}
              >
                Volver
              </Button>
            </div>

            {/* Fila de Filtros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Filtro Producto */}
              <div className="sm:col-span-2">
                <Autocomplete
                  label="Filtrar por Producto"
                  placeholder="Todos los productos"
                  selectedKey={filtroProducto}
                  onSelectionChange={(key) => {
                    setFiltroProducto(key as string);
                    setCurrentPage(1);
                  }}
                  defaultItems={productos}
                >
                  {(item) => <AutocompleteItem key={item.id}>{item.nombre}</AutocompleteItem>}
                </Autocomplete>
              </div>

              {/* Filtro Tipo */}
              <Select
                label="Tipo"
                selectedKeys={[filtroTipo]}
                onChange={(e) => {
                  setFiltroTipo(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <SelectItem key="todos">Todos</SelectItem>
                <SelectItem key="ENTRADA">Entrada</SelectItem>
                <SelectItem key="SALIDA">Salida</SelectItem>
                <SelectItem key="AJUSTE">Ajuste</SelectItem>
              </Select>

              {/* Filtro Orden */}
              <Select
                label="Orden"
                selectedKeys={[filtroOrden]}
                onChange={(e) => {
                  setFiltroOrden(e.target.value as any);
                  setCurrentPage(1);
                }}
              >
                <SelectItem key="reciente">Más Recientes</SelectItem>
                <SelectItem key="antiguo">Más Antiguos</SelectItem>
              </Select>

              {/* Filtro Fecha */}
              <Input
                type="date"
                label="Fecha Específica"
                placeholder="Seleccione fecha"
                value={filtroFecha}
                max={new Date().toISOString().split('T')[0]} // Restringir a fecha actual o anterior
                onValueChange={(val) => {
                  setFiltroFecha(val);
                  setCurrentPage(1);
                }}
              />
            </div>
          </CardBody>
        </Card>

        {/* Resumen del Producto (Solo si hay uno seleccionado) */}
        {productoActual && (
          <Card className="shadow-sm bg-primary-50 dark:bg-primary-900/20">
            <CardBody className="py-3 px-6 flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon icon="lucide:package" className="text-primary text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{productoActual.nombre}</h3>
                  <p className="text-sm text-default-500">Stock Actual: <span className="font-semibold">{productoActual.stock} {productoActual.unidadMedida}</span></p>
                </div>
              </div>
              <Button
                size="sm"
                color="primary"
                variant="flat"
                onPress={() => {
                  onOpen();
                }}
              >
                Nuevo Movimiento
              </Button>
            </CardBody>
          </Card>
        )}

        {/* Tabla de movimientos */}
        <Table
          aria-label="Tabla de movimientos"
          removeWrapper
          bottomContent={
            totalMovimientos > 0 ? (
              <div className="flex w-full justify-center">
                <Pagination
                  total={Math.ceil(totalMovimientos / rowsPerPage)}
                  page={currentPage}
                  onChange={setCurrentPage}
                  showControls
                />
              </div>
            ) : null
          }
        >
          <TableHeader>
            <TableColumn>PRODUCTO</TableColumn>
            <TableColumn>CATEGORÍA</TableColumn>
            <TableColumn>TIPO</TableColumn>
            <TableColumn>CANTIDAD</TableColumn>
            <TableColumn>FECHA</TableColumn>
            <TableColumn>RESPONSABLE</TableColumn>
            <TableColumn>OBSERVACIÓN</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={isLoadingMovimientos}
            loadingContent="Cargando movimientos..."
            emptyContent="No se encontraron movimientos"
          >
            {paginatedMovimientos.map((movimiento) => {
              // Helper to handle mixed/flat DTOs safely
              const m = movimiento as any;
              const prodName = movimiento.producto?.nombre || m.nombreProducto || 'Producto desconocido';
              const prodCat = movimiento.producto?.categoria || m.nombreCategoria || '-';
              const prodUnit = movimiento.producto?.unidadMedida || m.unidadMedida || '';
              const userName = movimiento.usuario?.nombreCompleto || m.nombreUsuario || m.responsable || 'Sistema';

              return (
                <TableRow key={movimiento.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{prodName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {prodCat}
                  </TableCell>
                  <TableCell>{renderTipoMovimiento(movimiento.tipoMovimiento)}</TableCell>
                  <TableCell>{movimiento.stockMovimiento} {prodUnit}</TableCell>
                  <TableCell>{formatearFecha(movimiento.fechaMovimiento)}</TableCell>
                  <TableCell>{userName}</TableCell>
                  <TableCell>{movimiento.observacion}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </motion.div>

      {/* Modal para nuevo movimiento */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <FormularioMovimiento
              inventarioId={productoActual?._idInventario ?? productoActual?.id ?? ''}
              userId={user?.id}
              onClose={() => {
                onClose();
                // Recargar página
                window.location.reload();
              }}
              unidadMedida={productoActual?.unidadMedida || ''}
            />
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

/**
 * Interfaz para las propiedades del componente FormularioMovimiento.
 */
interface FormularioMovimientoProps {
  inventarioId: string | number;
  userId?: string | number;
  onClose: () => void;
  unidadMedida: string;
}

/**
 * Componente de formulario para crear un nuevo movimiento.
 */
const FormularioMovimiento: React.FC<FormularioMovimientoProps> = ({ inventarioId, userId, onClose, unidadMedida }) => {
  const [tipo, setTipo] = React.useState<TipoMovimiento>('ENTRADA');
  const [cantidad, setCantidad] = React.useState<string>('');
  const [observacion, setObservacion] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  /**
   * Maneja el envío del formulario.
   */
  const handleSubmit = async () => {
    if (!cantidad || parseFloat(cantidad) <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }
    if (!userId) {
      alert('Error: Usuario no identificado');
      return;
    }

    try {
      setIsLoading(true);
      await crearMovimientoService({
        idUsuario: userId,
        idInventario: inventarioId,
        stockMovimiento: parseFloat(cantidad),
        tipoMovimiento: tipo,
        observacion
      });
      onClose();
    } catch (error) {
      console.error('Error al crear el movimiento:', error);
      alert('Error al crear el movimiento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ModalHeader>Nuevo Movimiento</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <Select
            label="Tipo de Movimiento"
            selectedKeys={[tipo]}
            onChange={(e) => setTipo(e.target.value as TipoMovimiento)}
          >
            <SelectItem key="ENTRADA">Entrada</SelectItem>
            <SelectItem key="SALIDA">Salida</SelectItem>
            <SelectItem key="AJUSTE">Ajuste</SelectItem>
          </Select>

          <Input
            type="number"
            label="Cantidad"
            placeholder="Ingrese la cantidad"
            value={cantidad}
            onValueChange={setCantidad}
            min="0.01"
            step="0.01"
            endContent={<span className="text-default-400">{unidadMedida}</span>}
          />

          <Input
            label="Observación"
            placeholder="Ingrese una observación"
            value={observacion}
            onValueChange={setObservacion}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="flat" onPress={onClose}>
          Cancelar
        </Button>
        <Button
          color="primary"
          onPress={handleSubmit}
          isLoading={isLoading}
          isDisabled={isLoading}
        >
          Guardar
        </Button>
      </ModalFooter>
    </>
  );
};

export default MovimientosProductoPage;
