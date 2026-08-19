// Configuración para el build estático de GitHub Pages.
// El sitio real (SSR con panel administrativo) usa astro.config.mjs.
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  markdown: { syntaxHighlight: false }
});
