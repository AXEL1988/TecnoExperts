import type { APIRoute } from 'astro';
import { db } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const fields = ['full_name','company','email','interest_area','message'];
  if (fields.some((field) => !String(body[field] ?? '').trim())) return Response.json({ message: 'Completa todos los campos obligatorios.' }, { status: 400 });
  const email = String(body.email).trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) return Response.json({ message: 'El correo no es válido.' }, { status: 400 });
  db.prepare(`INSERT INTO contact_requests (full_name, company, email, interest_area, message) VALUES (?, ?, ?, ?, ?)`).run(String(body.full_name).trim(), String(body.company).trim(), email, String(body.interest_area).trim(), String(body.message).trim());
  return Response.json({ ok: true });
};
