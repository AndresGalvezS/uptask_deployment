const express = require('express');

const routes = require('./routes');

const path = require('path');

const bodyParser = require('body-parser');

const expressValidator = require("express-validator");

const flash = require('connect-flash');

const session = require('express-session');

const cookieParser = require('cookie-parser');

const passport = require('./config/passport');

// helpers con algunas funciones
const helpers = require('./helpers');

// Crear la conexión de la BD
const db = require('./config/db');
const { request, response } = require('express');

//importar las variables
require('dotenv').config({path: 'variable.env'});

//importar el modelo
require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');

db.sync()
    .then(() => console.log('Conectado al Servidor'))
    .catch(error => console.log(error))


// crear un app en express
const app = express();

//Donde cargar los archivos estaticos
app.use(express.static('public'));

// Habilitar pug
app.set('view engine', 'pug');

// Habilitar bodyParser para leer datos del formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Agregamos express validator a toda la aplicación
//app.use(expressValidator);

//Añadir la carpeta de las vistas
app.set('views', path.join(__dirname, './views'));

app.use(cookieParser());

//Sesiones: nos permiten navegar entre distintas paginas sin volvernos a autenticar
app.use(session({
    secret: 'supersecreto',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//Agregar Flash messages
app.use(flash());

// Pasar var dump a la aplicación
app.use((request, response, next)=>{
    response.locals.vardump = helpers.vardump;
    response.locals.mensajes = request.flash();
    response.locals.usuario = {...request.user} || null;
    next();
});


app.use('/', routes());

//Servidor y Puerto
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 5000;

app.listen(PORT, HOST, ()=>{
    console.log('El servidor esta funcionando.');
})