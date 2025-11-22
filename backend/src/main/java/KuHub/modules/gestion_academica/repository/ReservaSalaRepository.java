package KuHub.modules.gestion_academica.repository;

import KuHub.modules.gestion_academica.dtos.projection.NumberBlockProjection;
import KuHub.modules.gestion_academica.entity.ReservaSala;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservaSalaRepository extends JpaRepository<ReservaSala, Integer> {

    /**
     * Obtiene la lista de bloques horarios reservados para una sala específica en un día de la semana dado.
     *
     * La consulta:
     * - Selecciona los números de bloque (b.numero_bloque) sin repetir.
     * - Realiza JOIN entre reserva de sala, sala y bloque horario.
     * - Filtra por:
     *      - ID de la sala (`idSala`)
     *      - Sala activa (`s.activo = true`)
     *      - Día de la semana (`r.dia_semana`), casteado al tipo ENUM del backend (`dia_semana_type`)
     *
     * @param idSala     ID de la sala a consultar.
     * @param diaSemana  Día de la semana (string que se castea al tipo enum de la base).
     * @return Lista de bloques horarios reservados (proyección NumberBlockProjection).
     */
    @Query(value = """
    select distinct b.numero_bloque as bloqueHorarioNumeroBloque
    from reserva_sala r
    join sala s on s.id_sala = r.id_sala
    join bloque_horario b on r.id_bloque = b.id_bloque
    where r.id_sala = :idSala
      and s.activo = true
      and r.dia_semana = cast(:diaSemana as dia_semana_type)
""", nativeQuery = true)
    List<NumberBlockProjection> findDistinctBySalaIdSalaAndSalaActivoTrueAndDiaSemana(
            @Param("idSala") Integer idSala,
            @Param("diaSemana") String diaSemana
    );


}
