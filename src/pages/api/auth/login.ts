import type { APIRoute } from 'astro';
import { createSession, verifyPassword } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const contentType = request.headers.get('content-type') ?? '';
  let username = '', password = '';
  if (contentType.includes('application/json')) {
    ({ username = '', password = '' } = await request.json());
  } else {
    const form = await request.formData();
    username = String(form.get('username') ?? '');
    password = String(form.get('password') ?? '');
  }
  const user = verifyPassword(username.trim(), password);
  if (!user) return redirect('/admin/login?error=1', 303);
  const session = createSession(user.id);
  const sessionDays = Number(process.env.SESSION_DAYS ?? 7);
  cookies.set('te_session', session.token, { httpOnly: true, sameSite: 'lax', secure: import.meta.env.PROD, path: '/', maxAge: 60 * 60 * 24 * sessionDays });
  return redirect('/admin', 303);
};
