import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import { siteSettings } from '../../../lib/settings';
import { badRequest, requireUser, unauthorized } from '../../../lib/adminApi';

export const PUT: APIRoute = async ({ cookies, request }) => {
  if (!requireUser(cookies)) return unauthorized();
  const body = await request.json();

  const updates: Array<[string, string]> = [];
  for (const setting of siteSettings) {
    const value = String(body[setting.key] ?? '').trim();
    if (!value && setting.required) return badRequest(`El campo "${setting.label}" es obligatorio.`);
    updates.push([setting.key, value]);
  }

  const upsert = db.prepare(`
    INSERT INTO site_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `);
  db.transaction((rows: typeof updates) => rows.forEach(([key, value]) => upsert.run(key, value)))(updates);

  return new Response(null, { status: 204 });
};
