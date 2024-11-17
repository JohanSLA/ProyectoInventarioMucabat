#!/bin/bash
echo "Esperando a que la base de datos esté lista..."
wait-for-it.sh db:3306 --timeout=30 --strict -- echo "La base de datos está lista"

# Iniciar servidor (Ejemplo para Node.js)
npm start
