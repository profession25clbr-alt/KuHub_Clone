package KuHub.modules.gestion_academica.repository;

import KuHub.modules.gestion_academica.entity.Asignatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AsignaturaRepository extends JpaRepository <Asignatura, Integer> {
    Boolean existsByIdAsignatura(Integer id);
    Boolean existsByIdAsignaturaAndActivoTrue(Integer id);
    Boolean existsByCodAsignatura(String codAsignatura);
    Boolean existsByNombreAsignaturaAndCodAsignatura(String nombreAsignatura, String codAsignatura);
}
