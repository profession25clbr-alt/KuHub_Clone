package KuHub.modules.gestion_academica.sevice;

import KuHub.modules.gestion_academica.entity.BloqueHorario;
import KuHub.modules.gestion_academica.entity.ReservaSala;
import KuHub.modules.gestion_academica.entity.Sala;
import KuHub.modules.gestion_academica.exceptions.BloqueHorarioException;
import KuHub.modules.gestion_academica.repository.BloqueHorarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BloqueHorarioServiceImp implements BloqueHorarioService{

    @Autowired
    private BloqueHorarioRepository bloqueHorarioRepository;

    @Autowired
    private ReservaSalaService reservaSalaService;

    @Transactional(readOnly = true)
    @Override
    public BloqueHorario findById(Integer id) {
        return bloqueHorarioRepository.findById(id).orElseThrow(
                ()-> new BloqueHorarioException("El bloque de horario con el id: " + id + " no existe")
        );
    }

    @Transactional(readOnly = true)
    @Override
    public BloqueHorario findByNumberBlock (Integer numberBlock){
        return bloqueHorarioRepository.findByNumeroBloque(numberBlock).orElseThrow(
                ()-> new BloqueHorarioException("El bloque de horario con el numero: " + numberBlock + " no existe")
        );
    }

    @Transactional(readOnly = true)
    @Override
    public List<BloqueHorario> findAll() {
        return bloqueHorarioRepository.findAll();
    }

    @Transactional
    @Override
    public List<BloqueHorario> filterBlocksByNumbersBlocks(List<Integer> numbersBlocksFilter){
         if (numbersBlocksFilter == null || numbersBlocksFilter.isEmpty()){
             throw new BloqueHorarioException("No se puede filtrar por ningun bloque de horario");
         }
         return bloqueHorarioRepository.findByNumeroBloqueNotIn(numbersBlocksFilter);
    }

    @Transactional(readOnly = true)
    @Override
    public List<BloqueHorario> filterBlocksByDayWeekAndIdRoom(Integer idSala, String diaSemana){
        List<Integer> numbersBlocksFilter = reservaSalaService.findReservedBlocksByIdSalaAndDayWeek(idSala, diaSemana);
        return filterBlocksByNumbersBlocks(numbersBlocksFilter);
    }




}
