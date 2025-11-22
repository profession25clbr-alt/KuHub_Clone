package KuHub.modules.gestion_academica.repository;

import KuHub.modules.gestion_academica.entity.Seccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeccionRepository extends JpaRepository <Seccion, Integer> {
    Boolean existsByAsignatura_IdAsignaturaAndNombreSeccion(
            Integer idAsignatura,
            String nombreSeccion
    );
    Boolean existsByIdSeccion(Integer idSeccion);
    Optional<Seccion> findByIdSeccionAndActivoTrue(Integer idSeccion);
    List<Seccion> findAllByActivoTrue();
}
