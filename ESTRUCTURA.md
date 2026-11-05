# GateWise · estructura del proyecto

Versión 2026.11.05-25. La app ya no es un solo `index.html` de 730 KB. Ahora está separada por módulos, para que cualquier desarrollador encuentre lo que busca y pueda cambiar una parte sin tocar las demás.

```
mi-residencial/
├── index.html                 Cascarón: metadatos, estilos y el orden de carga de los módulos
├── config.js                  Modo (demo / produccion) y llaves de Firebase  ← lo editas tú
├── manifest.json, icon-*.png  Instalación como app (PWA)
├── sw.js                      Funcionamiento sin internet (lista de archivos en caché)
├── firebase-messaging-sw.js   Notificaciones con la app cerrada
│
├── css/
│   ├── base.css               Colores, tipografía, tarjetas, formularios
│   ├── diseno.css             Capa de diseño: sombras, íconos, barra superior, menú
│   ├── botones.css            Sistema de botones (UI 6): la única fuente de estilos de botón
│   └── residente.css          Pantallas del residente (UI 7): letra grande, botones grandes
│
├── js/
│   ├── app/                   La app, por módulos (se cargan en orden numérico)
│   │   ├── 01-nucleo.js           Datos, estado, utilidades, pantallas base e ingreso
│   │   ├── 02-administracion.js   Casas, pagos, avisos, solicitudes, usuarios
│   │   ├── 03-residente.js        Inicio, pases de visita, pagos, inquilinos
│   │   ├── 04-vigilancia.js       Portería: PIN, ingresos y salidas
│   │   ├── 05-plataforma.js       Panel del dueño: varias residenciales
│   │   ├── 06-cobrador.js         Cobro a domicilio y cierres
│   │   ├── 07-importar-casas.js   Carga de casas desde Excel / CSV
│   │   ├── 08-region-idioma.js    Buscador, directorio, países, idioma, condominios
│   │   ├── 09-pdf-reportes.js     Generador de PDF, reportes de mora y solvencia
│   │   ├── 10-tienda.js           Vendedores, productos, pedidos y chat
│   │   ├── 11-marca.js            Logo y colores por residencial
│   │   ├── 12-nube-demo.js        Sincronización de la DEMO (no se usa en producción)
│   │   ├── 13-menu-movil.js       Íconos y menú móvil
│   │   ├── 14-opiniones.js        Calificaciones de 1 a 5 estrellas
│   │   ├── 15-votaciones.js       Elecciones y aprobación de proyectos
│   │   ├── 16-dueno-app.js        Acceso exclusivo del Administrador de la APP
│   │   ├── 17-menu-lateral.js     Menú lateral (PC, tablet, teléfono)
│   │   ├── 18-precios.js          Planes y precios; versión de la app
│   │   ├── 19-movimiento.js       Animaciones y acabado
│   │   ├── 20-profundidad.js      Fondos, tarjetas con profundidad, contadores
│   │   ├── 21-comunidad.js        Academias, eventos (fiestas y torneos) y reservas
│   │   ├── 22-casas-autorizadas.js  Límite de casas autorizadas y carga masiva
│   │   ├── 23-botones.js          Botones: íconos, onda, "cargando", confirmaciones
│   │   ├── 24-residente.js        Inicio del residente, pagos y tamaño de letra
│   │   └── 99-arranque.js         Arranca la app en modo demo
│   └── prod.js                Modo producción: Firestore, Authentication, push
│
├── functions/                 Funciones del servidor (Cloud Functions) + pruebas
├── firestore.rules, storage.rules, firestore.indexes.json   Seguridad de la base de datos
├── tests/                     Pruebas de reglas (emulador) y de la app por rol (navegador)
├── scripts/preparar-public.sh Arma la carpeta que se publica
└── .github/workflows/         Pruebas y publicación automática
```

## Reglas para trabajar en el código

1. **El orden de los módulos importa.** Cada módulo puede ampliar lo que definieron los anteriores. Por ejemplo, `20-profundidad.js` envuelve `render()`. Un módulo nuevo va al final, antes de `99-arranque.js`, con el número siguiente.
2. **Al cargar, un módulo no puede usar una función de un módulo posterior.** Dentro de las funciones sí puede, porque se ejecutan después. Por eso las vistas de la tienda se registran al final de `10-tienda.js`.
3. **Si agregas un módulo**, añádelo en `index.html` y en la lista `ASSETS` de `sw.js`. Sube también la versión (`CACHE` en `sw.js` y `APP_VERSION` en `18-precios.js`).
4. **Los botones se diseñan solo en `css/botones.css`.** Al arrancar, `23-botones.js` retira las reglas de botón de las capas anteriores, así no hay estilos peleando entre sí.
5. **Nada de `confirm()` ni `prompt()` del navegador.** Usa las funciones propias:
   - `confirmar(título, texto, botón, alConfirmar, {icono, tono:'bad'|'warn'|'pri'|'ok', no:'Cancelar'})`
   - `pedirTexto(título, etiqueta, valorInicial, alEnviar, {boton})`

## Botones: cómo se usan

| Clase | Para qué | Aspecto |
|---|---|---|
| `btn` | Acción principal | Píldora con degradado de la marca y brillo de color |
| `btn ok` | Confirmar, aprobar | Igual, en verde |
| `btn sec` | Acción secundaria | Fondo suave del color de la marca |
| `btn ghost` | Acción neutra | Contorno suave sobre la tarjeta |
| `btn bad` | Rechazar, eliminar | Rojo suave |
| `smb` / `big-ok` / `block` | Compacto / grande / ancho completo | — |

Lo que hace `23-botones.js` sin que tengas que programarlo:

- **Ícono automático según el texto.** Aprobar ✓, Rechazar ✕, Eliminar (papelera), Ver (ojo), Nuevo (+), Enviar, Subir, Pagar, Compartir, Editar, Descargar, Llamar, Copiar, Buscar. Si el botón ya trae un ícono, lo respeta.
- **Flecha de avance** en los botones principales de ancho completo que envían un formulario.
- **Onda** desde el punto donde se toca, y una vibración corta en Android.
- **Cargando.** Si la acción espera al servidor (modo producción), el botón muestra un indicador y no acepta más toques hasta que termina. Así se evitan registros duplicados.
- **Doble toque bloqueado.** Dos envíos del mismo formulario en menos de 150 ms cuentan como uno.
- **Accesibilidad.** Anillo de foco con teclado, y respeto por "reducir movimiento" del teléfono.

## Pruebas

- `node functions/test/core.test.js`: lógica del servidor (16 pruebas).
- `tests/rules.test.js`: reglas de seguridad contra el emulador. Corren en GitHub Actions.
- `tests/navegador/prueba_roles.py`: la app en modo producción con Firebase simulado, rol por rol.

## Pantallas del residente (pensadas para personas mayores)

`24-residente.js` y `css/residente.css`:

- **Inicio nuevo.** Arriba va el estado de cuenta: "¡Estás al día!" o "Tienes 2 meses atrasados · $111.00", con el botón grande **Pagar mi cuota**.
- **"¿Qué necesitas hoy?"** Botones grandes, cada uno con ícono, título con verbo y una explicación corta: dar acceso a una visita, pagar, llamar a portería (marca directo), avisos, reservar un área, reportar un problema. Emergencias va en rojo, a todo lo ancho.
- **Elegir el tipo de pase** con descripciones ("Familia o amigos", "Repartidor de comida").
- **Lectura cómoda** para residentes e inquilinos: letra de 16.5 px o más, textos grises más oscuros, filas y campos más altos.
- **Tamaño de letra.** El botón «Aa Letra» del inicio, o Menú › Tamaño de letra, ofrece Normal, Grande y Muy grande. Se guarda en ese teléfono y está disponible para todos los roles.
