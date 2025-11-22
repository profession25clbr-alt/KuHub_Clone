package KuHub.modules.gestion_academica.sevice;

import KuHub.modules.gestion_academica.dtos.dtoentity.SeccionEntityResponseDTO;
import KuHub.modules.gestion_academica.dtos.dtomodel.SectionCreateDTO;
import KuHub.modules.gestion_academica.entity.Seccion;

import java.util.List;

public interface SeccionService {

    SeccionEntityResponseDTO findById(Integer id) ;
    SeccionEntityResponseDTO findByIdAndActiveIsTrue(Integer id);
    List<SeccionEntityResponseDTO> findAll();
    List<SeccionEntityResponseDTO> findAllByActivoTrue();
    SeccionEntityResponseDTO save(Seccion seccion);
    SectionCreateDTO createSection (SectionCreateDTO dto);
    void softDelete(Integer id);
}
