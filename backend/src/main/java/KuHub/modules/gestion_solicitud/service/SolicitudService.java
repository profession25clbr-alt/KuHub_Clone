package KuHub.modules.gestion_solicitud.service;

import KuHub.modules.gestion_solicitud.dtos.*;
import KuHub.modules.gestion_solicitud.dtos.proyeccion.ManagementSolicitationView;
import KuHub.modules.gestion_solicitud.dtos.proyeccion.SectionAvailabilityView;

import java.util.List;

public interface SolicitudService {
    List<SectionAvailabilityView> checkSectionAvailability (CheckSectionAvailabilityRequestDTO r);
    List<SolicitationAnswerDTO> saveSolicitation (SolicitationCreateRequestDTO rest);
    ManagementSolicitationSelectorsDTO getSelectorsForManagement();
    List<ManagementSolicitationView> getManagementSolicitations(ManagementSolicitationRequestDTO request);
}
