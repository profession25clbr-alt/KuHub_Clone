package KuHub.modules.gestion_academica.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "asignatura")
@Getter@Setter@NoArgsConstructor@AllArgsConstructor@ToString
public class Asignatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asignatura")
    private Integer idAsignatura;

    @Column(name = "cod_asignatura", length = 50, nullable = false, unique = true)
    private String codAsignatura;

    @Column(name = "nombre_asignatura", length = 100, nullable = false)
    private String nombreAsignatura;

    @Column(name = "activo")
    private Boolean activo ;
}
