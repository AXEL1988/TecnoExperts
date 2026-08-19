import type { AstroCookies } from 'astro';
import { getUserFromToken } from './auth';
import type { EntityDef } from './entities';

export function requireUser(cookies: AstroCookies) {
  return getUserFromToken(cookies.get('te_session')?.value);
}

export const unauthorized = () => new Response('Unauthorized', { status: 401 });
export const badRequest = (message: string) => Response.json({ message }, { status: 400 });

export function parseId(params: Record<string, string | undefined>) {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Normaliza el cuerpo del request a los valores de columna de la entidad. */
export function readValues(entity: EntityDef, body: Record<string, unknown>) {
  const values: Array<string | number | null> = [];
  for (const field of entity.fields) {
    const raw = body[field.name];
    if (field.type === 'number' || field.name === 'is_active') {
      values.push(Number(raw ?? field.default ?? 0) || 0);
      continue;
    }
    const text = String(raw ?? field.default ?? '').trim();
    if (!text && field.required) return { error: 'Los campos obligatorios no están completos.' as const };
    // Las columnas de tipo URL son las únicas que admiten NULL en el esquema.
    values.push(!text && field.type === 'url' ? null : text);
  }
  return { values };
}

export function constraintMessage(entity: EntityDef, error: any, action: 'guardar' | 'actualizar') {
  if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') return 'El slug ya existe.';
  return `No fue posible ${action} el ${entity.singular}.`;
}
