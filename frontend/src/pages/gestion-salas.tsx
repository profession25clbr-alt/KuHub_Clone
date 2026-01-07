import React from 'react';
import {
    Card, CardBody, Button, Input, Modal, ModalContent, ModalHeader,
    ModalBody, ModalFooter, useDisclosure, Tabs, Tab, ScrollShadow, Tooltip
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/useToast';
import { ISala, ISalaCreacion, BLOQUES_HORARIOS_SISTEMA, DiaSemana } from '../types/sala.types';
import { obtenerSalasService, crearSalaService, actualizarSalaService, eliminarSalaService } from '../services/sala-service';
import { obtenerAsignaturasService } from '../services/asignatura-service';
import { IAsignatura } from '../types/asignatura.types';

const GestionSalasPage: React.FC = () => {
    const toast = useToast();
    const [salas, setSalas] = React.useState<ISala[]>([]);
    const [asignaturas, setAsignaturas] = React.useState<IAsignatura[]>([]);
    const [selectedDay, setSelectedDay] = React.useState<DiaSemana>('LUNES');
    const [isLoading, setIsLoading] = React.useState(true);

    // Modal Sala
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [editingSala, setEditingSala] = React.useState<ISala | null>(null);
    const [nombreSala, setNombreSala] = React.useState('');
    const [codSala, setCodSala] = React.useState('');


    const loadData = async () => {
        setIsLoading(true);
        try {
            const [salasData, asignaturasData] = await Promise.all([
                obtenerSalasService(),
                obtenerAsignaturasService()
            ]);
            setSalas(salasData);
            setAsignaturas(asignaturasData);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar datos');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        loadData();
    }, []);

    const handleSaveSala = async () => {
        try {
            if (editingSala) {
                await actualizarSalaService(editingSala.id, { nombre: nombreSala, codigo: codSala });
                toast.success('Sala actualizada');
            } else {
                await crearSalaService({ nombre: nombreSala, codigo: codSala });
                toast.success('Sala creada');
            }
            onOpenChange();
            loadData();
        } catch (e) {
            toast.error('Error al guardar sala');
        }
    };

    const handleDeleteSala = async (id: string) => {
        if (!confirm('¿Eliminar sala?')) return;
        try {
            await eliminarSalaService(id);
            toast.success('Sala eliminada');
            loadData();
        } catch (e) {
            toast.error('Error al eliminar');
        }
    };

    const openCreate = () => {
        setEditingSala(null);
        setNombreSala('');
        setCodSala('');
        onOpen();
    };

    const openEdit = (s: ISala) => {
        setEditingSala(s);
        setNombreSala(s.nombre);
        setCodSala(s.codigo);
        onOpen();
    };

    // Helper to find what Section occupies a [Room, Day, Block]
    const getOccupation = (salaCod: string, blockId: number, day: DiaSemana) => {
        for (const asig of asignaturas) {
            for (const sec of asig.secciones) {
                const match = sec.bloquesHorarios.find(b =>
                    b.codSala === salaCod &&
                    b.numeroBloque === blockId &&
                    b.diaSemana === day
                );
                if (match) {
                    return {
                        asignatura: asig.nombre,
                        seccion: sec.numeroSeccion,
                        profesor: sec.profesorAsignado
                    };
                }
            }
        }
        return null;
    };

    const DAYS: DiaSemana[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

    return (
        <div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Gestión de Salas y Horarios</h1>
                    <p className="text-default-500">Administre las salas físicas y visualice la ocupación horaria.</p>
                </div>
                <Button color="primary" startContent={<Icon icon="lucide:plus" />} onPress={openCreate}>
                    Nueva Sala
                </Button>
            </div>

            {/* Matrix View */}
            <Card className="flex-grow overflow-hidden flex flex-col">
                <CardBody className="p-0 flex flex-col h-full">
                    <div className="px-4 pt-4 pb-2 border-b border-default-200">
                        <Tabs
                            aria-label="Días"
                            selectedKey={selectedDay}
                            onSelectionChange={(k) => setSelectedDay(k as DiaSemana)}
                            color="primary"
                            variant="underlined"
                        >
                            {DAYS.map(d => <Tab key={d} title={d} value={d} />)}
                        </Tabs>
                    </div>

                    <ScrollShadow className="flex-grow w-full overflow-auto">
                        <div className="min-w-[1000px] pb-4">
                            {/* Header Row: Salas */}
                            <div className="flex border-b border-default-200 sticky top-0 z-10 bg-background">
                                <div className="w-16 flex-shrink-0 p-2 border-r border-default-200 bg-default-50 font-bold text-xs flex items-center justify-center">
                                    Bloque
                                </div>
                                {salas.map(sala => (
                                    <div key={sala.id} className="flex-1 p-2 border-r border-default-200 min-w-[120px] bg-default-50 text-center">
                                        <div className="font-bold text-sm">{sala.codigo}</div>
                                        <div className="text-xs text-default-500 truncate" title={sala.nombre}>{sala.nombre}</div>
                                        <div className="flex justify-center gap-1 mt-1">
                                            <button onClick={() => openEdit(sala)} className="text-primary hover:text-primary-600"><Icon icon="lucide:edit-2" width={14} /></button>
                                            <button onClick={() => handleDeleteSala(sala.id)} className="text-danger hover:text-danger-600"><Icon icon="lucide:trash" width={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Body: Time Blocks */}
                            {BLOQUES_HORARIOS_SISTEMA.map(bloque => (
                                <div key={bloque.id} className="flex border-b border-default-200 h-16">
                                    {/* Time Label */}
                                    <div className="w-16 flex-shrink-0 p-1 border-r border-default-200 bg-default-50 text-[10px] flex flex-col justify-center items-center text-center">
                                        <span className="font-bold">{bloque.id}</span>
                                        <span className="text-default-500 leading-tight">{bloque.horaInicio}<br />{bloque.horaFin}</span>
                                    </div>

                                    {/* Rooms Cells */}
                                    {salas.map(sala => {
                                        const occ = getOccupation(sala.codigo, bloque.id, selectedDay);
                                        return (
                                            <div key={sala.id} className="flex-1 border-r border-default-200 min-w-[120px] p-1 relative">
                                                {occ ? (
                                                    <Tooltip content={
                                                        <div className="px-1 py-2">
                                                            <div className="font-bold">{occ.asignatura}</div>
                                                            <div className="text-xs">Sección: {occ.seccion}</div>
                                                            <div className="text-xs italic">{occ.profesor}</div>
                                                        </div>
                                                    }>
                                                        <div className="w-full h-full bg-primary-100 dark:bg-primary-900/30 border-l-4 border-primary rounded-sm p-1 text-[10px] overflow-hidden cursor-pointer hover:brightness-95 transition-all">
                                                            <div className="font-bold truncate">{occ.asignatura}</div>
                                                            <div className="text-default-500 truncate">{occ.profesor}</div>
                                                        </div>
                                                    </Tooltip>
                                                ) : (
                                                    <div className="w-full h-full hover:bg-default-50 transition-colors"></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </ScrollShadow>
                </CardBody>
            </Card>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Gestión de Sala</ModalHeader>
                            <ModalBody>
                                <Input label="Código (ej: LG1-402)" value={codSala} onValueChange={setCodSala} isRequired />
                                <Input label="Nombre descriptivo" value={nombreSala} onValueChange={setNombreSala} isRequired />

                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>Cancelar</Button>
                                <Button color="primary" onPress={handleSaveSala}>Guardar</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default GestionSalasPage;
