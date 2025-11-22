package KuHub.modules.gestion_academica.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name ="seccion")
@Getter@Setter@NoArgsConstructor
@AllArgsConstructor@ToString
public class Seccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_seccion")
    private Integer idSeccion;

    // Relación ManyToOne con Asignatura
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_asignatura", nullable = false)
    private Asignatura asignatura;

    @Column(name = "nombre_seccion", length = 100, nullable = false)
    private String nombreSeccion;

    @Column(name = "capacidad_max", nullable = false)
    private Integer capacidadMax;

    @Column(name = "cant_inscritos", nullable = false)
    private Integer cantInscritos;

    @Column(name = "activo")
    private Boolean activo ;

    // NUEVO: estado de la sección
    @Enumerated(EnumType.STRING)
    @Column(name = "estado_seccion", nullable = false)
    private EstadoSeccion estadoSeccion = EstadoSeccion.ACTIVA; // valor por defecto


    public enum EstadoSeccion {
        ACTIVA,
        INACTIVA,
        SUSPENDIDA
    }

    /***/
}
