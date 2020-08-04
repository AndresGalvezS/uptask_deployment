const { request, response } = require("express");
const Proyectos = require('../models/Proyectos');
const Tareas = require('../models/Tareas');
const { where } = require("sequelize");

exports.proyectosHome = async(request, response)=>{

    const usuarioId = response.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where:{ usuarioId:usuarioId }});
 
    response.render('index', {
        nombrePagina : 'Proyectos',
        proyectos
    });
} 

exports.formularioProyecto = async(request, response)=>{
    const usuarioId = response.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where:{ usuarioId:usuarioId }});

    response.render('nuevoProyecto', {
        nombrePagina : 'Nuevo Proyecto',
        proyectos
    });
} 

exports.nuevoProyecto = async (request, response)=>{
    //Enviar a la consola lo que el usuario escriba
    //console.log(request.body);
    // validar que tengamos algo en el input
    const usuarioId = response.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where:{ usuarioId:usuarioId }});
    const {nombre} = request.body;

    let errores = [];

    if(!nombre){
        errores.push({'texto' : 'Agregar un Nombre al Proyecto'})
    }

    // si hay errores
    if(errores.length>0){
        response.render('nuevoProyecto',{
            nombrePagina : 'Nuevo Proyecto',
            errores,
            proyectos
        })
    }else{
        //No hay errores
        //Insertar en la BD
        const usuarioId = response.locals.usuario.id;
        await Proyectos.create({nombre, usuarioId});
        response.redirect('/');
    }
}

exports.proyectoPorURL = async(request, response, next) =>{
    const usuarioId = response.locals.usuario.id;
    const proyectosPromise =  Proyectos.findAll({where:{ usuarioId:usuarioId }});

    const proyectoPromise =  Proyectos.findOne({
        where:{
            url: request.params.url,
            usuarioId: usuarioId
        }
    });

    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);
    
    //Consultar tareas del proyecto actual
    const tareas = await Tareas.findAll({
        where:{
            proyectoId: proyecto.id
        },
        /* include:[
            { model: Proyectos }
        ] */
    });


    if(!proyecto) return next();
    
    // render a la vista
    response.render('tareas', {
        nombrePagina : 'Tareas del Proyecto',
        proyecto,
        proyectos,
        tareas
    })
}

exports.formularioEditar = async(request, response) =>{

    const usuarioId = response.locals.usuario.id;
    const proyectosPromise =  Proyectos.findAll({where:{ usuarioId:usuarioId }});

    const proyectoPromise =  Proyectos.findOne({
        where:{
            id: request.params.id,
            usuarioId: usuarioId
        }
    });

    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);
    //render de la vista
    response.render('nuevoProyecto',{
        nombrePagina : 'Editar Proyecto',
        proyectos,
        proyecto
    })
}


exports.actualizarProyecto = async (request, response)=>{
    //Enviar a la consola lo que el usuario escriba
    //console.log(request.body);
    // validar que tengamos algo en el input
    const usuarioId = response.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where:{ usuarioId:usuarioId }});
    const {nombre} = request.body;

    let errores = [];

    if(!nombre){
        errores.push({'texto' : 'Agregar un Nombre al Proyecto'})
    }

    // si hay errores
    if(errores.length>0){
        response.render('nuevoProyecto',{
            nombrePagina : 'Nuevo Proyecto',
            errores,
            proyectos
        })
    }else{
        //No hay errores
        //Insertar en la BD
        await Proyectos.update(
            { nombre: nombre},
            { where: { id: request.params.id}}
        );
        response.redirect('/');
    }
}

exports.eliminarProyecto = async(request, response, next) =>{
    // request, query o params
    const {urlProyecto} = request.query;

    const resultado = await Proyectos.destroy({where: { url: urlProyecto}});

    if(!resultado){
        return next();
    }
    response.send('Proyecto Eliminado Correctamente');
} 

