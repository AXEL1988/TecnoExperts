import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  security: {
    checkOrigin: true,
    csp: true
  },
  // El sitio no usa Markdown; desactivar el resaltado evita los estilos inline
  // que rompen el CSP.
  markdown: {
    syntaxHighlight: false
  }
});
