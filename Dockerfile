# Utiliza la imagen oficial de node desde Docker Hub
FROM node:latest

# Establece el directorio de trabajo en la carpeta de la aplicación (Crea ese directorio en el contenedor)
WORKDIR /app

# Copiamos el archivo package.json y package-lock.json (si existe) al directorio de trabajo
#El * dice: todos los archivos que inicien por package y terminen en .json copielos al directorio antes creadow
COPY package*.json ./

# Instalamos las dependencias del proyecto
#El comando run sirve para ejecutar esa linea dentro del directorio antes mencionado
RUN npm install

#Copia el resto de archivos (src y node_modules)
#Nota: el directorio node_modules lo ignoraremos especificandolo en el archivo llamado .dockerignore
COPY . .

EXPOSE 8081


# Comando para ejecutar la aplicación
# CMD nos dice que ejecute el comando node al archivo app.js que esta en el directorio src de mi contenedor
CMD ["node", "app.js"]