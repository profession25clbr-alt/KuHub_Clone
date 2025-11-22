package KuHub.modules.gestion_academica.dtos.dtomodel;

import KuHub.modules.gestion_academica.entity.ReservaSala;
import KuHub.modules.gestion_academica.entity.Seccion;
import lombok.*;

import java.util.List;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class SectionCreateDTO {

    private Integer idAsignatura;
    private String nombreSeccion;
    private Seccion.EstadoSeccion estadoSeccion;
    private Integer idUsuarioDocente;
    private String NombreCompletoDocente;
    private List<BookTImeBlocksRequestDTO> bloquesHorarios;
    private ReservaSala.DiaSemana diaSemana;
    private Integer capacidadMaxInscritos;
    private Integer cantInscritos;
    private Boolean crearSala;

}
