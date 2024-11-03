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