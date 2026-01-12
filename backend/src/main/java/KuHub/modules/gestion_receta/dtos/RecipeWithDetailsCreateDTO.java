package KuHub.modules.gestion_receta.dtos;

import KuHub.modules.gestion_receta.entity.Receta;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter@Setter@ToString@AllArgsConstructor@NoArgsConstructor
public class RecipeWithDetailsCreateDTO {

    @NotBlank
    private String nombreReceta;
    private String descripcionReceta;
    @NotEmpty(message = "La lista de items no puede estar vacía")
    private List<@Valid RecipeItemCreateDTO> listaItems;
    private String instrucciones;
    private Receta.EstadoRecetaType estadoReceta;

}
