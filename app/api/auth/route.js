import { createClient } from '@supabase/supabase-js';
import { initServerSentry, captureServerException } from '@/lib/server/sentry.js';
import { sanitizeRequestBody } from '@/lib/server/validation.js';

initServerSentry();

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase configuration is missing.');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request) {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.email !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid auth payload.' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.admin.createUser({ email: body.email, password: body.password || Math.random().toString(36).slice(2) });
    if (error) throw error;

    return new Response(JSON.stringify({ requestId, user: { id: data.user.id, email: data.user.email } }), {
      status: 201,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    captureServerException(error, { requestId, path: '/api/auth' });
    return new Response(JSON.stringify({ error: 'Authentication failed.' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
