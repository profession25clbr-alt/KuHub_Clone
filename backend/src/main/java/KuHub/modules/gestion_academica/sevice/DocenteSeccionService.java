package KuHub.modules.gestion_academica.sevice;

import KuHub.modules.gestion_academica.dtos.dtoentity.DocenteSeccionEntityDTO;
import KuHub.modules.gestion_academica.entity.DocenteSeccion;

import java.util.List;

public interface DocenteSeccionService {

    DocenteSeccionEntityDTO findByIdDocenteSeccion(Integer idDocenteSeccion);
    DocenteSeccionEntityDTO findByDocenteAndSeccion(Integer idDocente, Integer idSeccion);
    List<DocenteSeccionEntityDTO> findAll ();
    DocenteSeccion save(DocenteSeccion docenteSeccion);
}
