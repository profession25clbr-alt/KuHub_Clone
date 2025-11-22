package KuHub.modules.gestion_academica.sevice;

import KuHub.modules.gestion_academica.entity.Asignatura;

import java.util.List;

public interface AsignaturaService {

    Asignatura findById(Integer id);
    Boolean existsByIdAsignatura(Integer id);
    Boolean existsByIdAsignaturaAndTrue(Integer id);
    List<Asignatura> findAll();
    Asignatura save (Asignatura asignatura);
    void softDelete (Integer id);
}
