package KuHub.modules.gestion_academica.controller;

import KuHub.modules.gestion_academica.entity.Asignatura;
import KuHub.modules.gestion_academica.exceptions.AsignaturaException;
import KuHub.modules.gestion_academica.sevice.AsignaturaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/asignatura")
public class AsignaturaController {

    @Autowired
    private AsignaturaService asignaturaService;

    @GetMapping("/find-by-id/{id}")
    public ResponseEntity<Asignatura> findById(
            @PathVariable Integer id
    ){
        return ResponseEntity
                .status(200)
                .body(asignaturaService.findById(id));
    }

    @GetMapping( "/find-all/")
    public ResponseEntity<List<Asignatura>> findAll(){
        return ResponseEntity
                .status(200)
                .body(asignaturaService.findAll());
    }

    @PostMapping("/create-asignatura/")
    public ResponseEntity<Asignatura> save(@RequestBody Asignatura asignatura){
        return ResponseEntity
                .status(201)
                .body(asignaturaService.save(asignatura));
    }

    @PutMapping("/soft-delete/{id}")
    public ResponseEntity<?> softDelete(
            @PathVariable Integer id
    ){
        try {
            asignaturaService.softDelete(id);
            return ResponseEntity.noContent().build();
        }catch (AsignaturaException e){
            return ResponseEntity.status(400)
                    .body("Error: " + e.getMessage());
        }catch (Exception e){
            return ResponseEntity.status(500)
                    .body("Error interno al intentar eliminar la sala: " + e.getMessage());
        }
    }










}
