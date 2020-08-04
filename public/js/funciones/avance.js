import Swal from 'sweetalert2';

export const actualizarAvance = () =>{
    //Seleccionar las tareas existentes
    const tareas = document.querySelectorAll('li.tarea');

    if(tareas.length){
        //Seleccionar las tareas completadas
        const tareasCompletas = document.querySelectorAll('i.completo');

        //Calcular el avance
        const avance = Math.round((tareasCompletas.length / tareas.length) * 100);
        //Mostrar el avance
        const procentaje = document.querySelector('#porcentaje');
        procentaje.style.width = avance+'%';

        if(avance === 100){
            Swal.fire(
                'Completaste el Proyecto',
                'Felicidades, has terminado tus tareas.',
                'success'
            )
        }
    }
}