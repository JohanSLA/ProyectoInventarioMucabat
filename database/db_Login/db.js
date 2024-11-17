/**
 * Aqui va todo lo relacionado con la conexión a la base de datos
 * 
 */


//Invocamos a mysql el cual nos servira para establecer la conexion con la base de datos
const mysql = require('mysql2');


//Establecemos las variables para la conexion
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'postgresql://root:EKv8cL8ChenMrY5Xn4l9FvzBzIHA1SGQ@dpg-cst3oqhu0jms73egr8sg-a/db_qlpk' ,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'EKv8cL8ChenMrY5Xn4l9FvzBzIHA1SGQ' ,
    database: process.env.DB_DATABASE || 'db_qlpk'
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