package KuHub.modules.gestion_academica.dtos.dtomodel;

import KuHub.modules.gestion_academica.entity.ReservaSala;
import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class BookTImeBlocksRequestDTO {
    private Integer numeroBloque;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private ReservaSala.DiaSemana diaSemana;
    private Integer idSala;
    private String CodSala;
    private String nombreSala;
}
