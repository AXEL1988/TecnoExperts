import type { APIRoute } from 'astro';
import { db } from '../../../../lib/db';
import { getEntity } from '../../../../lib/entities';
import { badRequest, constraintMessage, parseId, readValues, requireUser, unauthorized } from '../../../../lib/adminApi';

function resolve(cookies: any, params: Record<string, string | undefined>) {
  if (!requireUser(cookies)) return { response: unauthorized() };
  const entity = getEntity(params.entity);
  if (!entity) return { response: new Response('Not Found', { status: 404 }) };
  const id = parseId(params);
  if (!id) return { response: new Response('Bad Request', { status: 400 }) };
  return { entity, id };
}

export const GET: APIRoute = ({ cookies, params }) => {
  const { response, entity, id } = resolve(cookies, params);
  if (response) return response;
  const row = db.prepare(`SELECT * FROM ${entity!.table} WHERE id = ?`).get(id);
  return row ? Response.json(row) : new Response('Not Found', { status: 404 });
};

export const PUT: APIRoute = async ({ cookies, params, request }) => {
  const { response, entity, id } = resolve(cookies, params);
  if (response) return response;

  const { values, error } = readValues(entity!, await request.json());
  if (error) return badRequest(error);

  const assignments = entity!.fields.map((field) => `${field.name} = ?`).join(', ');
  const touch = entity!.hasUpdatedAt ? ', updated_at = CURRENT_TIMESTAMP' : '';
  try {
    const result = db.prepare(`UPDATE ${entity!.table} SET ${assignments}${touch} WHERE id = ?`).run(...values!, id!);
    if (result.changes === 0) return new Response('Not Found', { status: 404 });
    return new Response(null, { status: 204 });
  } catch (err: any) {
    return badRequest(constraintMessage(entity!, err, 'actualizar'));
  }
};

export const DELETE: APIRoute = ({ cookies, params }) => {
  const { response, entity, id } = resolve(cookies, params);
  if (response) return response;
  const result = db.prepare(`DELETE FROM ${entity!.table} WHERE id = ?`).run(id);
  if (result.changes === 0) return new Response('Not Found', { status: 404 });
  return new Response(null, { status: 204 });
};
