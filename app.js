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
const connection = require('./database/db_Login/db');
const { error } = require('console');


//-----------------------  9- Establecimiento de rutas para nuestar app ---------------------------------------
    /**
     * Pagina principal de la cafeteria
     */
    app.get('/',(req,res)=>{
        if (req.session.loggedin) {
            console.log('Server: Loggedin true'); //Prueba
            console.log('Server: El ussuario conectado es:'+req.session.name);
            res.render('index',{
                login: true,
                nombre: req.session.name
            });
        }else{
            res.render('index',{
                login: false,
                nombre: 'Debe iniciar sección'
            })
        }
    })


    /**
     * Manejo de ruta para cerrar seccion, esta destruye la seccion y redirecciona a la pagina principal (index.ejs)
     */
    app.get('/logout',(req,res)=>{
        req.session.destroy(()=>{
            res.redirect('/')
        });  
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


// --------------------------------------------- 10. Registración ---------------------------

app.post('/register', async (req,res) =>{

    console.log("Server: Se realizo una solicitud post")
    const user=req.body.user;
    const name=req.body.name;
    const password=req.body.pass; 
    let passwordHaash = await bcryptjs.hash(password, 8);//Encripta la contraseña para guardarla en la base de datos encriptada


    connection.query('INSERT INTO Login_Usuarios SET ?', {correo:user,contrasena:passwordHaash,nombre:name}, async(error,results)=>{
        if (error) {
            console.log("Server: Ocurrio un problema en la insercion del usuario");
            console.log("Server: El error es " + error); //Muestar el error
            console.log(error);

             //Enviamos los datos para que nos confirme por medio de ventana si se registro con exito
             res.render('register',{
                alert: true,
                alertTitle: "Oops ...!",
                alertMessage: "¡Error en el registro!",
                alertIcon: 'error',
                showConfirmButton: true, //Oculta el boton de confirmación
                timer: undefined, //Tiempo de espera para que desaparezca (milisegundos) o undefined para no etablecer tiempo
                ruta:'/' //Ruta donde nos llevara despues de esto(Principal)
            })
         }else{
            console.log("Server: Se registro con exito el usuario con email: "+user);

            //Enviamos los datos para que nos confirme por emdio de ventana si se registro con exito
            res.render('register',{
                alert: true,
                alertTitle: "Genial!",
                alertMessage: "¡Registro proesado exitosamente!",
                alertIcon: 'success',
                showConfirmButton: true, //Oculta el boton de confirmación
                timer: undefined, //Tiempo de espera para que desaparezca (milisegundos) o undefined para no etablecer tiempo
                ruta: '/' //Ruta donde nos llevara despues de esto(Principal)
            })
            
         }
    })
    
})


//------------------------------------------------------------- Login del usuario ----------------------------------
app.post('/auth', async(req,res)=>{
    const user= req.body.user; //Captura el user dle formulario login (email)
    const pass= req.body.pass; //captura la pass ingresada del login ( esta encriptada)

    let passwordHaash= await bcryptjs.hash(pass,8); //Contraseña encriptada



    //Verifica si el user y pass estan llenos (contienen valores)
    if(user && pass){
        connection.query('SELECT * FROM Login_Usuarios WHERE correo = ?',[user],async (error,results)=>{ //Busca en la base de datos si existe un usuario con ese username
            if (results == 0 || !(await bcryptjs.compare(pass, results[0].contrasena))) { //Si no encontro reultados o la contraseña del user no es la correcta
               console.log('SERVER: Logue erroneo, usuario y/o contraseña incorrecta')
                res.render('login',{
                    alert: true,
                    alertTitle: "Opsss...!",
                    alertMessage: "¡Usuario y/o contraseña erroneos!",
                    alertIcon: 'error',
                    showConfirmButton: true, //Oculta el boton de confirmación
                    timer: undefined, //Tiempo de espera para que desaparezca (milisegundos) o undefined para no etablecer tiempo
                    ruta:'login' //Ruta donde nos llevara despues de esto(Principal)
                })
            }else{
                req.session.loggedin= true; //Esto sirve para verificar que si hay una secion activa y para destruirla facilmenteen caso de cerrarse
                req.session.name = results[0].nombre; //Toma el nombre del usuario que inicio seccion
                res.render('login',{
                    alert: true,
                    alertTitle: "Genial!!",
                    alertMessage: "¡Inicio de seccion exitoso!",
                    alertIcon: 'success',
                    showConfirmButton: false, //Oculta el boton de confirmación
                    timer: 2000, //Tiempo de espera para que desaparezca (milisegundos) o undefined para no etablecer tiempo
                    ruta:'/' //Ruta donde nos llevara despues de esto()
                })
            }

        })
    }else{
        //En caso de que los campos esten vacios (user y password del html login)
        //En este caso como en el html pusimos que estos campos son requerid (requeridos), no necesitamos
        //Pero en el caso de no ponerlos requeridos pasamos a generar la alerta
        res.send('Porfavor ingrese un usuario y una password!');
    }
})


/**
 * Establecimiento de rutas
 */



//Inicio del servidor que estara a la escucha por el puerto 8080
app.listen(port,(req, resp)=>{
    console.log("Server listening in https://localhost:"+port);
})
