# Gala Café Cochoa — POS

Punto de venta para Gala Café en un solo archivo (`index.html`), sin dependencias ni build.

## Estaciones
- **Caja**: tomar pedidos, asignar beeper, elegir medio de pago y calcular el vuelto.
- **Barra**: tickets en vivo con checklist por ítem y aviso sonoro.
- **Cierre del día**: KPIs, ventas por producto y por hora, cuadratura de caja y exportación a CSV.
- **Menú y precios**: editar productos, categorías, opciones y cantidad de beepers.

## Correr en local
```bash
# opción 1: abrir directo
open index.html            # macOS  (Windows: start index.html)

# opción 2: servidor local (recomendado)
npx serve .                # o: python3 -m http.server 8080
```

## Datos
- Fuera de claude.ai la app funciona en **modo local**: guarda en `localStorage` del navegador
  (clave `galacafe.v1`) y sincroniza entre pestañas del mismo navegador.
- La sincronización en vivo entre dispositivos (Caja en un equipo, Barra en otro) solo funciona
  dentro del Artifact de claude.ai. Para tenerla en producción hay que conectar un backend
  (por ejemplo Supabase o Firebase) en las funciones `startCloud`, `putOrder`, `patchOrder`,
  `removeOrder`, `saveMenu` y `saveClosing`.
- En el primer arranque sin datos se cargan pedidos demo (bloque marcado `/*DEMO-END*/`).
