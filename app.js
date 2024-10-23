/**
 * Autor: Johan Stiven Londoño Alvarez
 * Inicio de la app
 */

// 1- Invocamos a express el cual nos servira para administracion de las solicitudes 
const express = require('express');
const app = express();


//2- Seteamos el urlencoded para capturar los datos del formulario y no tener errores
app.use(express.urlencoded({extended:false}));
app.use(express.json());


//3- Invocamos a dotenv el cual nos servira para definir variables de entorno
//La segunda linea hacia abajo especifica el archivo que contendra las variables de entorno
const dotenv = require('dotenv');
const { dirname } = require('path');
dotenv.config({path:'./env/.env'});//Direccion donde se encuentra el archivo .env

//Declaracion del puerto del servidor principal
port = process.env.SERVER_PORT;

//4- Seteamos el directorio public por si deseamos migrar
app.use('/resources',express.static('public'));
app.use('/resources',express.static(__dirname + '/public'));

//5- Establecemos el motor de plantillas 
app.set('view engine','ejs');

//6- Invocamos a bcrypjs para encriptar las contraseñas
const bcryptjs = require('bcryptjs');


//7- Configuramos las variables de inicio de sección (secret=palabra secreta,resave= si guardamos los inicios)
const session = require('express-session')
app.use(session({
    secret:'secret',
    resave: true ,
    saveUninitialized: true


}))

//8- Invocamos al modulo de la conexion de base de datos para que posterior se conecte a ella
const connection = require('./database/db_Login/db')
const connection = require('./database/db_Login/db')

//9- Establecimiento de rutas para nuestar app
/**
 * prueba de solicitud get 
 */
app.get('/',(req,res)=>{
    res.render('index',{msg: 'paquito'});
})


/**
 * Atiende las solicitudes para el login 
 */
app.get('/login',(req,res)=>{
    res.render('login');
})

/**
 * Atiende las solicitudes para el registro
 */
app.get('/register',(req,res)=>{
    res.render('register');
})


/**
 * Establecimiento de rutas
 */



//Inicio del servidor que estara a la escucha por el puerto 8080
app.listen(port,(req, resp)=>{
    console.log("Server listening in https://localhost:"+port);
})
