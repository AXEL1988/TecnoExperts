import type { APIRoute } from 'astro';
import { revokeSession } from '../../../lib/auth';
export const POST: APIRoute = async ({ cookies, redirect }) => {
  revokeSession(cookies.get('te_session')?.value);
  cookies.delete('te_session', { path: '/' });
  return redirect('/admin/login', 303);
};
