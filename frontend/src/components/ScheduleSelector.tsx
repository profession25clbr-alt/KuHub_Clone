
import React from 'react';
import { Select, SelectItem, Checkbox, CheckboxGroup, Chip, Button } from '@heroui/react';
import { ISala, BLOQUES_HORARIOS_SISTEMA, DiaSemana } from '../types/sala.types';
import { IBloqueHorario } from '../types/asignatura.types';
import { obtenerAsignaturasService } from '../services/asignatura-service';
import { obtenerSalasService } from '../services/sala-service';

interface ScheduleSelectorProps {
    value: IBloqueHorario[];
    onChange: (value: IBloqueHorario[]) => void;
    initialBlocks?: IBloqueHorario[]; // To allow re-selecting own blocks
}

const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({ value, onChange, initialBlocks = [] }) => {
    const [salas, setSalas] = React.useState<ISala[]>([]);
    const [occupiedSlots, setOccupiedBlocks] = React.useState<Set<number>>(new Set());

    const [selectedSalaId, setSelectedSalaId] = React.useState<string>('');
    const [selectedDay, setSelectedDay] = React.useState<DiaSemana>('LUNES');
    const [selectedBlocks, setSelectedBlocks] = React.useState<string[]>([]);

    React.useEffect(() => {
        // Load static data
        obtenerSalasService().then(setSalas);
    }, []);

    React.useEffect(() => {
        if (!selectedSalaId || !selectedDay) return;

        // Find current sala code
        const currentSala = salas.find(s => s.id === selectedSalaId);
        const currentCode = currentSala?.codigo;

        // Fetch ALL asignaturas and filter locally to ensure consistency with "Big Board"
        obtenerAsignaturasService().then(asignaturas => {
            const occupied = new Set<number>();

            asignaturas.forEach(asig => {
                asig.secciones.forEach(sec => {
                    // Start of self-check: We don't mark blocks from our own section as occupied.
                    // But here we don't have excludeSectionId nor initialBlocks (as IDs).
                    // We handle "My Assignment" in the render.
                    // So we mark ALL occupied here.

                    sec.bloquesHorarios.forEach(b => {
                        if (b.diaSemana !== selectedDay) return;

                        // Match by ID or Code (Robustness)
                        const matchId = b.idSala === parseInt(selectedSalaId);
                        const matchCode = currentCode && b.codSala === currentCode;

                        if (matchId || matchCode) {
                            occupied.add(b.numeroBloque);
                        }
                    });
                });
            });
            setOccupiedBlocks(occupied);
        });
    }, [selectedSalaId, selectedDay, salas]);

    const handleAdd = () => {
        const sala = salas.find(s => s.id === selectedSalaId);
        if (!sala) return;

        const newBlocks: IBloqueHorario[] = selectedBlocks.map(blockIdStr => {
            const blockId = parseInt(blockIdStr);
            const sysBlock = BLOQUES_HORARIOS_SISTEMA.find(b => b.id === blockId);
            return {
                numeroBloque: blockId,
                horaInicio: sysBlock?.horaInicio || '',
                horaFin: sysBlock?.horaFin || '',
                diaSemana: selectedDay,
                idSala: parseInt(sala.id), // Assuming id is numeric-ish string, but interface says number.
                // Backend expects idSala as number. Our Sala service uses string IDs "Date.now()".
                // This is a disconnect. I'll cast it for now or fix types. 
                // Let's assume we can map it or keep it consistent.
                codSala: sala.codigo,
                nombreSala: sala.nombre
            };
        });

        // Merge with existing
        onChange([...value, ...newBlocks]);
        setSelectedBlocks([]);
    };

    const handleRemove = (index: number) => {
        const newVal = [...value];
        newVal.splice(index, 1);
        onChange(newVal);
    };

    const currentSala = salas.find(s => s.id === selectedSalaId);

    return (
        <div className="space-y-4 border p-4 rounded-lg bg-default-50">
            <h4 className="font-bold text-sm">Agregar Horario</h4>
            <div className="grid grid-cols-2 gap-2">
                <Select
                    label="Sala"
                    selectedKeys={selectedSalaId ? [selectedSalaId] : []}
                    onSelectionChange={(keys) => setSelectedSalaId(Array.from(keys)[0] as string)}
                    disableAnimation
                >
                    {salas.map(s => <SelectItem key={s.id} textValue={s.nombre}>{s.codigo} - {s.nombre}</SelectItem>)}
                </Select>
                <Select
                    label="Día"
                    selectedKeys={[selectedDay]}
                    onSelectionChange={(keys) => setSelectedDay(Array.from(keys)[0] as DiaSemana)}
                    disableAnimation
                >
                    {['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'].map(d => <SelectItem key={d}>{d}</SelectItem>)}
                </Select>
            </div>

            <div className="max-h-40 overflow-y-auto border border-default-200 rounded p-2 bg-content1">
                {!selectedSalaId ? <p className="text-xs text-center text-gray-400">Seleccione una sala</p> : (
                    <CheckboxGroup label="Bloques Disponibles" value={selectedBlocks} onValueChange={setSelectedBlocks}>
                        {BLOQUES_HORARIOS_SISTEMA.map(b => {
                            const isTaken = occupiedSlots.has(b.id);
                            // Allow checking if it's in our INITIAL blocks (we own it)
                            const isMine = initialBlocks.some(ib =>
                                ib.idSala === parseInt(selectedSalaId) &&
                                ib.diaSemana === selectedDay &&
                                ib.numeroBloque === b.id
                            );
                            const isDisabled = isTaken && !isMine;

                            return (
                                <Checkbox key={b.id} value={b.id.toString()} isDisabled={isTaken}>
                                    <div className="flex flex-col">
                                        <span className={`text-small ${isTaken ? 'text-danger line-through' : 'text-foreground'}`}>
                                            Bloque {b.id}
                                        </span>
                                        <span className={`text-tiny text-default-500`}>
                                            {b.horaInicio} - {b.horaFin} {isTaken ? (isMine ? '(Tu asignación)' : '(Ocupado)') : ''}
                                        </span>
                                    </div>
                                </Checkbox>
                            );
                        })}
                    </CheckboxGroup>
                )}
            </div>
            <Button size="sm" color="primary" onPress={handleAdd} isDisabled={selectedBlocks.length === 0}>
                Agregar Bloques Seleccionados
            </Button>

            <div className="mt-4">
                <h4 className="font-bold text-sm mb-2">Horario Asignado</h4>
                <div className="flex flex-wrap gap-2">
                    {value.map((b, idx) => (
                        <Chip key={idx} onClose={() => handleRemove(idx)} variant="flat" color="secondary">
                            {b.diaSemana} B{b.numeroBloque} ({b.codSala})
                        </Chip>
                    ))}
                    {value.length === 0 && <span className="text-xs text-default-400">Sin asignar</span>}
                </div>
            </div>
        </div>
    );
};

export default ScheduleSelector;
