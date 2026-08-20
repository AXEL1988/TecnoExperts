import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomBytes, scryptSync } from 'node:crypto';

const dbPath = resolve(process.env.DB_PATH ?? './data/tecno-experts.db');
mkdirSync(dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) STRICT;

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
  ) STRICT;

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT NOT NULL,
    benefit TEXT NOT NULL,
    cta_text TEXT NOT NULL DEFAULT 'Solicitar cotización',
    cta_url TEXT NOT NULL DEFAULT '/contacto',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) STRICT;

  CREATE TABLE IF NOT EXISTS success_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    sector TEXT NOT NULL,
    problem TEXT NOT NULL,
    solution TEXT NOT NULL,
    result TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) STRICT;

  CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) STRICT;

  CREATE TABLE IF NOT EXISTS partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image_url TEXT,
    url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) STRICT;

  CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'shield',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) STRICT;

  CREATE TABLE IF NOT EXISTS nav_resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    icon_name TEXT NOT NULL DEFAULT 'doc',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) STRICT;

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) STRICT;

  CREATE TABLE IF NOT EXISTS contact_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    interest_area TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) STRICT;
`);

const passwordExists = db.prepare('SELECT id FROM admin_users LIMIT 1').get();
if (!passwordExists) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync('ChangeMe123!', salt, 64).toString('hex');
  db.prepare(`
    INSERT INTO admin_users (username, password_hash, password_salt)
    VALUES (?, ?, ?)
  `).run('admin', hash, salt);
}

const seedServices = [
  ['Virtualización VMware', 'virtualizacion-vmware', 'Consolida tu infraestructura física, reduce costos operativos y eleva la disponibilidad de tus sistemas críticos.', 'Consolidación y alta disponibilidad para infraestructura crítica.', 'Solicitar cotización', '/contacto', 1],
  ['Backup y Recuperación Veeam', 'backup-recuperacion-veeam', 'Backups inmutables, restauraciones en minutos y protección contra ransomware.', 'Continuidad y recuperación confiable de los datos.', 'Cotizar solución Veeam', '/contacto', 2],
  ['Hardware HP y Lenovo', 'hardware-hp-lenovo', 'Provisión de servidores y almacenamiento, dimensionamiento, virtualización y soporte experto.', 'Equipamiento corporativo ajustado a la carga real de trabajo.', 'Cotizar hardware', '/contacto', 3],
  ['DRaaS, DRP e ISO 27001', 'draas-drp-iso-27001', 'Planes de recuperación ante desastres y adecuaciones técnicas para cumplimiento normativo.', 'Preparación técnica para responder ante incidentes críticos.', 'Hablar con un especialista', '/contacto', 4]
];
const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get().count;
if (serviceCount === 0) {
  const insert = db.prepare(`
    INSERT INTO services (title, slug, short_description, benefit, cta_text, cta_url, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const tx = db.transaction((rows: typeof seedServices) => rows.forEach((row) => insert.run(...row)));
  tx(seedServices);
}

const seedCases = [
  ['Sector Financiero', 'Sector Financiero', 'Fallo crítico en arreglo RAID 5 degradado. Core financiero colapsado.', 'Activación inmediata de DRP. Recuperación desde backup inmutable Veeam.', 'Restauración total en 6h 45min. Cero pérdida de transacciones.', 1],
  ['Telecomunicaciones', 'Telecomunicaciones', 'RTO inaceptable de 48 horas y altos costos de energía.', 'Consolidación mediante VMware vSphere y contingencia.', '340 VMs migradas sin afectar servicio. RTO de 4h. Gasto físico reducido un 23%.', 2],
  ['Manufactura', 'Manufactura', 'Dependencia de servidores físicos legacy a punto de fallar.', 'Migración a entorno virtual VMware en infraestructura Lenovo.', 'Alta disponibilidad activa. La operación no sufrió downtime ante una falla posterior.', 3]
];
if (db.prepare('SELECT COUNT(*) as count FROM success_cases').get().count === 0) {
  const insert = db.prepare(`
    INSERT INTO success_cases (title, sector, problem, solution, result, display_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const tx = db.transaction((rows: typeof seedCases) => rows.forEach((row) => insert.run(...row)));
  tx(seedCases);
}

const seedTeam = [
  ['Francisco Silva', 'VMware Certified Professional', 'Arquitectura de virtualización. Maestro en consolidación de Data Centers y alta disponibilidad.', null, 1],
  ['Fabián Quimbiulco', 'Veeam VMCE', 'Especialista en continuidad de negocio. Garantiza que los datos estén intactos y operativos.', null, 2],
  ['Christian Baeza', 'Cloud & Security Specialist', 'Ciberseguridad. Blinda perímetros, segmenta redes y diseña estrategias Zero Trust.', null, 3],
  ['Irene Sarabia', 'Key Account Manager (KAM)', 'Gestión de clientes y preventa comercial. Tu aliada directa para presupuestos rápidos y transparentes.', null, 4]
];
if (db.prepare('SELECT COUNT(*) as count FROM team_members').get().count === 0) {
  const insert = db.prepare(`INSERT INTO team_members (name, role, description, image_url, display_order) VALUES (?, ?, ?, ?, ?)`);
  const tx = db.transaction((rows: typeof seedTeam) => rows.forEach((row) => insert.run(...row)));
  tx(seedTeam);
}

const seedPartners = [
  ['VMware', 1], ['Veeam', 2], ['HP', 3], ['Lenovo', 4], ['Telefónica', 5], ['Claro', 6]
];
if (db.prepare('SELECT COUNT(*) as count FROM partners').get().count === 0) {
  const insert = db.prepare(`INSERT INTO partners (name, display_order) VALUES (?, ?)`);
  const tx = db.transaction((rows: typeof seedPartners) => rows.forEach((row) => insert.run(...row)));
  tx(seedPartners);
}

// Migraciones incrementales: columnas de imagen para servicios y casos.
function addColumn(table: string, column: string, definition: string) {
  const exists = db.prepare(`SELECT 1 FROM pragma_table_info(?) WHERE name = ?`).get(table, column);
  if (exists) return false;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  return true;
}
addColumn('services', 'image_url', 'TEXT');
addColumn('services', 'icon_url', 'TEXT');
addColumn('success_cases', 'image_url', 'TEXT');
addColumn('services', 'short_title', 'TEXT');
addColumn('services', 'icon_name', 'TEXT');
addColumn('success_cases', 'icon_name', 'TEXT');
addColumn('team_members', 'certification_logo', 'TEXT');
// Texto breve de portada: en Soluciones se usa la descripción larga.
addColumn('services', 'home_description', 'TEXT');
// La barra de confianza de la portada lista solo a los partners comerciales.
const partnerScopeIsNew = addColumn('partners', 'show_in_home', 'INTEGER NOT NULL DEFAULT 1');
if (partnerScopeIsNew) {
  db.prepare(`UPDATE partners SET show_in_home = 0 WHERE name = ?`).run('ISO 27001');
}

// Assets del cliente: se aplican solo si el registro aún no tiene imagen propia.
const serviceAssets: Array<[string, string, string]> = [
  ['virtualizacion-vmware', '/img/servicios/virtualizacion-vmware.webp', '/img/servicios/icon-virtualizacion-vmware.webp'],
  ['backup-recuperacion-veeam', '/img/servicios/backup-recuperacion-veeam.webp', '/img/servicios/icon-backup-recuperacion-veeam.webp'],
  ['hardware-hp-lenovo', '/img/servicios/hardware-hp-lenovo.webp', '/img/servicios/icon-hardware-hp-lenovo.webp'],
  ['draas-drp-iso-27001', '/img/servicios/draas-drp-iso-27001.webp', '/img/servicios/icon-draas-drp-iso-27001.webp']
];
const fillService = db.prepare(`
  UPDATE services SET image_url = COALESCE(NULLIF(image_url, ''), ?), icon_url = COALESCE(NULLIF(icon_url, ''), ?)
  WHERE slug = ?
`);
for (const [slug, image, icon] of serviceAssets) fillService.run(image, icon, slug);

const beneficios: Array<[string, string, string]> = [
  ['virtualizacion-vmware',
   'Consolida tu infraestructura física, reduce costos operativos y eleva la disponibilidad de tus sistemas críticos.',
   'Consolida tu infraestructura física, reduce costos operativos y eleva la disponibilidad de tus sistemas críticos a un 99.99%.'],
  ['backup-recuperacion-veeam',
   'Backups inmutables, restauraciones en minutos y protección contra ransomware.',
   'Backups inmutables, restauraciones en minutos y protección contra ransomware. Tu seguro de vida digital.'],
  ['hardware-hp-lenovo',
   'Provisión de servidores y almacenamiento, dimensionamiento, virtualización y soporte experto.',
   'Provisión de servidores y almacenamiento. Analizamos tus cargas de trabajo, dimensionamos el hardware exacto, lo virtualizamos y nos encargamos del soporte.'],
  ['draas-drp-iso-27001',
   'Planes de recuperación ante desastres y adecuaciones técnicas para cumplimiento normativo.',
   'Planes de recuperación ante desastres y adecuaciones técnicas para cumplimiento normativo (SEPS, SuperCias) llevados a la realidad de tu red.']
];
const corregirBeneficio = db.prepare(`UPDATE services SET short_description = ? WHERE slug = ? AND short_description = ?`);
for (const [slug, anterior, nuevo] of beneficios) corregirBeneficio.run(nuevo, slug, anterior);

// Texto del botón según la maqueta.
db.prepare(`UPDATE services SET cta_text = ? WHERE slug = ? AND cta_text = ?`)
  .run('Solicitar Cotización de Virtualización', 'virtualizacion-vmware', 'Solicitar cotización');

const serviceMeta: Array<[string, string, string, string]> = [
  ['virtualizacion-vmware', 'Virtualización (VMware)', 'cube',
   'Migramos y consolidamos tus servidores sin afectar tu operación.'],
  ['backup-recuperacion-veeam', 'Continuidad (Veeam)', 'shield-check',
   'Garantizamos restauraciones de backup en minutos.'],
  ['hardware-hp-lenovo', 'Hardware Corporativo', 'server',
   'Equipamiento HP y Lenovo integrado y con soporte experto directo.'],
  ['draas-drp-iso-27001', 'DRaaS, DRP e ISO 27001', 'shield-lock',
   'Planes de recuperación ante desastres y cumplimiento normativo.']
];
const fillServiceMeta = db.prepare(`
  UPDATE services SET short_title = COALESCE(NULLIF(short_title, ''), ?),
                      icon_name = COALESCE(NULLIF(icon_name, ''), ?),
                      home_description = COALESCE(NULLIF(home_description, ''), ?)
  WHERE slug = ?
`);
for (const [slug, shortTitle, icon, homeText] of serviceMeta) fillServiceMeta.run(shortTitle, icon, homeText, slug);

const teamAssets: Array<[string, string, string]> = [
  ['Francisco Silva', '/img/equipo/francisco-silva.webp', '/img/partners/vmware.png'],
  ['Fabián Quimbiulco', '/img/equipo/fabian-quimbiulco.webp', '/img/partners/veeam.png'],
  ['Christian Baeza', '/img/equipo/christian-baeza.webp', 'cloud-lock'],
  ['Irene Sarabia', '/img/equipo/irene-sarabia.webp', 'users']
];
const fillTeam = db.prepare(`
  UPDATE team_members SET image_url = COALESCE(NULLIF(image_url, ''), ?), certification_logo = COALESCE(NULLIF(certification_logo, ''), ?)
  WHERE name = ?
`);
for (const [name, photo, cert] of teamAssets) fillTeam.run(photo, cert, name);

const caseIcons: Array<[string, string]> = [
  ['Sector Financiero', 'bank'],
  ['Telecomunicaciones', 'antenna'],
  ['Manufactura', 'factory']
];
const fillCaseIcon = db.prepare(`UPDATE success_cases SET icon_name = COALESCE(NULLIF(icon_name, ''), ?) WHERE sector = ?`);
for (const [sector, icon] of caseIcons) fillCaseIcon.run(icon, sector);

const seedStats: Array<[string, string, string, number]> = [
  ['10+', 'Años protegiendo empresas en Ecuador', 'shield', 1],
  ['200+', 'Proyectos de seguridad implementados', 'users', 2],
  ['30+', 'Certificaciones y alianzas tecnológicas', 'medal', 3],
  ['50+', 'Empresas confían en nuestras soluciones', 'building', 4],
  ['99.99%', 'Disponibilidad promedio en nuestros proyectos', 'clock', 5]
];
if (db.prepare('SELECT COUNT(*) as count FROM stats').get().count === 0) {
  const insert = db.prepare(`INSERT INTO stats (value, label, icon_name, display_order) VALUES (?, ?, ?, ?)`);
  const tx = db.transaction((rows: typeof seedStats) => rows.forEach((row) => insert.run(...row)));
  tx(seedStats);
}

const seedResources: Array<[string, string, string, string, number]> = [
  ['Casos de Éxito', '/casos', 'Resultados medibles en clientes reales.', 'medal', 1],
  ['Nuestro equipo', '/nosotros', 'Los ingenieros certificados detrás de cada proyecto.', 'users', 2],
  ['Agenda un diagnóstico', '/contacto', 'Revisión técnica sin costo de tu infraestructura.', 'calendar', 3]
];
if (db.prepare('SELECT COUNT(*) as count FROM nav_resources').get().count === 0) {
  const insert = db.prepare(`INSERT INTO nav_resources (label, url, description, icon_name, display_order) VALUES (?, ?, ?, ?, ?)`);
  const tx = db.transaction((rows: typeof seedResources) => rows.forEach((row) => insert.run(...row)));
  tx(seedResources);
}

const caseAssets: Array<[string, string]> = [
  ['Sector Financiero', '/img/casos/sector-financiero.webp'],
  ['Telecomunicaciones', '/img/casos/telecomunicaciones.webp'],
  ['Manufactura', '/img/casos/manufactura.webp']
];
const fillCase = db.prepare(`UPDATE success_cases SET image_url = COALESCE(NULLIF(image_url, ''), ?) WHERE sector = ?`);
for (const [sector, image] of caseAssets) fillCase.run(image, sector);

const ordenPartners: Array<[string, number]> = [
  ['VMware', 1], ['Veeam', 2], ['HP', 3], ['Lenovo', 4],
  ['ISO 27001', 5], ['Telefónica', 6], ['Claro', 7]
];
const fijarOrden = db.prepare(`UPDATE partners SET display_order = ? WHERE name = ? AND display_order <> ?`);
for (const [nombre, orden] of ordenPartners) fijarOrden.run(orden, nombre, orden);

const partnerAssets: Array<[string, string]> = [
  ['VMware', '/img/partners/vmware.png'],
  ['Veeam', '/img/partners/veeam.png'],
  ['HP', '/img/partners/hp.png'],
  ['Lenovo', '/img/partners/lenovo.png'],
  ['Telefónica', '/img/partners/telefonica.png'],
  ['Claro', '/img/partners/claro.png'],
  ['ISO 27001', '/img/partners/iso-27001.png']
];
const fillPartner = db.prepare(`UPDATE partners SET image_url = COALESCE(NULLIF(image_url, ''), ?) WHERE name = ?`);
for (const [name, image] of partnerAssets) fillPartner.run(image, name);

if (!db.prepare('SELECT 1 FROM partners WHERE name = ?').get('ISO 27001')) {
  db.prepare(`INSERT INTO partners (name, image_url, display_order, show_in_home) VALUES (?, ?, ?, 0)`)
    .run('ISO 27001', '/img/partners/iso-27001.png', 7);
}

const settings = {
  hero_title: 'Infraestructura que no falla. Equipo que no abandona.',
  hero_subtitle: 'Diseñamos, implementamos y sostenemos infraestructuras críticas y virtualización para las organizaciones más exigentes del Ecuador. Respuesta segura, garantizada por ingenieros certificados.',
  company_email: 'irene@tecno-experts.com',
  whatsapp_url: 'https://wa.me/',
  phone: '+593',
  mission: 'Garantizar la continuidad operativa y la competitividad tecnológica de las organizaciones más exigentes del Ecuador mediante ingenieros certificados.',
  why_title: 'Más que tecnología, somos tu aliado estratégico.',
  why_points: 'Ingenieros certificados con experiencia real\nEnfoque proactivo y preventivo\nMetodologías probadas y mejores prácticas\nAcompañamiento cercano y transparente',
  partner_intro: '10 años asegurando la continuidad de empresas AAA en Ecuador y Partners Oficiales de:',
  mission_extended: 'Tecno Experts garantiza la continuidad operativa y la competitividad tecnológica de las organizaciones más exigentes del Ecuador. Lo hacemos con ingenieros certificados que diseñan, implementan y sostienen infraestructuras críticas, convirtiendo la tecnología en una ventaja real y medible para cada cliente.',
  vision_intro: 'Ser la firma de infraestructura tecnológica y ciberseguridad de referencia en Ecuador, el socio estratégico definitivo que transforma la tecnología en resiliencia.',
  vision: 'Para 2028, ser la firma de infraestructura tecnológica y ciberseguridad de referencia en Ecuador, reconocida por las organizaciones líderes del país como el socio estratégico que transforma la tecnología en resiliencia empresarial.'
};
const setSetting = db.prepare(`INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING`);
for (const [key, value] of Object.entries(settings)) setSetting.run(key, value);

// Textos corregidos contra la documentación del cliente. Solo se aplican si el valor
// sigue siendo el anterior, para no pisar lo que se haya editado desde el panel.
const textFixes: Array<[string, string, string]> = [
  ['hero_subtitle',
   'Diseñamos, implementamos y sostenemos infraestructuras críticas y virtualización para las organizaciones más exigentes del Ecuador.',
   settings.hero_subtitle]
];
const fixSetting = db.prepare(`UPDATE site_settings SET value = ? WHERE key = ? AND value = ?`);
for (const [key, previous, next] of textFixes) fixSetting.run(next, key, previous);

export function getSetting(key: string, fallback = ''): string {
  return db.prepare('SELECT value FROM site_settings WHERE key = ?').get(key)?.value ?? fallback;
}

export function getServices(activeOnly = true) {
  return db.prepare(`SELECT * FROM services ${activeOnly ? 'WHERE is_active = 1' : ''} ORDER BY display_order, id`).all();
}

export function getCases(activeOnly = true) {
  return db.prepare(`SELECT * FROM success_cases ${activeOnly ? 'WHERE is_active = 1' : ''} ORDER BY display_order, id`).all();
}

export function getTeam(activeOnly = true) {
  return db.prepare(`SELECT * FROM team_members ${activeOnly ? 'WHERE is_active = 1' : ''} ORDER BY display_order, id`).all();
}

export function getStats(activeOnly = true) {
  return db.prepare(`SELECT * FROM stats ${activeOnly ? 'WHERE is_active = 1' : ''} ORDER BY display_order, id`).all();
}

export function getNavResources(activeOnly = true) {
  return db.prepare(`SELECT * FROM nav_resources ${activeOnly ? 'WHERE is_active = 1' : ''} ORDER BY display_order, id`).all();
}

export function getPartners(activeOnly = true, homeOnly = false) {
  const filters = [activeOnly ? 'is_active = 1' : '', homeOnly ? 'show_in_home = 1' : ''].filter(Boolean);
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  return db.prepare(`SELECT * FROM partners ${where} ORDER BY display_order, id`).all();
}
