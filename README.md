# Gala Café Cochoa — POS

Punto de venta para Gala Café en un solo archivo (`index.html`), sin dependencias ni build.

## Estaciones
- **Caja**: tomar pedidos, asignar beeper, elegir medio de pago y calcular el vuelto.
- **Barra**: tickets en vivo con checklist por ítem y aviso sonoro.
- **Cierre del día**: KPIs, ventas por producto y por hora, cuadratura de caja y exportación a CSV.
- **Menú y precios**: editar productos, categorías, opciones y cantidad de beepers.

## Arquitectura
- `index.html`: toda la app (sin build).
- `api/sync.js` y `api/write.js`: funciones de Vercel (región `gru1`, São Paulo) que leen y escriben en **Neon Postgres**.
- Base de datos: proyecto Neon `cafe-gala` (`aws-sa-east-1`), tabla única `docs` con pedidos (`orders/<id>`),
  menú (`config/menu`) y cierres (`closings/<día>`). Cada escritura recibe un `rev` correlativo.
- Sincronización: cada pantalla consulta `/api/sync?since=<rev>` cada 1,5 s y aplica solo lo que cambió.
  Los cambios parciales (checklist de barra, estados) se fusionan en el servidor con `jsonb_deep_merge`.
- La app se conecta a la base con el rol `cafe_rw`, que solo puede leer, crear y actualizar en `docs`.

## Correr en local
```bash
npm install
vercel env pull .env.local   # trae DATABASE_URL
vercel dev                   # app + API en http://localhost:3000
```
Abriendo `index.html` directo (o en GitHub Pages) no hay API: la app pasa a **modo demo** y guarda en
`localStorage` del navegador (clave `galacafe.v1`), sincronizando solo entre pestañas del mismo navegador.

## Despliegue
Proyecto Vercel `cafe-gala` (equipo *Victor's projects*). `vercel deploy --prod` publica; la variable
`DATABASE_URL` ya está configurada en Production, Preview y Development.

## Datos de ejemplo
En **Cierre del día** está el botón para cargar o borrar pedidos de ejemplo (quedan marcados como demo).
