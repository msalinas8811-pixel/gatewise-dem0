#!/usr/bin/env bash
# Copia a public/ solo los archivos que se publican en la web (nada de reglas, funciones ni pruebas).
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf public && mkdir -p public/.well-known
cp index.html sw.js firebase-messaging-sw.js config.js manifest.json icon-192.png icon-512.png privacidad.html eliminar-cuenta.html public/
cp -r css js public/
cp .well-known/assetlinks.json public/.well-known/
echo "public/ listo: $(ls public | wc -l) archivos"
