import type { APIRoute } from 'astro';
import { db } from '../../../../lib/db';
import { getEntity } from '../../../../lib/entities';
import { badRequest, constraintMessage, readValues, requireUser, unauthorized } from '../../../../lib/adminApi';

export const GET: APIRoute = ({ cookies, params }) => {
  if (!requireUser(cookies)) return unauthorized();
  const entity = getEntity(params.entity);
  if (!entity) return new Response('Not Found', { status: 404 });
  return Response.json(db.prepare(`SELECT * FROM ${entity.table} ORDER BY display_order, id`).all());
};

export const POST: APIRoute = async ({ cookies, params, request }) => {
  if (!requireUser(cookies)) return unauthorized();
  const entity = getEntity(params.entity);
  if (!entity) return new Response('Not Found', { status: 404 });

  const { values, error } = readValues(entity, await request.json());
  if (error) return badRequest(error);

  const columns = entity.fields.map((field) => field.name);
  const placeholders = columns.map(() => '?').join(', ');
  try {
    const result = db
      .prepare(`INSERT INTO ${entity.table} (${columns.join(', ')}) VALUES (${placeholders})`)
      .run(...values!);
    return Response.json({ id: result.lastInsertRowid }, { status: 201 });
  } catch (err: any) {
    return badRequest(constraintMessage(entity, err, 'guardar'));
  }
};
