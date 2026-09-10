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
  ['Sector Financiero: Vanguardia y Respaldo Experto', 'Sector Financiero',
   'Mantenerse a la vanguardia tecnológica mientras la organización se enfoca exclusivamente en su core de negocio y expansión.',
   'Renovación estratégica de licenciamiento VMware y gestión integral de virtualización.',
   'Operación estable, eficiente y respaldada por expertos.', 1],
  ['Telecomunicaciones: Transformación en Virtualización', 'Telecomunicaciones',
   'Modernizar su centro de datos para aumentar la agilidad y ofrecer servicios de vanguardia.',
   'Implementación de un entorno simplificado, seguro y optimizado bajo los estándares de VMware.',
   'Liderazgo tecnológico y alta disponibilidad operativa.', 2],
  ['Manufactura: Resiliencia ante la Crisis', 'Manufactura',
   'Incidente crítico de ciberseguridad que paralizó la infraestructura total.',
   'Rediseño absoluto desde cero de la arquitectura de virtualización. Despliegue de un directorio activo seguro y establecimiento de un sitio alterno para contingencia.',
   'Recuperación técnica estandarizada y eficiente sobre una infraestructura resiliente.', 3]
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
  ['Francisco Silva', 'Especialista VMware', 'Arquitectura de virtualización. Especialista en consolidación de Data Centers y alta disponibilidad.', null, 1],
  ['Fabián Quimbiulco', 'Especialista Veeam, Microsoft e Infraestructura', 'Especialista en continuidad de negocio. Garantiza que los datos estén intactos y operativos.', null, 2],
  ['Daniel Arroyo', 'Marketing', 'Comunicación y gestión de marca. Acerca las soluciones de Tecno Experts a las empresas que las necesitan.', null, 3],
  ['Irene Sarabia', 'Key Account Manager (KAM)', 'Gestión de clientes y preventa comercial. Tu aliada directa para presupuestos rápidos y transparentes.', null, 4]
];
if (db.prepare('SELECT COUNT(*) as count FROM team_members').get().count === 0) {
  const insert = db.prepare(`INSERT INTO team_members (name, role, description, image_url, display_order) VALUES (?, ?, ?, ?, ?)`);
  const tx = db.transaction((rows: typeof seedTeam) => rows.forEach((row) => insert.run(...row)));
  tx(seedTeam);
}

const seedPartners = [
  ['VMware', 1], ['Proxmox', 2], ['Veeam', 3], ['Microsoft', 4], ['Dell', 5]
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
// Revisión del cliente: los partners se agrupan por especialidad en la barra de confianza.
addColumn('partners', 'category', 'TEXT');
// Casos de éxito: cliente y bloque de cierre (valor agregado, testimonio o lección).
addColumn('success_cases', 'client_label', 'TEXT');
addColumn('success_cases', 'highlight', 'TEXT');
addColumn('success_cases', 'highlight_label', 'TEXT');

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
   'Consolida tu infraestructura física, reduce costos operativos y eleva la disponibilidad de tus sistemas críticos a un 99.90%.'],
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

// Revisión del cliente: la disponibilidad comprometida es 99.90%, no 99.99%.
corregirBeneficio.run(
  'Consolida tu infraestructura física, reduce costos operativos y eleva la disponibilidad de tus sistemas críticos a un 99.90%.',
  'virtualizacion-vmware',
  'Consolida tu infraestructura física, reduce costos operativos y eleva la disponibilidad de tus sistemas críticos a un 99.99%.'
);

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

// Revisión del cliente: sale Christian Baeza. Daniel Arroyo se retira del sitio;
// la sección de equipo queda con Francisco, Fabián e Irene.
db.prepare(`UPDATE team_members SET is_active = 0 WHERE name IN (?, ?) AND is_active = 1`)
  .run('Christian Baeza', 'Daniel Arroyo');
db.prepare(`UPDATE team_members SET display_order = 4 WHERE name = ? AND display_order = 3`).run('Irene Sarabia');

// «Maestro» pasa a «Especialista» y se declara la certificación de cada quien.
const teamFixes: Array<[string, string, string]> = [
  ['Francisco Silva', 'role', 'Especialista VMware'],
  ['Francisco Silva', 'description', 'Arquitectura de virtualización. Especialista en consolidación de Data Centers y alta disponibilidad.'],
  ['Fabián Quimbiulco', 'role', 'Especialista Veeam, Microsoft e Infraestructura']
];
const corregirRol = db.prepare(`UPDATE team_members SET role = ? WHERE name = ? AND role = ?`);
const corregirDescripcion = db.prepare(`UPDATE team_members SET description = ? WHERE name = ? AND description = ?`);
const teamPrevios: Record<string, string> = {
  'Francisco Silva|role': 'VMware Certified Professional',
  'Francisco Silva|description': 'Arquitectura de virtualización. Maestro en consolidación de Data Centers y alta disponibilidad.',
  'Fabián Quimbiulco|role': 'Veeam VMCE'
};
for (const [name, campo, nuevo] of teamFixes) {
  const anterior = teamPrevios[`${name}|${campo}`];
  if (campo === 'role') corregirRol.run(nuevo, name, anterior);
  else corregirDescripcion.run(nuevo, name, anterior);
}

const caseIcons: Array<[string, string]> = [
  ['Sector Financiero', 'bank'],
  ['Telecomunicaciones', 'antenna'],
  ['Manufactura', 'factory']
];
const fillCaseIcon = db.prepare(`UPDATE success_cases SET icon_name = COALESCE(NULLIF(icon_name, ''), ?) WHERE sector = ?`);
for (const [sector, icon] of caseIcons) fillCaseIcon.run(icon, sector);

const seedStats: Array<[string, string, string, number]> = [
  ['10+', 'Años protegiendo empresas en Ecuador', 'shield-check', 1],
  ['200+', 'Proyectos de seguridad implementados', 'users', 2],
  ['30+', 'Certificaciones y alianzas tecnológicas', 'medal', 3],
  ['90+', 'Empresas confían en nuestras soluciones', 'building', 4],
  ['99.90%', 'Disponibilidad promedio en nuestros proyectos', 'clock', 5]
];
if (db.prepare('SELECT COUNT(*) as count FROM stats').get().count === 0) {
  const insert = db.prepare(`INSERT INTO stats (value, label, icon_name, display_order) VALUES (?, ?, ?, ?)`);
  const tx = db.transaction((rows: typeof seedStats) => rows.forEach((row) => insert.run(...row)));
  tx(seedStats);
}

// La barra de cifras vuelve a las cinco de la maqueta; solo se corrigen los dos
// valores que el cliente observó: 50+ pasa a 90+ y 99.99% a 99.90%.
const reactivarStat = db.prepare(`UPDATE stats SET is_active = 1 WHERE label = ? AND is_active = 0`);
const alinearStat = db.prepare(`UPDATE stats SET value = ?, icon_name = ?, display_order = ? WHERE label = ?`);
const crearStat = db.prepare(`
  INSERT INTO stats (value, label, icon_name, display_order)
  SELECT ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM stats WHERE label = ?)
`);
// Etiquetas que quedaron reescritas en la iteración anterior: se recuperan antes
// de alinear la barra para no duplicar filas.
const renombrarStat = db.prepare(`UPDATE stats SET label = ? WHERE label = ?`);
renombrarStat.run('Proyectos de seguridad implementados', 'Proyectos de infraestructura implementados');
renombrarStat.run('Disponibilidad promedio en nuestros proyectos', 'Disponibilidad operativa garantizada');
for (const [value, label, icon, order] of seedStats) {
  crearStat.run(value, label, icon, order, label);
  alinearStat.run(value, icon, order, label);
  reactivarStat.run(label);
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

// Revisión del cliente: los tres casos se reescriben con el relato entregado.
// Se aplica por sector y solo si el texto sigue siendo el anterior.
const caseRewrites: Array<{
  sector: string; title: [string, string]; problem: [string, string];
  solution: [string, string]; result: [string, string];
}> = [
  {
    sector: 'Sector Financiero',
    title: ['Sector Financiero', 'Sector Financiero: Vanguardia y Respaldo Experto'],
    problem: ['Fallo crítico en arreglo RAID 5 degradado. Core financiero colapsado.',
              'Mantenerse a la vanguardia tecnológica mientras la organización se enfoca exclusivamente en su core de negocio y expansión.'],
    solution: ['Activación inmediata de DRP. Recuperación desde backup inmutable Veeam.',
               'Renovación estratégica de licenciamiento VMware y gestión integral de virtualización.'],
    result: ['Restauración total en 6h 45min. Cero pérdida de transacciones.',
             'Operación estable, eficiente y respaldada por expertos.']
  },
  {
    sector: 'Telecomunicaciones',
    title: ['Telecomunicaciones', 'Telecomunicaciones: Transformación en Virtualización'],
    problem: ['RTO inaceptable de 48 horas y altos costos de energía.',
              'Modernizar su centro de datos para aumentar la agilidad y ofrecer servicios de vanguardia.'],
    solution: ['Consolidación mediante VMware vSphere y contingencia.',
               'Implementación de un entorno simplificado, seguro y optimizado bajo los estándares de VMware.'],
    result: ['340 VMs migradas sin afectar servicio. RTO de 4h. Gasto físico reducido un 23%.',
             'Liderazgo tecnológico y alta disponibilidad operativa.']
  },
  {
    sector: 'Manufactura',
    title: ['Manufactura', 'Manufactura: Resiliencia ante la Crisis'],
    problem: ['Dependencia de servidores físicos legacy a punto de fallar.',
              'Incidente crítico de ciberseguridad que paralizó la infraestructura total.'],
    solution: ['Migración a entorno virtual VMware en infraestructura Lenovo.',
               'Rediseño absoluto desde cero de la arquitectura de virtualización. Despliegue de un directorio activo seguro y establecimiento de un sitio alterno para contingencia.'],
    result: ['Alta disponibilidad activa. La operación no sufrió downtime ante una falla posterior.',
             'Recuperación técnica estandarizada y eficiente sobre una infraestructura resiliente.']
  }
];
const reescribirCaso = (campo: 'title' | 'problem' | 'solution' | 'result') =>
  db.prepare(`UPDATE success_cases SET ${campo} = ? WHERE sector = ? AND ${campo} = ?`);
const reescrituras = {
  title: reescribirCaso('title'),
  problem: reescribirCaso('problem'),
  solution: reescribirCaso('solution'),
  result: reescribirCaso('result')
};
for (const caso of caseRewrites) {
  for (const campo of ['title', 'problem', 'solution', 'result'] as const) {
    const [anterior, nuevo] = caso[campo];
    reescrituras[campo].run(nuevo, caso.sector, anterior);
  }
}

// Cliente y bloque de cierre de cada caso (valor agregado, testimonio o lección).
const caseExtras: Array<[string, string, string, string]> = [
  ['Sector Financiero', 'Importante Cooperativa del sector financiero.', 'El valor agregado',
   'Actuamos como su brazo tecnológico. Especialistas asignados: Francisco (VMware) y Fabián (Especialista en Infraestructura).'],
  ['Telecomunicaciones', 'Empresa líder en telecomunicaciones.', 'Testimonio',
   '«Gracias al equipo de especialistas de virtualización de Tecno Experts, transformamos nuestro centro de datos. Ahora podemos ofrecer a nuestros clientes una plataforma de nube bajo demanda, con capacidades multi-tenant y redes definidas por software.»'],
  ['Manufactura', 'Empresa referente en el sector manufactura.', 'La lección',
   'La continuidad no es un producto, es un diseño. Una infraestructura resiliente permite una recuperación técnica estandarizada y eficiente.']
];
const fillCaseExtras = db.prepare(`
  UPDATE success_cases
     SET client_label = COALESCE(NULLIF(client_label, ''), ?),
         highlight_label = COALESCE(NULLIF(highlight_label, ''), ?),
         highlight = COALESCE(NULLIF(highlight, ''), ?)
   WHERE sector = ?
`);
for (const [sector, cliente, etiqueta, texto] of caseExtras) fillCaseExtras.run(cliente, etiqueta, texto, sector);

const ordenPartners: Array<[string, number]> = [
  ['VMware', 1], ['Proxmox', 2], ['Veeam', 3], ['Microsoft', 4], ['Dell', 5]
];
const fijarOrden = db.prepare(`UPDATE partners SET display_order = ? WHERE name = ? AND display_order <> ?`);
for (const [nombre, orden] of ordenPartners) fijarOrden.run(orden, nombre, orden);

const partnerAssets: Array<[string, string]> = [
  ['VMware', '/img/partners/vmware.png'],
  ['Proxmox', '/img/partners/proxmox.png'],
  ['Veeam', '/img/partners/veeam.png'],
  ['Microsoft', '/img/partners/microsoft.png'],
  ['Dell', '/img/partners/dell.png']
];
const fillPartner = db.prepare(`UPDATE partners SET image_url = COALESCE(NULLIF(image_url, ''), ?) WHERE name = ?`);
for (const [name, image] of partnerAssets) fillPartner.run(image, name);

// Revisión del cliente: solo quedan los mayoristas, agrupados por especialidad.
const partnerCategories: Array<[string, string]> = [
  ['VMware', 'Especialistas en Virtualización'],
  ['Proxmox', 'Especialistas en Virtualización'],
  ['Veeam', 'Especialistas en Respaldo y Continuidad'],
  ['Microsoft', 'Infraestructura, Nube y Soporte'],
  ['Dell', 'Infraestructura, Nube y Soporte']
];
const nuevoPartner = db.prepare(`
  INSERT INTO partners (name, display_order, category)
  SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = ?)
`);
const fijarCategoria = db.prepare(`UPDATE partners SET category = COALESCE(NULLIF(category, ''), ?) WHERE name = ?`);
partnerCategories.forEach(([name, category], index) => {
  nuevoPartner.run(name, index + 1, category, name);
  fijarCategoria.run(category, name);
});

// Marcas retiradas del sitio: se desactivan en vez de borrarse, para no perder ediciones.
const partnersRetirados = ['HP', 'Telefónica', 'Claro', 'ISO 27001'];
const desactivarPartner = db.prepare(`UPDATE partners SET is_active = 0 WHERE name = ? AND is_active = 1`);
for (const name of partnersRetirados) desactivarPartner.run(name);

// Revisión del cliente (sep. 2026): Lenovo entra a la barra de confianza junto a Microsoft y Dell.
nuevoPartner.run('Lenovo', 6, 'Infraestructura, Nube y Soporte', 'Lenovo');
db.prepare(`
  UPDATE partners SET is_active = 1, category = 'Infraestructura, Nube y Soporte',
         image_url = COALESCE(NULLIF(image_url, ''), '/img/partners/lenovo.png')
  WHERE name = 'Lenovo' AND (is_active = 0 OR category IS NULL OR category <> 'Infraestructura, Nube y Soporte' OR image_url IS NULL)
`).run();

// Revisión del cliente (sep. 2026): la especialidad de hardware suma a Dell.
const conDell: Array<[string, string, string]> = [
  ['title', 'Hardware HP y Lenovo', 'Hardware HP, Lenovo y Dell'],
  ['home_description', 'Equipamiento HP y Lenovo integrado y con soporte experto directo.',
   'Equipamiento HP, Lenovo y Dell integrado y con soporte experto directo.'],
  ['icon_url', '/img/servicios/icon-hardware-hp-lenovo.webp', '/img/servicios/icon-hardware-hp-lenovo-dell.webp']
];
for (const [columna, anterior, nuevo] of conDell) {
  db.prepare(`UPDATE services SET ${columna} = ? WHERE slug = 'hardware-hp-lenovo' AND ${columna} = ?`).run(nuevo, anterior);
}

const settings = {
  hero_title: 'Infraestructura que no falla. Equipo que no abandona.',
  hero_subtitle: 'Diseñamos, implementamos y sostenemos infraestructuras críticas y virtualización para las organizaciones más exigentes del Ecuador. Respuesta segura, garantizada por ingenieros certificados.',
  company_email: 'isarabia@tecno-experts.com',
  whatsapp_url: 'https://wa.me/593994977417',
  phone: '0994977417',
  mission: 'Garantizar la continuidad operativa y la competitividad tecnológica de las organizaciones más exigentes del Ecuador mediante ingenieros certificados.',
  why_title: 'Más que tecnología, somos tu aliado estratégico.',
  why_points: 'Ingenieros certificados con experiencia real\nEnfoque proactivo y preventivo\nMetodologías probadas y mejores prácticas\nAcompañamiento cercano y transparente',
  partner_intro: 'Durante estos 10 años hemos prestado soluciones de arquitectura tecnológica a empresas privadas y públicas a través de la implementación, renovación o migración de soluciones sobre infraestructura, nube, virtualización y continuidad del negocio; con una atención presencial y remota. Contamos con más de 200 proyectos de infraestructura implementados y una garantía de 99.90% de disponibilidad operativa.',
  partner_lead: 'Para garantizar la excelencia tecnológica, trabajamos con líderes de la industria clasificados por especialidad:',
  services_intro: 'La continuidad operativa es la base de tu negocio. Brindamos infraestructura tecnológica segura para empresas que no pueden detener su operación. Implementamos virtualización, ciberseguridad, respaldo, nube híbrida y soporte especializado para empresas en Ecuador.',
  contact_pitch: '¿Tu arquitectura garantiza la recuperación total? Solicita un diagnóstico técnico de continuidad. Sin compromiso.',
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
   settings.hero_subtitle],
  // Revisión del cliente: barra de confianza y datos de contacto reales.
  ['partner_intro',
   '10 años asegurando la continuidad de empresas AAA en Ecuador y Partners Oficiales de:',
   settings.partner_intro],
  ['company_email', 'irene@tecno-experts.com', settings.company_email],
  ['whatsapp_url', 'https://wa.me/', settings.whatsapp_url],
  ['phone', '+593', settings.phone]
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
