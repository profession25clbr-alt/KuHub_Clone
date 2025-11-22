package KuHub.modules.gestion_academica.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sala")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Sala {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sala")
    private Integer idSala;

    @Column(name = "cod_sala", unique = true, length = 50)
    private String codSala;

    @Column(name = "nombre_sala", length = 100)
    private String nombreSala;

    @Column(name = "activo")
    private Boolean activo = true;
}
