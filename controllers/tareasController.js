const { request, response } = require("express");

const Proyectos = require('../models/Proyectos');
const Tareas = require('../models/Tareas');

exports.agregarTarea = async(request, response, next) =>{
    // obtenemos el Proyecto Actual
    const proyecto = await Proyectos.findOne({where:{url: request.params.url}});
    
    // leer el valor del input
    const {tarea} = request.body;

    // estado = 0 incompleto y ID del Proyecto
    const estado = 0;

    const proyectoId = proyecto.id;

    // Insertar en la Base de Datos

    const resultado = await Tareas.create({tarea, estado, proyectoId});

    if(!resultado){
        return next();
    }

    // redireccionar
    response.redirect(`/proyectos/${request.params.url}`);

}

exports.cambiarEstadoTarea = async(request, response, next)=>{
    const {id} = request.params;
    const tarea = await Tareas.findOne({ where:{ id: id}});

    // cambiar estado 
    let estado = 0;
    if(tarea.estado === estado){
        estado = 1;
    }
    tarea.estado = estado;

    const resultado = await tarea.save();

    if(!resultado) return next()

    response.status(200).send('Actualizado');
}

exports.eliminarTarea = async(request, response, next)=>{
    const {id} = request.params;

    //Eliminar la tarea
    const resultado = await Tareas.destroy({where:{id:id}});

    if(!resultado) return next();

    response.status(200).send('Tarea Eliminada');
}