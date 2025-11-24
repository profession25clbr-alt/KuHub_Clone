package KuHub.modules.gestion_academica.dtos.dtomodel;

import KuHub.modules.gestion_academica.entity.ReservaSala;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class BookTImeBlocksRequestDTO {
    @NotNull
    private Integer numeroBloque;
    @NotNull
    private LocalTime horaInicio;
    @NotNull
    private LocalTime horaFin;
    @NotNull
    private ReservaSala.DiaSemana diaSemana;
    @NotNull
    private Integer idSala;
    @NotEmpty
    private String CodSala;
    @NotEmpty
    private String nombreSala;
}
