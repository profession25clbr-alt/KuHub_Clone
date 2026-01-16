import React from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Card,
  CardBody,
  Input,
  Chip,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
  Textarea,
  Select,
  SelectItem
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useToast, useConfirm } from '../hooks/useToast';
import { useAuth } from '../contexts/auth-context';

// IMPORTAR TIPOS Y SERVICIOS
import { IReceta, IItemReceta, IGuardarReceta } from '../types/receta.types';
import { IProducto } from '../types/producto.types';
import {
  obtenerRecetasService,
  crearRecetaService,
  actualizarRecetaService,
  cambiarEstadoRecetaService,
  eliminarRecetaService,
} from '../services/receta-service';
import { obtenerProductosService } from '../services/producto-service';

/**
 * Página de gestión de recetas conectada al backend.
 */
const GestionRecetasPage: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const { user } = useAuth();
  const esSoloLectura = user?.rol === 'Profesor';
  const esAdministrador = user?.rol === 'Administrador';

  const [recetas, setRecetas] = React.useState<IReceta[]>([]);
  const [productos, setProductos] = React.useState<IProducto[]>([]);
  const [filteredRecetas, setFilteredRecetas] = React.useState<IReceta[]>([]);
  const [recetaSeleccionada, setRecetaSeleccionada] = React.useState<IReceta | null>(null);
  const [modalMode, setModalMode] = React.useState<'crear' | 'editar' | 'ver'>('crear');
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const rowsPerPage = 5;

  // Cargar recetas y productos al montar el componente
  React.useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const [recetasCargadas, productosCargados] = await Promise.all([
        obtenerRecetasService(),
        obtenerProductosService()
      ]);
      setRecetas(recetasCargadas);
      setProductos(productosCargados);
      console.log('📋 Recetas cargadas:', recetasCargadas.length);
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      toast.error('Error al cargar las recetas');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    let filtered = [...recetas];
    if (searchTerm) {
      filtered = filtered.filter(receta =>
        receta.nombreReceta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (receta.descripcionReceta && receta.descripcionReceta.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredRecetas(filtered);
    setCurrentPage(1);
  }, [searchTerm, recetas]);

  const paginatedRecetas = React.useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredRecetas.slice(start, end);
  }, [currentPage, filteredRecetas, rowsPerPage]);

  const handleNuevaReceta = () => {
    setModalMode('crear');
    setRecetaSeleccionada(null);
    onOpen();
  };

  const handleEditarReceta = (receta: IReceta) => {
    setModalMode('editar');
    setRecetaSeleccionada(receta);
    onOpen();
  };

  const handleVerReceta = (receta: IReceta) => {
    setModalMode('ver');
    setRecetaSeleccionada(receta);
    onOpen();
  };

  const cambiarEstadoReceta = async (id: number, nuevoEstado: 'ACTIVO' | 'INACTIVO') => {
    try {
      console.log(`🔄 Cambiando estado de receta ${id} a ${nuevoEstado}`);
      await cambiarEstadoRecetaService(id, nuevoEstado === 'ACTIVO');
      await cargarDatos();
      toast.success(`Receta ${nuevoEstado === 'ACTIVO' ? 'activada' : 'desactivada'} correctamente`);
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
      toast.error('Error al cambiar el estado de la receta');
    }
  };

  const handleGuardarReceta = async (recetaData: IGuardarReceta) => {
    try {
      if (modalMode === 'crear') {
        console.log('📝 Creando nueva receta:', recetaData.nombreReceta);

        // Mapear IGuardarReceta a ICrearRecetaPayload
        const payload: any = {
          nombreReceta: recetaData.nombreReceta,
          descripcionReceta: recetaData.descripcionReceta,
          instrucciones: recetaData.instrucciones,
          estadoReceta: recetaData.estadoReceta,
          listaItems: recetaData.listaItems
        };

        await crearRecetaService(payload);
        toast.success('Receta creada correctamente');
      } else if (modalMode === 'editar' && recetaSeleccionada) {
        console.log('✏️ Actualizando receta:', recetaData.nombreReceta);

        // Lógica de diferencias para IActualizarRecetaPayload
        const itemsOriginales = recetaSeleccionada.listaItems || [];
        const itemsNuevos = recetaData.listaItems || [];

        // 1. Items Agregados
        const itemsAgregados = itemsNuevos.filter(nuevo =>
          !itemsOriginales.some(orig => orig.idProducto === nuevo.idProducto)
        );

        // 2. Items Modificados
        const itemsModificados = itemsNuevos.filter(nuevo => {
          const original = itemsOriginales.find(orig => orig.idProducto === nuevo.idProducto);
          if (!original) return false;
          return original.cantUnidadMedida !== nuevo.cantUnidadMedida;
        });

        // 3. IDs Items Eliminados
        const idsItemsEliminados = itemsOriginales
          .filter(orig => !itemsNuevos.some(nuevo => nuevo.idProducto === orig.idProducto))
          .map(orig => orig.idProducto);

        // Construir payload
        const payload: any = {
          idReceta: recetaSeleccionada.idReceta,
          cambioReceta: true,
          nombreReceta: recetaData.nombreReceta,
          descripcionReceta: recetaData.descripcionReceta,
          instrucciones: recetaData.instrucciones,
          estadoReceta: recetaData.estadoReceta,
          itemsAgregados: itemsAgregados,
          itemsModificados: itemsModificados,
          idsItemsEliminados: idsItemsEliminados
        };

        await actualizarRecetaService(payload);
        toast.success('Receta actualizada correctamente');
      }
      await cargarDatos();
    } catch (error: any) {
      console.error('❌ Error al guardar receta:', error);
      toast.error(error.message || 'Error al guardar la receta');
    }
  };

  const handleEliminarReceta = async (receta: IReceta) => {
    if (!esAdministrador) {
      toast.warning('Solo el rol Administrador puede eliminar recetas.');
      return;
    }

    const confirmado = await confirm(
      `Eliminarás definitivamente la receta "${receta.nombreReceta}".`,
      {
        title: 'Eliminar receta',
        confirmText: 'Eliminar',
        confirmColor: 'danger',
        requireText: 'ELIMINAR',
        requireTextHelper: 'Esta acción es irreversible. Escribe ELIMINAR para confirmar.',
      }
    );

    if (!confirmado) return;

    try {
      await eliminarRecetaService(receta.idReceta);
      toast.success('Receta eliminada correctamente');
      await cargarDatos();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la receta');
    }
  };

  const renderEstado = (estado: string) => {
    switch (estado) {
      case 'ACTIVO': return <Chip color="success" size="sm">ACTIVA</Chip>;
      case 'INACTIVO': return <Chip color="danger" size="sm">INACTIVA</Chip>;
      default: return <Chip size="sm">{estado}</Chip>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando recetas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestión de Recetas</h1>
            <p className="text-default-500">
              Administre las recetas base para las solicitudes de insumos.
            </p>
            {esSoloLectura && (
              <p className="text-xs text-default-400 mt-1">
                Rol Profesor: acceso de solo lectura. Para crear o modificar recetas, contacte al profesor a cargo.
              </p>
            )}
          </div>
          {!esSoloLectura && (
            <Button
              color="primary"
              startContent={<Icon icon="lucide:plus" />}
              onPress={handleNuevaReceta}
            >
              Nueva Receta
            </Button>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody className="text-center p-4">
              <p className="text-sm text-default-500">Total Recetas</p>
              <p className="text-3xl font-bold text-primary">{recetas.length}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center p-4">
              <p className="text-sm text-default-500">Activas</p>
              <p className="text-3xl font-bold text-success">
                {recetas.filter(r => r.estadoReceta === 'ACTIVO').length}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center p-4">
              <p className="text-sm text-default-500">Inactivas</p>
              <p className="text-3xl font-bold text-danger">
                {recetas.filter(r => r.estadoReceta === 'INACTIVO').length}
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Buscar recetas..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            startContent={<Icon icon="lucide:search" className="text-default-400" />}
            isClearable
            onClear={() => setSearchTerm('')}
            className="w-full md:w-64"
          />
        </div>

        {/* Tabla */}
        <Card className="shadow-sm">
          <CardBody className="p-0">
            <Table
              aria-label="Tabla de recetas"
              removeWrapper
              bottomContent={
                filteredRecetas.length > rowsPerPage && (
                  <div className="flex w-full justify-center">
                    <Pagination
                      total={Math.ceil(filteredRecetas.length / rowsPerPage)}
                      page={currentPage}
                      onChange={setCurrentPage}
                      showControls
                    />
                  </div>
                )
              }
            >
              <TableHeader>
                <TableColumn>NOMBRE</TableColumn>
                <TableColumn>DESCRIPCIÓN</TableColumn>
                <TableColumn>INGREDIENTES</TableColumn>
                <TableColumn>ESTADO</TableColumn>
                <TableColumn>ACCIONES</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No se encontraron recetas">
                {paginatedRecetas.map((receta) => (
                  <TableRow key={receta.idReceta}>
                    <TableCell>
                      <p className="font-medium">{receta.nombreReceta}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-default-500 line-clamp-2">
                        {receta.descripcionReceta || '-'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {(receta.listaItems?.length || 0)} ingredientes
                      </Chip>
                    </TableCell>
                    <TableCell>{renderEstado(receta.estadoReceta)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          onPress={() => handleVerReceta(receta)}
                        >
                          <Icon icon="lucide:eye" className="text-primary" />
                        </Button>
                        {!esSoloLectura && (
                          <>
                            <Button
                              isIconOnly
                              variant="light"
                              size="sm"
                              isDisabled // Deshabilitado porque falta endpoint de edición de contenido
                              title="Edición no disponible por el momento"
                              onPress={() => handleEditarReceta(receta)}
                            >
                              <Icon icon="lucide:edit" className="text-default-300" />
                            </Button>
                            <Button
                              isIconOnly
                              variant="light"
                              size="sm"
                              onPress={() => cambiarEstadoReceta(
                                receta.idReceta,
                                receta.estadoReceta === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
                              )}
                            >
                              <Icon
                                icon={receta.estadoReceta === 'ACTIVO' ? 'lucide:x' : 'lucide:check'}
                                className={receta.estadoReceta === 'ACTIVO' ? 'text-danger' : 'text-success'}
                              />
                            </Button>
                            {esAdministrador && (
                              <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                                onPress={() => handleEliminarReceta(receta)}
                              >
                                <Icon icon="lucide:trash" className="text-danger" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </motion.div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <DetalleReceta
              receta={recetaSeleccionada}
              mode={modalMode}
              productos={productos}
              onClose={onClose}
              onSave={async (recetaData) => {
                try {
                  await handleGuardarReceta(recetaData);
                  onClose();
                } catch (error) {
                  // Error ya manejado
                }
              }}
            />
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

interface DetalleRecetaProps {
  receta: IReceta | null;
  mode: 'crear' | 'editar' | 'ver';
  productos: IProducto[];
  onClose: () => void;
  onSave: (receta: IGuardarReceta) => Promise<void>;
}

const DetalleReceta: React.FC<DetalleRecetaProps> = ({ receta, mode, productos, onClose, onSave }) => {
  const [isSaving, setIsSaving] = React.useState(false);
  const formRef = React.useRef<any>(null);

  const handleSubmit = async () => {
    if (formRef.current) {
      setIsSaving(true);
      try {
        await formRef.current.submit();
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <>
      <ModalHeader>
        {mode === 'crear' ? '➕ Nueva Receta' : mode === 'editar' ? '✏️ Editar Receta' : '👁️ Detalle de Receta'}
      </ModalHeader>
      <ModalBody>
        {mode === 'ver' ? (
          receta && <VistaReceta receta={receta} />
        ) : (
          <FormularioReceta
            ref={formRef}
            receta={receta}
            productos={productos}
            onSave={onSave}
          />
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="flat" onPress={onClose} isDisabled={isSaving}>
          {mode === 'ver' ? 'Cerrar' : 'Cancelar'}
        </Button>
        {mode !== 'ver' && (
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isSaving}
            isDisabled={isSaving}
          >
            {mode === 'crear' ? 'Crear Receta' : 'Guardar Cambios'}
          </Button>
        )}
      </ModalFooter>
    </>
  );
};

interface VistaRecetaProps {
  receta: IReceta;
}

const VistaReceta: React.FC<VistaRecetaProps> = ({ receta }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">{receta.nombreReceta}</h3>
        {receta.descripcionReceta && (
          <p className="text-default-500">{receta.descripcionReceta}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-default-500">Estado</p>
          <Chip color={receta.estadoReceta === 'ACTIVO' ? 'success' : 'danger'} size="sm">
            {receta.estadoReceta}
          </Chip>
        </div>
        <div>
          <p className="text-sm text-default-500">Ingredientes</p>
          <p className="font-medium">{(receta.listaItems?.length || 0)} ingredientes</p>
        </div>
      </div>

      <Divider />

      <div>
        <h4 className="font-semibold mb-3">📦 Ingredientes</h4>
        <Table aria-label="Ingredientes" removeWrapper>
          <TableHeader>
            <TableColumn>INGREDIENTE</TableColumn>
            <TableColumn>CANTIDAD</TableColumn>
          </TableHeader>
          <TableBody>
            {(receta.listaItems || []).map((item, idx) => (
              <TableRow key={item.idProducto + '-' + idx}>
                <TableCell>{item.nombreProducto}</TableCell>
                <TableCell className="font-semibold">
                  {item.cantUnidadMedida} {item.unidadMedida}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Divider />

      <div>
        <h4 className="font-semibold mb-3">📝 Instrucciones</h4>
        <div className="whitespace-pre-line bg-default-50 p-4 rounded-md text-sm">
          {receta.instrucciones || 'Sin instrucciones'}
        </div>
      </div>
    </div>
  );
};

interface FormularioRecetaProps {
  receta: IReceta | null;
  productos: IProducto[];
  onSave: (receta: IGuardarReceta) => Promise<void>;
}

const FormularioReceta = React.forwardRef<any, FormularioRecetaProps>(
  ({ receta, productos, onSave }, ref) => {
    const toast = useToast();
    const [nombre, setNombre] = React.useState(receta?.nombreReceta || '');
    const [descripcion, setDescripcion] = React.useState(receta?.descripcionReceta || '');
    const [instrucciones, setInstrucciones] = React.useState(receta?.instrucciones || '');
    const [estado, setEstado] = React.useState<'ACTIVO' | 'INACTIVO'>(receta?.estadoReceta || 'ACTIVO');

    // Convertir de IItemReceta a la estructura editable si es necesario, por ahora usamos la misma
    const [items, setItems] = React.useState<IItemReceta[]>(receta?.listaItems || []);

    React.useImperativeHandle(ref, () => ({
      submit: async () => {
        // Validaciones
        if (!nombre.trim()) {
          toast.warning('El nombre de la receta es obligatorio');
          throw new Error('El nombre es requerido');
        }
        if (items.length === 0) {
          toast.warning('Debe agregar al menos un ingrediente');
          throw new Error('Debe agregar al menos un ingrediente');
        }

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (!item.idProducto) {
            toast.warning(`Seleccione un producto para el ingrediente ${i + 1}`);
            throw new Error('Producto no seleccionado');
          }
          if (item.cantUnidadMedida <= 0) {
            toast.warning(`La cantidad del ingrediente ${i + 1} debe ser mayor a 0`);
            throw new Error('Cantidad inválida');
          }
        }

        const recetaData: IGuardarReceta = {
          idReceta: receta?.idReceta,
          nombreReceta: nombre.trim(),
          descripcionReceta: descripcion.trim(),
          listaItems: items,
          instrucciones: instrucciones.trim(),
          estadoReceta: estado
        };

        await onSave(recetaData);
      }
    }));

    const agregarIngrediente = () => {
      const nuevoItem: IItemReceta = {
        idProducto: 0,
        nombreProducto: '',
        cantUnidadMedida: 0,
        unidadMedida: '',
        activo: true
      };
      setItems([...items, nuevoItem]);
    };

    const actualizarItem = (index: number, campo: keyof IItemReceta, valor: any) => {
      const nuevosItems = [...items];

      if (campo === 'idProducto') {
        const producto = productos.find(p => p.id === valor); // productos.id es string, valor es string del select
        if (producto) {
          nuevosItems[index] = {
            ...nuevosItems[index],
            idProducto: Number(producto.id), // Asumimos que id es numérico o compatible, backend pide number
            nombreProducto: producto.nombre,
            unidadMedida: producto.unidadMedida
          };
        }
      } else {
        nuevosItems[index] = {
          ...nuevosItems[index],
          [campo]: valor
        };
      }

      setItems(nuevosItems);
    };

    const eliminarItem = (index: number) => {
      setItems(items.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-4">
        <Input
          label="Nombre de la Receta"
          placeholder="Ej: Pan Amasado"
          value={nombre}
          onValueChange={setNombre}
          isRequired
          variant="bordered"
        />

        <Textarea
          label="Descripción (Opcional)"
          placeholder="Descripción breve..."
          value={descripcion}
          onValueChange={setDescripcion}
          variant="bordered"
          minRows={2}
        />

        <Divider />

        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold">📦 Ingredientes</h4>
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Icon icon="lucide:plus" />}
              onPress={agregarIngrediente}
            >
              Agregar
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="text-center p-8 bg-default-50 rounded-lg">
              <Icon icon="lucide:package-open" className="text-default-300 text-4xl mx-auto mb-2" />
              <p className="text-default-500 text-sm">
                No hay ingredientes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <Card key={index} shadow="none" className="border-2 border-default-200">
                  <CardBody className="p-3">
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto_auto] gap-3 items-end">
                      <Select
                        label="Producto"
                        placeholder="Seleccione producto"
                        selectedKeys={item.idProducto ? [item.idProducto.toString()] : []}
                        onSelectionChange={(keys) => actualizarItem(index, 'idProducto', Array.from(keys)[0])}
                        size="sm"
                        variant="bordered"
                        isRequired
                      >
                        {productos.map((producto) => (
                          <SelectItem key={producto.id}>
                            {producto.nombre}
                          </SelectItem>
                        ))}
                      </Select>

                      <Input
                        type="number"
                        label="Cantidad"
                        placeholder="0"
                        value={item.cantUnidadMedida.toString()}
                        onValueChange={(val) => actualizarItem(index, 'cantUnidadMedida', parseFloat(val) || 0)}
                        size="sm"
                        variant="bordered"
                        min="0"
                        step="0.01"
                        endContent={
                          <span className="text-xs text-default-400">
                            {item.unidadMedida || 'unidad'}
                          </span>
                        }
                      />

                      <span className="text-sm text-default-500 mb-2">
                        {item.unidadMedida || '-'}
                      </span>

                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        color="danger"
                        onPress={() => eliminarItem(index)}
                      >
                        <Icon icon="lucide:trash" />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Divider />

        <Textarea
          label="Instrucciones"
          value={instrucciones}
          onValueChange={setInstrucciones}
          variant="bordered"
          minRows={5}
        />

        <Select
          label="Estado"
          selectedKeys={[estado]}
          onSelectionChange={(keys) => setEstado(Array.from(keys)[0] as 'ACTIVO' | 'INACTIVO')}
          variant="bordered"
        >
          <SelectItem key="ACTIVO">Activa</SelectItem>
          <SelectItem key="INACTIVO">Inactiva</SelectItem>
        </Select>
      </div>
    );
  }
);

export default GestionRecetasPage;