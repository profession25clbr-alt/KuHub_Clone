package KuHub.modules.gestion_academica.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reserva_sala")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ReservaSala {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reserva_sala")
    private Integer idReservaSala;

    // ----------- Relaciones -------------

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_seccion", nullable = false)
    private Seccion seccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sala", nullable = false)
    private Sala sala;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_bloque", referencedColumnName = "numero_bloque", nullable = false)
    private BloqueHorario bloqueHorario;

    // ----------- Campos simples -----------

    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false)
    private DiaSemana diaSemana;

    public enum DiaSemana {
        LUNES,
        MARTES,
        MIERCOLES,
        JUEVES,
        VIERNES,
        SABADO,
        DOMINGO
    }
}
