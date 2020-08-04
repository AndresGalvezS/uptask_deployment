const passport = require('passport');
const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/email');

const cryto = require('crypto');
const { Op } = require("sequelize");
const bcrypt = require('bcrypt-nodejs');

const { request, response } = require('express');

exports.autenticarUsuario = passport.authenticate('local',{
   successRedirect: '/',
   failureRedirect: '/iniciar-sesion',
   failureFlash: true,
   badRequestMessage: 'Ambos campos son OBLIGATORIOS.'
});

//Función para revisar si el usuario esta logueado o no
exports.usuarioAutenticado = (request, response, next) =>{
   //Si el usuario esta autenticado, adelante
   if(request.isAuthenticated()){
      return next();
   }
   //Sino esta autenticado, redirigir al formulario

   return response.redirect('/iniciar-sesion');
}

//Función para cerrar Sesion.
exports.cerrarSesion = (request, response) =>{
   request.session.destroy(() =>{
      response.redirect('/iniciar-sesion'); //al cerrar sesión nos lleva al login
   })
}

//Genera un Token si el usuario es valido
exports.enviarToker = async(request, response) =>{
   //Verificar que el usuario existe
   const {email} = request.body
   const usuario = await Usuarios.findOne({where:{email: email}});

   //Si no existe el usuario
   if(!usuario){ 
      request.flash('error', 'No existe esa cuenta');
      response.render('reestablecer',{
         nombrePagina: 'Reestablecer tu Contraseña',
         mensajes: request.flash()
      })
   }

   //Usuario existe
   usuario.token = cryto.randomBytes(20).toString('hex');
   usuario.expiracion = Date.now() + 3600000;

   //Guardarlos en la base de datos
   await usuario.save();

   //URL de reset
   const resetUrl = `http://${request.headers.host}/reestablecer/${usuario.token}`;

   // Enviar el correo con el Token
   await enviarEmail.enviar({
      usuario: usuario,
      subject: 'Password Reset',
      resetUrl: resetUrl,
      archivo: 'reestablecer-password'
   });

   //termnar 
   request.flash('correcto', 'Se envió un mensaje a tu correo.');
   response.redirect('/iniciar-sesion');
}

//Validacion del token
exports.validarToken = async(request, response) => {
   const usuario = await Usuarios.findOne({
      where:{
         token: request.params.token
      }
   });

   // Sino encuentra el usuario
   if(!usuario){
      request.flash('error', 'No válido');
      response.redirect('/reestablecer');
   }

   // Formulario para generar el password
   response.render('resetPassword',{
      nombrePagina: 'Reestablecer Contraseña'
   })
}

//Cambia el password por uno nuevo
exports.actualizarPassword = async (request, response) =>{

   //Verifica el token valido pero tambien la fecha de expiración
   const usuario = await Usuarios.findOne({
      where:{
         token: request.params.token,
         expiracion:{
            [Op.gte]: Date.now()
         }
      }
   });

   //Verificamos si el usuario existe
   if(!usuario){
      request.flash('error','No válido');
      response.redirect('/reestablecer');
   }

   //Hashear el nuevo password
   usuario.password = bcrypt.hashSync(request.body.password, bcrypt.genSaltSync(10));
   usuario.token = null;
   usuario.expiracion = null;

   // guardamos el nuevo password
   await usuario.save();
   request.flash('correcto','Tu password ha sido modificada correctamente');
   response.redirect('/iniciar-sesion');
}