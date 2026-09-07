# Roadmap

## Fase 1 — implementada
- Web pública de 5 páginas.
- SQLite.
- Autenticación administrativa.
- CRUD de Servicios.
- Formulario de Contacto persistido en SQLite.
- Seeds de servicios, casos y equipo a partir de la propuesta.

## Fase 2 — implementada
- CRUD Casos de éxito.
- CRUD Equipo (con foto por URL).
- Gestión de Partners (se muestran en la portada).
- Edición de textos de Home/Nosotros/Contacto desde `/admin/contenido`.
- Panel unificado: layout compartido, CRUD genérico por entidad y API `/api/admin/[entity]`.

## Fase 3
- Media manager / uploads.
- SEO editable.
- Gestión de solicitudes desde el panel.
- Cambio de contraseña del administrador.

## Fase 4 — implementada
- Rediseño completo de las 5 páginas contra las maquetas aprobadas (`design/mockups/`).
- Sistema de diseño con tokens, Poppins/Inter, iconos SVG propios y logo en SVG.
- Integración de los assets reales del cliente (fotos, retratos, logos de partners).
- Barra de estadísticas editable, campos de imagen e icono en Servicios, Casos y Equipo.
- Desplegables de Soluciones (dinámico) y Recursos (editable) en la navegación.
- Adaptable verificado de 360px a 1440px, sin desbordes horizontales.

## Fase 5 — revisión del cliente (implementada)
- Barra de confianza con solo mayoristas, agrupados por especialidad.
- Textos de portada, misión/visión, casos de éxito y contacto según el documento de revisión.
- Barra de estadísticas reducida a tres cifras (200+, 90+, 99.90%).
- Soluciones sin acordeón: CTA visible en cada servicio y botón flotante de cotización.
- Equipo: entra Daniel Arroyo (marketing), sale Christian Baeza.

## Pendiente de material del cliente
- Logos oficiales de **Proxmox, Microsoft y Dell**: hoy se muestran como texto en la barra de
  confianza. Basta con dejar los archivos en `public/img/partners/` y asignarlos desde
  `/admin/partners` o en las semillas de `src/lib/db.ts`.
- Reemplazar las **imágenes generadas con IA** por fotografía real en `public/img/hero/`,
  `public/img/servicios/` y `public/img/casos/`.

## Fase 6
- Reemplazar el logo SVG por el vectorial oficial de marca.
- Media manager / uploads desde el panel.
- SEO editable y gestión de solicitudes.
- Cambio de contraseña del administrador.
- Hardening y despliegue en el hosting final.
