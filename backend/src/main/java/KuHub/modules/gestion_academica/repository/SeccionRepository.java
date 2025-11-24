package KuHub.modules.gestion_academica.repository;

import KuHub.modules.gestion_academica.entity.Seccion;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeccionRepository extends JpaRepository <Seccion, Integer> {

    /**
     * Comprueba si existe una sección activa para una asignatura activa,
     * aplicando normalización para ignorar mayúsculas/minúsculas, tildes
     * y símbolos (espacios, guiones, etc.).
     *
     * IMPORTANTE:
     * - Esta query usa la función unaccent(); asegúrate de tener la extensión
     *   instalada en la base de datos (CREATE EXTENSION IF NOT EXISTS unaccent;).
     * - Los parámetros esperados son:
     *     :idAsignatura   -> id de la asignatura (Integer)
     *     :nombreSeccion  -> nombre de la sección (String)
     *
     * La lógica es IDENTICA a la consulta SQL original proporcionada:
     *  - comprueba que tanto la asignatura como la sección estén activas (TRUE)
     *  - normaliza nombre_seccion y el parámetro para comparar sin acentos,
     *    sin símbolos y sin distinguir mayúsculas/minúsculas.
     */
    @Query(
            value = """
    SELECT COUNT(*) > 0
    FROM seccion c
    JOIN asignatura a ON c.id_asignatura = a.id_asignatura
        WHERE a.id_asignatura = :idAsignatura
          AND c.activo = TRUE AND a.activo = TRUE
          AND regexp_replace(
                  public.unaccent(c.nombre_seccion::text),
                  '[^a-zA-Z0-9]+',
                  '',
                  'g'
              )
          ILIKE regexp_replace(
                  public.unaccent(:nombreSeccion),
                  '[^a-zA-Z0-9]+',
                  '',
                  'g'
              )
      """,
            nativeQuery = true
    )
    Boolean existsByAsignaturaTrueAndSeccionTrueAndNombreSeccionIlike(
            @Param("idAsignatura") Integer idAsignatura,
            @Param("nombreSeccion") String nombreSeccion
    );

    Boolean existsByIdSeccion(Integer idSeccion);
    Optional<Seccion> findByIdSeccionAndActivoTrue(Integer idSeccion);
    List<Seccion> findAllByActivoTrue();
}
