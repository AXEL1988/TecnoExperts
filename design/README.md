# Diseño — Tecno Experts

## Carpetas

- `mockups/` — las 5 maquetas aprobadas del cliente. **Fuente de verdad del diseño.**
- `originales/` — PNG originales de las fotos e ilustraciones (IMG_XXXX.PNG).
- `referencias/` — hojas de contacto con iconos y logos sueltos. No se publican.

Los archivos optimizados que consume el sitio están en `public/img/`.

## Sistema de diseño

Los tokens viven en `:root` dentro de `src/styles/global.css`.

| Token | Valor | Uso |
|---|---|---|
| `--navy-900` | `#071A3C` | Banners oscuros, degradado de CTA |
| `--navy-800` | `#0B2350` | Panel de equipo |
| `--navy` | `#0F2445` | Títulos |
| `--blue` | `#1668E3` | Acento: kickers, links, iconos, segunda mitad de los titulares |
| `--blue-700` | `#0B4DC0` | Hover de botones azules |
| `--blue-100` | `#E8F1FE` | Fondo de las fichas de icono |
| `--amber` | `#F9B215` | CTA principal |
| `--green` | `#17A44F` | WhatsApp |
| `--muted` | `#5B6B82` | Texto secundario |
| `--soft` | `#F5F8FC` | Fondo de secciones y pie |
| `--line` | `#E4EBF4` | Bordes |

**Tipografía.** Poppins (600/700) para títulos, Inter (400–700) para texto. Se cargan desde
Google Fonts en `BaseLayout.astro`.

**Patrón de titular.** Los `h1` parten en dos: la primera mitad en navy y la segunda envuelta
en `<span class="accent">` en azul. En la portada el corte se calcula automáticamente desde el
punto del texto `hero_title`.

## Componentes

- `src/components/Icon.astro` — iconos de línea SVG. Heredan `currentColor` y aceptan `size` y
  `stroke`. Se referencian por nombre desde la base de datos (`icon_name`).
- `src/components/Logo.astro` — isologo. Acepta `variant="light"` para fondos oscuros.

> **Pendiente:** el logo es una reconstrucción en SVG a partir de las maquetas, no el archivo
> oficial de marca. Cuando exista el vectorial original, reemplazar `Logo.astro`.

## Mapeo original → uso en el sitio

| Original | Archivo publicado | Dónde se usa |
|---|---|---|
| IMG_6878 | `hero/hero-datacenter.webp` | Hero de Home |
| IMG_6933 | `hero/datacenter-pasillo.webp` | Hero de Soluciones y de Casos |
| IMG_6885 | `hero/seguridad-banner.webp` | Ilustración de los banners CTA oscuros |
| IMG_6928 | `equipo/equipo-tecno-experts.webp` | Hero de Nosotros |
| Retratos individuales | `equipo/{francisco-silva,fabian-quimbiulco,irene-sarabia}.webp` | Tarjetas de equipo y hero de Contacto |
| IMG_6935 / IMG_6936 | `servicios/virtualizacion-vmware.webp` / `icon-…` | Servicio VMware: imagen y tile de marca |
| IMG_6937 / IMG_6938 | `servicios/backup-recuperacion-veeam.webp` / `icon-…` | Servicio Veeam |
| IMG_6939 / IMG_6940 | `servicios/hardware-hp-lenovo.webp` / `icon-…` | Servicio Hardware |
| IMG_6941 / IMG_6942 | `servicios/draas-drp-iso-27001.webp` / `icon-…` | Servicio DRaaS/ISO |
| IMG_6926 | `servicios/candado-seguridad.webp` | Sección «¿Por qué Tecno Experts?» |
| IMG_6944 / 6945 / 6946 | `casos/{sector-financiero,telecomunicaciones,manufactura}.webp` | Casos de éxito |
| IMG_6929 / IMG_6930 | `valores/{mision,vision}.webp` | Disponibles; Misión y Visión usan iconos SVG |
| IMG_6932 | `partners/*.png` | Logos de partners, recortados uno a uno |
| IMG_6927, IMG_6931 | — | Hojas de iconos, solo referencia |

## Navegación

La cabecera tiene dos desplegables:

- **Soluciones** — se arma solo desde la tabla `services` (título corto, `icon_name` y beneficio),
  más un enlace final a `/soluciones`. Agregar un servicio lo agrega al menú.
- **Recursos** — se arma desde la tabla `nav_resources`, editable en «Menú Recursos». Si se
  desactivan todos sus enlaces, el desplegable desaparece de la navegación.

Abren por hover en escritorio y por clic en cualquier dispositivo; en móvil se comportan como
acordeón dentro del menú hamburguesa. Cierran al hacer clic fuera o con `Escape`, y solo uno
puede estar abierto a la vez. Los disparadores son `<button>` con `aria-expanded` y `aria-haspopup`.

## Qué es editable desde el panel

| Entidad | Campos que alimentan el diseño |
|---|---|
| Servicios | `short_title` (portada), `image_url`, `icon_url` (tile de marca), `icon_name` (icono de línea) |
| Casos | `image_url`, `icon_name` (icono de sector) |
| Equipo | `image_url` (retrato), `certification_logo` (ruta de logo **o** nombre de icono) |
| Estadísticas | `value`, `label`, `icon_name` — la barra de cifras de la portada |
| Partners | `image_url` |
| Menú Recursos | `label`, `url`, `description`, `icon_name` — alimenta el desplegable «Recursos» |
| Textos | `why_title`, `why_points` (uno por línea), `partner_intro`, misión, visión, hero |

`certification_logo` acepta las dos formas: si el valor contiene `/` se trata como imagen, si no,
como nombre de icono de `Icon.astro`.

Al arrancar, `src/lib/db.ts` rellena estos campos solo si están vacíos, así que nada de lo que
cambies desde el panel se sobrescribe.
