package KuHub.modules.gestion_academica.sevice;

import KuHub.modules.gestion_academica.dtos.dtoentity.SeccionEntityResponseDTO;
import KuHub.modules.gestion_academica.dtos.dtomodel.BookTImeBlocksRequestDTO;
import KuHub.modules.gestion_academica.dtos.dtomodel.SectionCreateDTO;
import KuHub.modules.gestion_academica.entity.BloqueHorario;
import KuHub.modules.gestion_academica.entity.ReservaSala;
import KuHub.modules.gestion_academica.entity.Sala;
import KuHub.modules.gestion_academica.entity.Seccion;
import KuHub.modules.gestion_academica.exceptions.SeccionException;
import KuHub.modules.gestion_academica.repository.SeccionRepository;
import KuHub.modules.gestionusuario.dtos.UsuarioResponseDTO;
import KuHub.modules.gestionusuario.service.UsuarioService;
import KuHub.utils.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SeccionServiceImp implements SeccionService{

    @Autowired
    private SeccionRepository seccionRepository;

    @Autowired
    private AsignaturaService asignaturaService;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private SalaService salaService;

    @Autowired
    private ReservaSalaService reservaSalaService;

    @Autowired
    private BloqueHorarioService bloqueHorarioService;

    @Transactional(readOnly = true)
    @Override
    public SeccionEntityResponseDTO findById(Integer id) {
        Seccion seccion = seccionRepository.findById(id).orElseThrow(
                () -> new SeccionException("La seccion con el id: " + id + " no existe")
        );
        return convertirADTO(seccion);
    }

    @Transactional
    @Override
    public SeccionEntityResponseDTO findByIdAndActiveIsTrue(Integer id){
        Seccion seccion = seccionRepository.findByIdSeccionAndActivoTrue(id).orElseThrow(
                () -> new SeccionException("La seccion con el id: " + id + " no existe")
        );
        return convertirADTO(seccion);
    }

    @Transactional(readOnly = true)
    @Override
    public List<SeccionEntityResponseDTO> findAll() {
        return seccionRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public List<SeccionEntityResponseDTO> findAllByActivoTrue(){
        return seccionRepository.findAllByActivoTrue()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public SeccionEntityResponseDTO save(Seccion seccion) {
        if (seccion.getAsignatura() == null || seccion.getAsignatura().getIdAsignatura() == null) {
            throw new SeccionException("Debe indicar una asignatura válida");
        }

        if(!asignaturaService.existsByIdAsignaturaAndTrue(seccion.getAsignatura().getIdAsignatura())){
            throw new SeccionException("La asignatura con el id: " + seccion.getAsignatura().getIdAsignatura() + " no existe");
        }

        if (seccion.getNombreSeccion() == null || seccion.getNombreSeccion().isBlank()) {
            throw new SeccionException("El nombre de la sección no puede estar vacío");
        }

        String parsearNombre = StringUtils.normalizeSpaces(seccion.getNombreSeccion());
        if(seccionRepository.existsByAsignatura_IdAsignaturaAndNombreSeccion(seccion.getAsignatura().getIdAsignatura(), parsearNombre)){
            throw new SeccionException("Ya existe una seccion con el nombre: " + seccion.getNombreSeccion() + " en misma asignatura la asignatura: " + seccion.getAsignatura().getNombreAsignatura());
        }

        if(seccion.getCapacidadMax() < 0 || seccion.getCantInscritos() < 0 ){
            throw new SeccionException("La capacidad maxima y cantidad de incritos no pueden ser negativas");
        }

        if(seccion.getCantInscritos()>seccion.getCapacidadMax()){
            seccion.setCantInscritos(seccion.getCapacidadMax());
        }

        seccion.setNombreSeccion(parsearNombre);
        seccion.setActivo(true);
        Seccion section = seccionRepository.save(seccion);
        return convertirADTO(section);
    }

    @Transactional
    @Override
    public SectionCreateDTO createSection (SectionCreateDTO dto){
        /**Validar existencia de asignatura y que este activa*/
        if ( dto.getIdAsignatura()!= null) {
            if (!asignaturaService.existsByIdAsignaturaAndTrue(dto.getIdAsignatura())){
                throw new SeccionException("La asignatura con el id: " + dto.getIdAsignatura() + " no existe");
            }
        }else {
            throw new SeccionException("Debe indicar una asignatura válida");
        }
        /**Validar duplicidad de nombre en la misma asignatura*/
        if (dto.getNombreSeccion() != null && !dto.getNombreSeccion().isBlank()) {
            String parsearNombre = StringUtils.normalizeSpaces(dto.getNombreSeccion());
            if(seccionRepository.existsByAsignatura_IdAsignaturaAndNombreSeccion(dto.getIdAsignatura(), parsearNombre)){
                throw new SeccionException("Ya existe una seccion con el nombre: " + dto.getNombreSeccion() + " en misma asignatura la asignatura: " + dto.getIdAsignatura());
            }
        }else {
            throw new SeccionException("No se puede crear una seccion sin nombre");
        }
        /**Validar existencia de usuario ademas si es docente o profesor*/
        UsuarioResponseDTO docente = usuarioService.obtenerPorId(dto.getIdUsuarioDocente());
        boolean esRolValido =
                docente.getNombreRol().equalsIgnoreCase("DOCENTE") ||
                        docente.getNombreRol().equalsIgnoreCase("PROFESOR_A_CARGO");
        boolean esActivo = docente.getActivo();
        if(!esRolValido || !esActivo){
            throw new SeccionException("Los usuario registrados a la seccion solo pueden ser docentes o profesores");
        }
        /***validar capacidad maxima y cantidad de inscritos */
        if (dto.getCantInscritos() < 0 || dto.getCapacidadMaxInscritos() < 0){
            throw new SeccionException("La capacidad maxima y cantidad de incritos no pueden ser negativas");
        }
        if (dto.getCantInscritos() > dto.getCapacidadMaxInscritos()){
            throw new SeccionException("La cantidad de inscritos no puede ser mayor a la capacidad maxima");
        }

        /**Crear seccion*/
        Seccion seccion = seccionRepository.save( new Seccion(
                null,
                asignaturaService.findById(dto.getIdAsignatura()),
                dto.getNombreSeccion(), dto.getCapacidadMaxInscritos(),
                dto.getCantInscritos(), true, Seccion.EstadoSeccion.ACTIVA));

        /**FALTA INSERTAR DOCENTE Y SECCION EN LA TABLA INTERMEDIA docente_seccion */

        if (dto.getCrearSala()) {
            /**
             * Procesa los bloques de tiempo de la sección,
             * creando sala solo si corresponde, pero siempre validando los bloques.
             */
            for (BookTImeBlocksRequestDTO B : dto.getBloquesHorarios()) {

                /** Normalizamos el día */
                ReservaSala.DiaSemana diaSemanaEnum =
                        ReservaSala.DiaSemana.valueOf(
                                B.getDiaSemana().toString().toUpperCase()
                        );

                Sala sala;

                /**
                 * Si se indicó crear sala y el bloque NO tiene idSala,
                 * entonces debemos crear una nueva.
                 */
                if (dto.getCrearSala() && B.getIdSala() == null) {

                    sala = salaService.save(
                            new Sala(
                                    null,
                                    B.getCodSala(),
                                    StringUtils.capitalizarPalabras(B.getNombreSala()),
                                    true
                            )
                    );

                    if (sala == null || sala.getIdSala() == null) {
                        throw new SeccionException(
                                "No se pudo crear la sala para el bloque " + B.getNumeroBloque()
                        );
                    }

                } else {

                    /** Si no se crea sala, debe existir una */
                    if (B.getIdSala() == null) {
                        throw new SeccionException(
                                "No se indicó idSala para el bloque " + B.getNumeroBloque()
                        );
                    }

                    sala = salaService.findById(B.getIdSala());
                }

                Integer salaId = sala.getIdSala();

                /** Validar disponibilidad del bloque */
                boolean disponible = reservaSalaService.validatedThatTheBlockIsNotReserved(
                        salaId,
                        diaSemanaEnum.name(),
                        B.getNumeroBloque()
                );

                if (!disponible) {
                    throw new SeccionException(
                            "El bloque " + B.getNumeroBloque() +
                                    " ya está reservado para la sala id: " + salaId
                    );
                }

                /** Obtener bloque horario */
                BloqueHorario bloqueHorario = bloqueHorarioService.findById(B.getNumeroBloque());

                /** Crear y guardar la reserva */
                ReservaSala reservaSala = new ReservaSala(
                        null,
                        seccion,
                        sala,
                        bloqueHorario,
                        diaSemanaEnum
                );

                reservaSalaService.save(reservaSala);
            }
        }

        /**Obtener nombre completo del docente usando metodo*/
        dto.setNombreCompletoDocente(usuarioService.obtenerNombreCompleto(docente));
        /**Validar bloques*/
        /**Asignar valores por defecto*/
        dto.setEstadoSeccion(Seccion.EstadoSeccion.ACTIVA);

        return dto;
    }

    @Transactional
    @Override
    public void softDelete(Integer id) {
        Seccion seccion = seccionRepository.findById(id).orElseThrow(
                () -> new SeccionException("La seccion con el id: " + id + " no existe")
        );
        seccion.setActivo(false);
        seccionRepository.save(seccion);
    }

    private SeccionEntityResponseDTO convertirADTO(Seccion seccion){
        return new SeccionEntityResponseDTO(
                seccion.getIdSeccion(),
                seccion.getAsignatura().getIdAsignatura(),
                seccion.getNombreSeccion(),
                seccion.getCapacidadMax(),
                seccion.getCantInscritos(),
                seccion.getActivo(),
                seccion.getEstadoSeccion().name()
        );
    }
}
