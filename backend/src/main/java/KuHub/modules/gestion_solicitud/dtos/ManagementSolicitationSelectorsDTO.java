package KuHub.modules.gestion_solicitud.dtos;

import KuHub.modules.gestion_academica.dtos.projection.CourseSolicitationSelectView;
import KuHub.modules.gestion_usuario.dtos.UserIdAndCompleteNameDTO;
import KuHub.modules.semanas.dtos.proyeccion.WeekIdDescripcionView;
import lombok.*;

import java.util.List;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ManagementSolicitationSelectorsDTO {
    private List<WeekIdDescripcionView> semanas;
    private List<CourseSolicitationSelectView> asignaturas;
    private List<UserIdAndCompleteNameDTO> docentes;
}
