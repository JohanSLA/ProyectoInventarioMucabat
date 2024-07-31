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
app.use('/resources',express.static(-dirname))


/**
 * prueba de solicitud get 
 */
app.get('/',(req,res)=>{
    res.send('HOLA')
})

//Inicio del servidor que estara a la escucha por el puerto 8080
app.listen(8080,(req, resp)=>{
    console.log("Server listening in https://localhost:8080");
})
