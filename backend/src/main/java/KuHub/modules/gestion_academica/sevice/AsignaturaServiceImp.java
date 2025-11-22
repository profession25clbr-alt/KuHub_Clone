package KuHub.modules.gestion_academica.sevice;

import KuHub.modules.gestion_academica.entity.Asignatura;
import KuHub.modules.gestion_academica.exceptions.AsignaturaException;
import KuHub.modules.gestion_academica.repository.AsignaturaRepository;
import KuHub.utils.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AsignaturaServiceImp implements AsignaturaService{

    @Autowired
    private AsignaturaRepository asignaturaRepository;

    @Transactional(readOnly = true)
    @Override
    public Asignatura findById(Integer id) {
        return asignaturaRepository.findById(id).orElseThrow(
                ()-> new AsignaturaException("La asignatura con el id: " + id + " no existe")
        );
    }

    @Transactional(readOnly = true)
    @Override
    public Boolean existsByIdAsignatura(Integer id){
        return asignaturaRepository.existsByIdAsignatura(id);
    }

    @Transactional(readOnly = true)
    @Override
    public Boolean existsByIdAsignaturaAndTrue(Integer id){
        return asignaturaRepository.existsByIdAsignaturaAndActivoTrue(id);
    }

    @Transactional(readOnly = true)
    @Override
    public List<Asignatura> findAll() {
        return asignaturaRepository.findAll();
    }

    @Transactional
    @Override
    public Asignatura save (Asignatura asignatura){

        String parsearCod = StringUtils.normalizeSpaces(asignatura.getCodAsignatura());
        String parsearNombre = StringUtils.capitalizarPalabras(asignatura.getNombreAsignatura());
        if (asignaturaRepository.existsByCodAsignatura(parsearCod)){
            throw new AsignaturaException("Ya existe un codigo de asignatura con el valor: " + parsearCod);
        }
        if (asignaturaRepository.existsByNombreAsignaturaAndCodAsignatura(parsearNombre, parsearCod)){
            throw new AsignaturaException("Ya existe asignatura con el nombre: " + parsearNombre + " y el codigo: " + parsearCod);
        }

        asignatura.setNombreAsignatura(parsearNombre);
        asignatura.setCodAsignatura(parsearCod);
        asignatura.setActivo(true);
        return asignaturaRepository.save(asignatura);
    }


    //falta definir como actualizar datos entity...


    @Transactional
    @Override
    public void softDelete (Integer id){
        Asignatura asignatura = findById(id);
        asignatura.setActivo(false);
        asignaturaRepository.save(asignatura);
    }
}
