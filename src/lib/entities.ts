export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'url';

export interface FieldDef {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  full?: boolean;
  options?: Array<{ value: string; label: string }>;
  default?: string;
  /** Se guarda como entero aunque el control sea un select. */
  numeric?: boolean;
}

export interface EntityDef {
  key: string;
  table: string;
  label: string;
  singular: string;
  description: string;
  hasUpdatedAt: boolean;
  fields: FieldDef[];
}

const orderField: FieldDef = { name: 'display_order', label: 'Orden', type: 'number', default: '1' };
const activeField: FieldDef = {
  name: 'is_active',
  label: 'Estado',
  type: 'select',
  numeric: true,
  default: '1',
  options: [
    { value: '1', label: 'Activo' },
    { value: '0', label: 'Inactivo' }
  ]
};

export const entities: Record<string, EntityDef> = {
  services: {
    key: 'services',
    table: 'services',
    label: 'Servicios',
    singular: 'servicio',
    description: 'Administra las soluciones que aparecen en la web.',
    hasUpdatedAt: true,
    fields: [
      { name: 'title', label: 'Título', required: true },
      { name: 'slug', label: 'Slug', required: true },
      { name: 'short_description', label: 'Descripción corta', type: 'textarea', required: true, full: true },
      { name: 'benefit', label: 'Beneficio', type: 'textarea', required: true, full: true },
      { name: 'short_title', label: 'Título corto (portada)' },
      { name: 'home_description', label: 'Descripción de portada', type: 'textarea', full: true },
      { name: 'image_url', label: 'Imagen (ruta o URL)', type: 'url' },
      { name: 'icon_url', label: 'Logo de marca (ruta o URL)', type: 'url' },
      { name: 'icon_name', label: 'Icono de línea', default: 'cube' },
      { name: 'cta_text', label: 'Texto CTA', default: 'Solicitar cotización' },
      { name: 'cta_url', label: 'URL CTA', default: '/contacto' },
      orderField,
      activeField
    ]
  },
  cases: {
    key: 'cases',
    table: 'success_cases',
    label: 'Casos de éxito',
    singular: 'caso',
    description: 'Casos reales que se publican en la página de resultados.',
    hasUpdatedAt: true,
    fields: [
      { name: 'title', label: 'Título', required: true },
      { name: 'sector', label: 'Sector', required: true },
      { name: 'problem', label: 'Problema', type: 'textarea', required: true, full: true },
      { name: 'solution', label: 'Solución', type: 'textarea', required: true, full: true },
      { name: 'result', label: 'Resultado', type: 'textarea', required: true, full: true },
      { name: 'image_url', label: 'Imagen (ruta o URL)', type: 'url' },
      { name: 'icon_name', label: 'Icono de sector', default: 'building' },
      orderField,
      activeField
    ]
  },
  team: {
    key: 'team',
    table: 'team_members',
    label: 'Equipo',
    singular: 'integrante',
    description: 'Especialistas que se muestran en la página Nosotros.',
    hasUpdatedAt: true,
    fields: [
      { name: 'name', label: 'Nombre', required: true },
      { name: 'role', label: 'Cargo o certificación', required: true },
      { name: 'description', label: 'Descripción', type: 'textarea', required: true, full: true },
      { name: 'image_url', label: 'URL de la foto', type: 'url' },
      { name: 'certification_logo', label: 'Certificación (ruta de logo o icono)' },
      orderField,
      activeField
    ]
  },
  stats: {
    key: 'stats',
    table: 'stats',
    label: 'Estadísticas',
    singular: 'estadística',
    description: 'Cifras que se muestran en la portada.',
    hasUpdatedAt: true,
    fields: [
      { name: 'value', label: 'Valor', required: true },
      { name: 'label', label: 'Descripción', type: 'textarea', required: true, full: true },
      { name: 'icon_name', label: 'Icono', default: 'shield' },
      orderField,
      activeField
    ]
  },
  resources: {
    key: 'resources',
    table: 'nav_resources',
    label: 'Menú Recursos',
    singular: 'enlace',
    description: 'Enlaces del desplegable «Recursos» en la navegación.',
    hasUpdatedAt: true,
    fields: [
      { name: 'label', label: 'Título', required: true },
      { name: 'url', label: 'Destino', required: true, default: '/' },
      { name: 'description', label: 'Descripción', type: 'textarea', full: true },
      { name: 'icon_name', label: 'Icono', default: 'doc' },
      orderField,
      activeField
    ]
  },
  partners: {
    key: 'partners',
    table: 'partners',
    label: 'Partners',
    singular: 'partner',
    description: 'Marcas y aliados que se muestran en la portada.',
    hasUpdatedAt: false,
    fields: [
      { name: 'name', label: 'Nombre', required: true },
      { name: 'image_url', label: 'URL del logo', type: 'url' },
      { name: 'url', label: 'Sitio web', type: 'url' },
      { name: 'show_in_home', label: 'Barra de portada', type: 'select', numeric: true, default: '1',
        options: [{ value: '1', label: 'Sí' }, { value: '0', label: 'No' }] },
      orderField,
      activeField
    ]
  }
};

export function getEntity(key?: string): EntityDef | null {
  return (key && entities[key]) || null;
}
