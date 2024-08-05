/**
 * Autor: Johan Stiven Londoño Alvarez
 * Inicio de la app
 */

//Invocamos a express el cual nos servira para administracion de las solicitudes 
const express = require('express');
const app = express();

//Seteamos el urlencoded para capturar los datos del formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//Invocamos a dotenv el cual nos servira para definir variables de entorno
//La segunda linea hacia abajo especifica el archivo que contendra las variables de entorno
const dotenv = require('dotenv');
const { dirname } = require('path');
dotenv.config({path:'./env/.env'});


//Seteamos el directorio public
app.use('/resources',express.static('public'));
app.use('/resources',express.static(__dirname + '/public'));

//Establecemos el motor de plantillas 
app.set('view engine','ejs');

//Invocamos a bcrypjs para encriptar las contraseñas
const bcryptjs = require('bcryptjs');


//Configuramos las variables de inicio de sección (secret=palabra secreta,resave= si guardamos los inicios)
const session = require('express-session')
app.use(session({
    secret:'secret',
    resave: true ,
    saveUninitialized: true


}))

//Invocamos al modulo de la conexion de base de datos
const connection = require('./database/db_Login/db')


/**
 * prueba de solicitud get 
 */
app.get('/',(req,res)=>{
    res.render('index')
})


/**
 * Establecimiento de rutas
 */


//Inicio del servidor que estara a la escucha por el puerto 8080
app.listen(8080,(req, resp)=>{
    console.log("Server listening in https://localhost:8080");
})
