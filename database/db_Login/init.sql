-- Comando para crear la base de datos en caso de que no exista(primer uso de la app)
CREATE DATABASE IF NOT EXISTS login;

-- Comando para indicar que use la base de datos con nombre Login
USE login;

-- Creacion de la table en caso de que no exista(primer uso de la app)
CREATE TABLE IF NOT EXISTS Login_Usuarios (
    correo VARCHAR(200) PRIMARY KEY,
    contrasena VARCHAR(250) NOT NULL,
    nombre VARCHAR(100) NOT NULL
);

-- Creacion de la table en caso de que no exista(primer uso de la app)
CREATE TABLE IF NOT EXISTS Login_Usuarios (
    correo VARCHAR(200) PRIMARY KEY,
    contrasena VARCHAR(250) NOT NULL,
    nombre VARCHAR(100) NOT NULL
);

-- Crear otras tablas si es necesario
CREATE TABLE IF NOT EXISTS Producto (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cantidad INT NOT NULL
);

-- Poblacion de productos
INSERT INTO Producto (nombre, cantidad)
VALUES
    ('Vaso cristal', 50),
    ('Vaso porcelana', 30),
    ('Taza cerámica', 40),
    ('Plato hondo', 25);

-- Creación de la tabla EntregaInventario
CREATE TABLE IF NOT EXISTS EntregaInventario (
    id_entrega INT AUTO_INCREMENT PRIMARY KEY,  -- Llave primaria, autoincrementada
    usuario_recibe VARCHAR(100) NOT NULL,       -- Usuario que recibe
    usuario_entrega VARCHAR(100) NOT NULL,      -- Usuario que entrega
    fecha_entrega DATETIME DEFAULT CURRENT_TIMESTAMP -- Fecha y hora de la entrega
);

-- Creación de la tabla EntregaProducto
CREATE TABLE IF NOT EXISTS EntregaProducto (
    id_entrega_producto INT AUTO_INCREMENT PRIMARY KEY, -- Llave primaria autoincrementada
    id_entrega INT NOT NULL,                            -- Referencia a EntregaInventario
    id_producto INT NOT NULL,                           -- Referencia a Producto
    cantidad INT NOT NULL,                              -- Cantidad de productos entregados
    observacion VARCHAR(255),                           -- Observaciones sobre el producto
    FOREIGN KEY (id_entrega) REFERENCES EntregaInventario(id_entrega), -- Relación con EntregaInventario
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)         -- Relación con Producto
);
