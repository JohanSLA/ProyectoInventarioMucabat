/**
 * Aqui va todo lo relacionado con la conexión a la base de datos
 * 
 */


//Invocamos a mysql el cual nos servira para establecer la conexion con la base de datos
const mysql = require('mysql2');


//Establecemos las variables para la conexion
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

//Ejecutamos la conexión, en caso de ocurrir un error; imprimimos un error por consola
connection.connect((error)=>{

    //Fragmento de codigo que se ejecutara en caso de ocurrir un error
    if(error){
        console.log('Ocurrio el siguiente error al intentar establecer conexión con la base de datos: '+error);
        return;
    }

    console.log('Base de datos conectada con exito');

});


//Exportamos el modulo para poder usarlo en otro lado con el nombre de connection
module.exports = connection;