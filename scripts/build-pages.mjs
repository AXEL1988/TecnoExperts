/**
 * Build estático para GitHub Pages.
 *
 * El sitio es SSR: tiene panel administrativo, rutas de API y sesiones. Nada de eso
 * puede correr en Pages, así que este script:
 *   1. Oculta `admin/` y `api/` renombrándolas con guion bajo (Astro ignora ese prefijo).
 *   2. Construye con la configuración estática.
 *   3. Restaura los nombres originales, pase lo que pase.
 *   4. Prefija las rutas absolutas con el subdirectorio del repositorio y versiona
 *      las imágenes de `public/img`.
 *
 * El paso 4 existe porque el sitio vive en /TecnoExperts/ y las rutas absolutas
 * (incluidas las que vienen de SQLite) apuntarían a la raíz del dominio. El `?v=`
 * de las imágenes cambia con cada commit: sin él, quien ya visitó el sitio seguiría
 * viendo la foto anterior desde su caché aunque el archivo se haya reemplazado.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, renameSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.PAGES_BASE ?? '/TecnoExperts';
const PAGES = 'src/pages';
const HIDDEN = [['admin', '_admin'], ['api', '_api']];
/* Versión para la caché: el commit publicado, o la hora del build si no hay git. */
const VERSION = (() => {
  try { return execFileSync('git', ['rev-parse', '--short', 'HEAD']).toString().trim(); }
  catch { return Date.now().toString(36); }
})();

const hide = () => HIDDEN.forEach(([from, to]) => {
  if (existsSync(join(PAGES, from))) renameSync(join(PAGES, from), join(PAGES, to));
});
const restore = () => HIDDEN.forEach(([from, to]) => {
  if (existsSync(join(PAGES, to))) renameSync(join(PAGES, to), join(PAGES, from));
});

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

hide();
try {
  execFileSync('npx', ['astro', 'build', '--config', 'astro.config.static.mjs'], { stdio: 'inherit' });
} finally {
  restore();
}

// Prefijar rutas absolutas. Se excluyen protocolos y las que ya llevan el prefijo.
const skip = new RegExp(`^(${BASE}/|//|/[a-z]+:)`);
let touched = 0;
for (const file of walk('dist')) {
  if (!/\.(html|css|js)$/.test(file)) continue;
  const original = readFileSync(file, 'utf8');
  const updated = original.replace(
    /(href|src|srcset|action|content)=("|')(\/[^"']*)/g,
    (match, attr, quote, path) => (skip.test(path) ? match : `${attr}=${quote}${BASE}${path}`)
  ).replace(/(src|href)=("|')([^"']*\/img\/[^"'?]*)/g, `$1=$2$3?v=${VERSION}`);
  if (updated !== original) { writeFileSync(file, updated); touched++; }
}

// Pages sirve tal cual: sin este archivo, Jekyll ignora los directorios que empiezan con guion bajo.
writeFileSync('dist/.nojekyll', '');
console.log(`\nRutas prefijadas con ${BASE} e imágenes versionadas (v=${VERSION}) en ${touched} archivos.`);
