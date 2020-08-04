const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/email');
const { request, response } = require('express');

exports.formCrearCuenta = (req, res ) => {
    res.render('crearCuenta', {
        nombrePagina : 'Crear Cuenta en Uptask'
    })
}


exports.formIniciarSesion = (req, res) => {
    const { error } = res.locals.mensajes;
    res.render('iniciarSesion', {
        nombrePagina : 'Iniciar Sesión en UpTask', 
        error
    })
}

exports.crearCuenta = async (req, res) => {
    // leer los datos
    const { email, password} = req.body;
    try {
        // crear el usuario
        await Usuarios.create({
            email, 
            password
        });

        // crear una URL de confirmar
        const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`;

        // crear el objeto de usuario
        const usuario = {
            email
        }

        // enviar email
        await enviarEmail.enviar({
            usuario,
            subject: 'Confirma tu cuenta UpTask', 
            confirmarUrl, 
            archivo : 'confirmar-cuenta'
        });
        
        // redirigir al usuario
        req.flash('correcto', 'Enviamos un correo, confirma tu cuenta');
        res.redirect('/iniciar-sesion');

    } catch (error) {
        request.flash('error', error.errors.map(error=>error.message));
        response.render('crearCuenta',{
            mensajes: request.flash(),
            nombrePagina: 'Crear Cuenta en UpTask',
            email,
            password
        })
    }
}

exports.formRestablecerPassword = (req, res) => {
    res.render('reestablecer', {
        nombrePagina: 'Reestablecer tu Contraseña'
    })
}

// Cambia el estado de una cuenta
exports.confirmarCuenta = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            email: req.params.correo
        }
    });

    // si no existe el usuario
    if(!usuario) {
        req.flash('error', 'No valido');
        res.redirect('/crear-cuenta');
    }

    usuario.activo = 1;
    await usuario.save();

    req.flash('correcto', 'Cuenta activada correctamente');
    res.redirect('/iniciar-sesion');

}

//Cambia el estado de una cuenta
exports.confirmarCuenta = async(request, response)=>{
    const usuario = await Usuarios.findOne({
        where:{
            email: request.params.correo
        }
    });

    //Si no existe el usuario
    if(!usuario){
        request.flash('error','No valido');
        response.redirect('/crear-cuenta');
    }

    usuario.activo = 1;

    await usuario.save();

    request.flash('correcto','Cuenta activa correctamente');
    response.redirect('/iniciar-sesion');
}