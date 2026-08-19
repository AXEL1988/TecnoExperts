# Tecno Experts Web

Primera implementación de la web corporativa de Tecno Experts basada en la Opción 2 (versión blanca) del documento entregado por el cliente.

## Stack

- Astro 7 SSR
- Node.js
- SQLite con better-sqlite3
- HTML/CSS/JS sin framework de frontend adicional

## Requisitos

Node.js 22.12+ (Astro 7 requiere Node 22.12 o superior).

## Instalación

```bash
npm install
npm run dev
```

## Producción

```bash
npm run build
npm start
```

## Administrador inicial

Usuario: `admin`

Contraseña inicial: `ChangeMe123!`

**Cambiarla antes de entregar el sitio al cliente.**

## Estructura

- `src/pages/` — páginas públicas y panel
- `src/pages/admin/[entity].astro` — pantalla CRUD genérica del panel
- `src/pages/api/admin/[entity]/` — API CRUD genérica (`services`, `cases`, `team`, `partners`)
- `src/pages/api/admin/settings.ts` — textos editables del sitio
- `src/lib/db.ts` — SQLite, esquema, seeds y consultas
- `src/lib/entities.ts` — definición de entidades del panel (tabla, campos, validación)
- `src/lib/settings.ts` — textos editables agrupados por página
- `src/lib/auth.ts` — sesiones y autenticación
- `src/scripts/admin-crud.js` — cliente del panel, común a todas las entidades
- `src/styles/global.css` — estilos globales (sitio público y panel)
- `data/` — archivo SQLite generado al iniciar
- `design/` — maquetas aprobadas, originales y guía del sistema de diseño
- `src/components/` — Icon.astro (iconos SVG) y Logo.astro

## Agregar una entidad al panel

Basta con declararla en `src/lib/entities.ts` (tabla, etiquetas y campos): la API,
el formulario y el listado se generan solos. Solo hay que crear la tabla en `src/lib/db.ts`.
