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
                    showConfirmButton: false,
                    timer: 20000,
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

/**
 * Manejod e solicitud que renderiza a la vista principal de gestion de turno
 */
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

/**
 * Manejo de solicitud para la gestion de reservas
 */
app.get('/reservacionEspacio',async(req,res)=>{
    if (req.session.loggedin) {
        console.log('Server: El usuario '+req.session.name +' entro al proceso de reservacion de espacios'); 
        res.render('gestionReservas.ejs',{
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

    console.log('Server: Datos de la entrega recibidos:', { datos });

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
                    console.log('Entrega registrada con ID:', results.rows[0].id_entrega);
                    resolve(results.rows[0].id_entrega); // ID generado
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
                    'INSERT INTO EntregaProducto (id_entrega, id_producto, cantidad, observacion) VALUES ($1, $2, $3, $4) RETURNING id_entrega_producto',
                    [id_entrega, id_producto, cantidad, observacion],
                    (error, results) => {
                        if (error) {
                            console.error('Error al insertar en EntregaProducto:', error);
                            return reject(error);
                        }
                        console.log('Producto registrado en la entrega con ID:', results.rows[0].id_entrega_producto);
                        resolve(results.rows[0].id_entrega_producto_producto);
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
 * Principal de gestion de reservas
 */
app.get('/gestion_proveedor',async(req,res)=>{
    if (req.session.loggedin) {
        console.log('Server: El usuario '+req.session.name +' entro al proceso de gestion de proveedores'); //Prueba
        res.render('gestion_proveedor.ejs',{
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
 * Metodo que me permite agregar al proveedor 
 */
app.post('/addProveedorForm', async(req,res)=>{

    console.log("Server: El usuario "+req.session.name+"Esta intentando agregar un proveedor")

    const nombre= req.body.nombre; //captura el nombre del proveedor
    const contacto= req.body.contacto; //nombre de la persona de contacto
    const telefono= req.body.telefono; //Telefono del proveedor
    const email= req.body.email; //email del proveedor
    const categoria= req.body.categoria; //categoria del proveedor
    

    

    //Verifica si el user y pass estan llenos (contienen valores)
    if (nombre && contacto && telefono && email && categoria) {
        
        pool.query(' INSERT INTO proveedor (nombre, contacto, telefono, email, categoria) VALUES ($1, $2, $3, $4, $5)', [nombre,contacto,telefono,email,categoria], async(error,results)=>{
            if (error) {
                console.log("Server: Ocurrio un problema en el registro del proveedor");
                console.log("Server: El error es " + error); //Muestar el error
                console.log(error);
    
                 //Enviamos los datos para que nos confirme por medio de ventana si se registro con exito
                 res.render('gestion_proveedor',{
                    login: true,
                    nombre: req.session.name,
                    alert: true,
                    alertTitle: "Oops ...!",
                    alertMessage: "¡Error en el registro del proveedor!"+"error:"+error,
                    alertIcon: 'error',
                    showConfirmButton: false, //Oculta el boton de confirmación
                    timer: 2000, //Tiempo de espera para que desaparezca (milisegundos) o undefined para no etablecer tiempo
                    ruta:'gestion_proveedor' //Ruta donde nos llevara despues de esto(Principal)
                })
             }else{
                console.log("Server: Se registro con exito el proveedor con nombre: "+nombre);
    
                //Enviamos los datos para que nos confirme por emdio de ventana si se registro con exito
                res.render('gestion_proveedor',{
                    login: true,
                    nombre: req.session.name,
                    alert: true,
                    alertTitle: "Genial!",
                    alertMessage: "Proveedor registrado exitosamente!",
                    alertIcon: 'success',
                    showConfirmButton: false, //Oculta el boton de confirmación
                    timer: 2000, //Tiempo de espera para que desaparezca (milisegundos) o undefined para no etablecer tiempo
                    ruta: 'gestion_proveedor' //Ruta donde nos llevara despues de esto(Principal)
                })
                
             }
        })
    }
})



/**
 * Metodo que me permite generar una reserva
 */
app.post('/crearReserva', async(req,res)=>{

    console.log("Server: El usuario "+req.session.name+"Esta intentando crear una reserva")

    const nombre= req.body.nombre; //captura el nombre del proveedor
    const cantidad= req.body.cantidad; //nombre de la persona de contacto
    const telefono= req.body.telefono; //Telefono del proveedor
    const email= req.body.email; //email del proveedor
    const categoria= req.body.categoria; //categoria del proveedor
    const fecha= req.body.fecha; //Toma la fecha que quiere la reservacion el usuario


    //Verifica si el user y pass estan llenos (contienen valores)
    if (nombre && cantidad && fecha && telefono && email && categoria) {
        
        console.log('entro')
        
        pool.query(' INSERT INTO reservas (nombre, cantidad, telefono, email, fecha, categoria) VALUES ($1, $2, $3, $4, $5, $6)', [nombre,cantidad,telefono,email,fecha,categoria], async(error,results)=>{
            if (error) {
                console.log("Server: Ocurrio un problema en la reservacion del espacio");
                console.log("Server: El error es " + error); //Muestar el error
                console.log(error);
    
                 //Enviamos los datos para que nos confirme por medio de ventana si se registro con exito
                 res.render('gestionReservas',{
                    login: true,
                    nombre: req.session.name,
                    alert: true,
                    alertTitle: "Oops ...!",
                    alertMessage: "¡Error en la reservación del espacio!"+"error:"+error,
                    alertIcon: 'error',
                    showConfirmButton: false, //Oculta el boton de confirmación
                    timer: 2000, //Tiempo de espera para que desaparezca (milisegundos) o undefined para no etablecer tiempo
                    ruta:'/reservacionEspacio' //Ruta donde nos llevara despues de esto(Principal)
                })
             }else{
                console.log("Server: Se reservo con exito el espacio para el usuario: "+nombre);
    
                //Enviamos los datos para que nos confirme por emdio de ventana si se registro con exito
                res.render('gestionReservas',{
                    login: true,
                    nombre: req.session.name,
                    alert: true,
                    alertTitle: "Genial!",
                    alertMessage: "Reservación procesada exitosamente!",
                    alertIcon: 'success',
                    showConfirmButton: false, //Oculta el boton de confirmación
                    timer: 2000, //Tiempo de espera para que desaparezca (milisegundos) o undefined para no etablecer tiempo
                    ruta: '/reservacionEspacio' //Ruta donde nos llevara despues de esto(Principal)
                })
                
             }
        })
    }
})


/**
 * Eliminar reservación
 */
app.post('/eliminarReservacion', async (req, res) => {
    console.log("Server: El usuario " + req.session.name + " está intentando eliminar una reservación");

    const nombre = req.body.nombreReservante; // Captura el nombre del reservante

    // Verificar si el nombre está presente
    if (nombre) {
        try {
            // Realizar la consulta para eliminar el registro
            const result = await pool.query(
                'DELETE FROM reservas WHERE nombre = $1',
                [nombre]
            );

            if (result.rowCount > 0) {
                console.log("Server: Se eliminó con éxito la reservación del usuario: " + nombre);

                // Enviar confirmación al usuario
                res.render('gestionReservas', {
                    login: true,
                    nombre: req.session.name,
                    alert: true,
                    alertTitle: "¡Reservación Eliminada!",
                    alertMessage: "La reservación fue eliminada exitosamente.",
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 2000,
                    ruta: '/reservacionEspacio'
                });
            } else {
                console.log("Server: No se encontró una reservación con el nombre: " + nombre);

                res.render('gestionReservas', {
                    login: true,
                    nombre: req.session.name,
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "No se encontró una reservación con ese nombre.",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 2000,
                    ruta: '/reservacionEspacio'
                });
            }
        } catch (error) {
            console.error("Server: Error eliminando la reservación: " + error);

            res.render('gestionReservas', {
                login: true,
                nombre: req.session.name,
                alert: true,
                alertTitle: "Oops ...!",
                alertMessage: "Error eliminando la reservación. Por favor, intenta de nuevo.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 2000,
                ruta: '/reservacionEspacio'
            });
        }
    } else {
        console.log("Server: El nombre del reservante no fue proporcionado");

        res.render('gestionReservas', {
            login: true,
            nombre: req.session.name,
            alert: true,
            alertTitle: "Error",
            alertMessage: "Por favor, proporciona un nombre para eliminar la reservación.",
            alertIcon: 'warning',
            showConfirmButton: true,
            ruta: '/reservacionEspacio'
        });
    }
});



/**
 * Establecimiento de rutas
 */



//Inicio del servidor que estara a la escucha por el puerto 8080
app.listen(port,(req, resp)=>{
    console.log("Server listening in https://localhost:"+port);
})
