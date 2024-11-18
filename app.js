/**
 * Autor: Johan Stiven Londoño Alvarez
 * julian
 * didier
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
const pool = require('./database/db_Login/db');

const { error, Console } = require('console');


//-----------------------  9- Establecimiento de rutas para nuestar app ---------------------------------------
    /**
     * Pagina principal de la cafeteria
     */
    app.get('/',(req,res)=>{
        if (req.session.loggedin) {
            console.log('Server: Loggedin true'); //Prueba
            console.log('Server: El ussuario conectado es:'+req.session.name);
            res.render('index2',{
                login: true,
                nombre: req.session.name
            });
        }else{
            res.render('index2',{
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


    pool.query(' INSERT INTO Login_Usuarios (correo, contrasena, nombre) VALUES ($1, $2, $3)', [user,passwordHaash,name], async(error,results)=>{
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

    console.log(user)
    console.log(pass)

    //Verifica si el user y pass estan llenos (contienen valores)
    if (user && pass) {
        pool.query('SELECT * FROM Login_Usuarios WHERE correo = $1', [user], async (error, results) => { 
           if (results.rows.length == 0 || !(await bcryptjs.compare(pass, results.rows[0].contrasena))) { 
                // Si no encontró resultados o la contraseña del user no es la correcta
                console.log('SERVER: Logueo erróneo, usuario y/o contraseña incorrecta');
                res.render('login', {
                    alert: true,
                    alertTitle: "Opsss...!",
                    alertMessage: "¡Usuario y/o contraseña erróneos!",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: undefined,
                    ruta: 'login'
                });
            } else {
                req.session.loggedin = true; // Esto sirve para verificar que si hay una sesión activa y para destruirla fácilmente en caso de cerrarse
                req.session.name = results.rows[0].nombre; // Toma el nombre del usuario que inició sesión
                res.render('login', {
                    alert: true,
                    alertTitle: "Genial!!",
                    alertMessage: "¡Inicio de sesión exitoso!",
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 2000,
                    ruta: '/' // Ruta donde nos llevará después de esto
                });
            }
        })  
    } else {
        // En caso de que los campos estén vacíos (user y password del HTML login)
        res.send('¡Por favor ingrese un usuario y una contraseña!');
    }
})


app.get('/entregaTurno',async(req,res)=>{
    if (req.session.loggedin) {
        console.log('Server: El usuario '+req.session.name +' entro al proceso de entrega de turno'); //Prueba
        res.render('entregaTurno.ejs',{
            login: true,
            nombre: req.session.name
        });
    }else{
        res.render('index2',{
            login: false,
            nombre: 'Debe iniciar sección'
        })
    }
})



app.post('/register-entrega', async (req, res) => {
    const { datos } = req.body; // Datos enviados desde el cliente

    if (!Array.isArray(datos) || datos.length === 0) {
        console.log('entro aqui')
        return res.status(400).json({ success: false, message: 'Datos insuficientes o no válidos' });
    }

    console.log('Datos de la entrega recibidos:', { datos });

    try {
        // Inserción en EntregaInventario y obtención del ID generado
        const id_entrega = await new Promise((resolve, reject) => {
            pool.query(
                'INSERT INTO EntregaInventario (usuario_recibe, usuario_entrega) VALUES ($1, $2) RETURNING id_entrega',
                ['johan', 'paco'],
                (error, results) => {
                    if (error) {
                        console.error('Error al insertar en EntregaInventario:', error);
                        return reject(error);
                    }
                    console.log('Entrega registrada con ID:', results.rows[0].id);
                    resolve(results.rows[0].id); // ID generado
                }
            );      
        });





        // Iterar sobre los productos y asociarlos con el ID de entrega
        for (const dato of datos) {
            const { producto, cantidad, observacion } = dato;

            console.log(`Procesando producto: ${producto}, cantidad: ${cantidad}, observación: ${observacion}`);

            // Obtiene el ID del producto
            const id_producto = await obtenerIdProducto(producto);
            if (!id_producto) {
                console.error(`Producto no encontrado: ${producto}`);
                continue; // Saltar este producto si no se encuentra
            }

            // Inserción en EntregaProducto
            await new Promise((resolve, reject) => {
                pool.query(
                    'INSERT INTO EntregaProducto (id_entrega, id_producto, cantidad, observacion) VALUES ($1, $2, $3, $4) RETURNING id_entrega',
                    [id_entrega, id_producto, cantidad, observacion],
                    (error, results) => {
                        if (error) {
                            console.error('Error al insertar en EntregaProducto:', error);
                            return reject(error);
                        }
                        console.log('Producto registrado en la entrega con ID:', results.rows[0].id);
                        resolve(results.rows[0].id);
                    }
                );
                
            });
        }

        // Respuesta exitosa
        res.json({ success: true, message: 'Entrega y productos registrados exitosamente' });
        
    } catch (error) {
        console.error('Error durante el procesamiento de la entrega:', error);
        res.status(500).json({ success: false, message: 'Error procesando la entrega' });
    }
});

// Función para obtener el ID del producto desde la base de datos
async function obtenerIdProducto(nombreProducto) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT id_producto FROM Producto WHERE nombre = $1',
            [nombreProducto],
            (error, results) => {
                if (error) {
                    console.error("Error al buscar el producto:", error);
                    return reject(error);
                }
                if (results.rows.length > 0) {
                    resolve(results.rows[0].id_producto); // Retorna el ID del producto
                } else {
                    resolve(null); // Retorna null si no se encuentra el producto
                }
            }
        );
        
    });
}







/**
 * Establecimiento de rutas
 */



//Inicio del servidor que estara a la escucha por el puerto 8080
app.listen(port,(req, resp)=>{
    console.log("Server listening in https://localhost:"+port);
})
