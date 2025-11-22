package KuHub.utils;

import java.util.Arrays;
import java.util.stream.Collectors;

public class StringUtils {

    public static String capitalizarPalabras(String texto) {
        if (texto == null || texto.isBlank()) return texto;

        return Arrays.stream(texto.trim().split("\\s+"))
                .map(p -> p.substring(0, 1).toUpperCase() + p.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }

    /**
     * Limpia espacios duplicados y elimina espacios al inicio y final.
     * No altera contenido (mayúsculas/minúsculas se mantienen).
     */
    public static String normalizeSpaces(String texto) {
        if (texto == null) return null;
        return texto.trim().replaceAll("\\s+", " ");
    }
}
