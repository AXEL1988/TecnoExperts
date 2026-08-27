export interface SettingDef {
  key: string;
  label: string;
  group: string;
  type?: 'text' | 'textarea';
  required?: boolean;
  hint?: string;
}

export const siteSettings: SettingDef[] = [
  { key: 'hero_title', label: 'Título principal', group: 'Home', type: 'textarea', required: true },
  { key: 'hero_subtitle', label: 'Subtítulo', group: 'Home', type: 'textarea', required: true },
  { key: 'services_intro', label: 'Texto bajo «Es la base de tu negocio»', group: 'Home', type: 'textarea' },
  { key: 'partner_intro', label: 'Barra de confianza: texto de la izquierda', group: 'Home', type: 'textarea' },
  { key: 'partner_lead', label: 'Barra de confianza: entradilla de los partners', group: 'Home', type: 'textarea' },
  { key: 'mission', label: 'Misión', group: 'Nosotros', type: 'textarea', required: true },
  { key: 'mission_extended', label: 'Misión (párrafo ampliado)', group: 'Nosotros', type: 'textarea' },
  { key: 'vision_intro', label: 'Visión (párrafo breve)', group: 'Nosotros', type: 'textarea' },
  { key: 'vision', label: 'Visión (párrafo ampliado)', group: 'Nosotros', type: 'textarea', required: true },
  { key: 'company_email', label: 'Correo de contacto', group: 'Contacto', required: true },
  { key: 'phone', label: 'Teléfono', group: 'Contacto' },
  { key: 'whatsapp_url', label: 'Enlace de WhatsApp', group: 'Contacto', hint: 'Ej: https://wa.me/5939XXXXXXXX' },
  { key: 'contact_pitch', label: 'Frase de apertura de Contacto', group: 'Contacto', type: 'textarea' }
];

export const settingGroups = [...new Set(siteSettings.map((setting) => setting.group))];
