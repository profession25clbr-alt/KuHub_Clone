package KuHub.modules.gestion_solicitud.controller;

import KuHub.modules.gestion_solicitud.dtos.*;
import KuHub.modules.gestion_solicitud.dtos.proyeccion.ManagementSolicitationView;
import KuHub.modules.gestion_solicitud.dtos.proyeccion.SectionAvailabilityView;
import KuHub.modules.gestion_solicitud.service.SolicitudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/solicitud")
@Validated
public class SolicitudController {

    @Autowired
    private SolicitudService solicitudService;

    @GetMapping("/selectors-for-managemet-solicitation")
    public ResponseEntity<ManagementSolicitationSelectorsDTO> getSelectorsForManagement() {
        return ResponseEntity
                .status(200)
                .body(solicitudService.getSelectorsForManagement());
    }

    @PostMapping("/check-section-availability")
    public ResponseEntity<List<SectionAvailabilityView>> checkSectionAvailability(
            @RequestBody CheckSectionAvailabilityRequestDTO r
            ){
        return ResponseEntity
                .status(200)
                .body(solicitudService.checkSectionAvailability(r));
    }

    @PostMapping("/management-solicitations-filter")
    public ResponseEntity<List<ManagementSolicitationView>> getManagementSolicitations(
            @RequestBody ManagementSolicitationRequestDTO request
    ) {
        // El servicio se encarga de limpiar los ceros y nulos
        List<ManagementSolicitationView> listado = solicitudService.getManagementSolicitations(request);

        return ResponseEntity.ok(listado);
    }

    @PostMapping("/save-solicitation")
    public ResponseEntity<List<SolicitationAnswerDTO>> saveSolicitation(
            @RequestBody SolicitationCreateRequestDTO r
            ){
        return ResponseEntity
                .status(201)
                .body(solicitudService.saveSolicitation(r));
    }

}
