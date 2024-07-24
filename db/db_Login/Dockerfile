#Especificamos la base de datos y la version que deseamos usar
FROM mysql:latest

#Establecemos una contraseña para el usuario raiz(root)
ENV MYSQL_ROOT_PASSWORD=root

#Copiamos nuestro archivo init.sql el cual inicaira la base de datos
COPY init.sql /docker-entrypoint-initdb.d/

#Expone por el puerto 3306 (mysql esta a la escucha por ese puerto)
EXPOSE 3306

