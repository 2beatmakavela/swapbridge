import { checkDatabaseHealth } from '@/lib/server/supabase.js';

export async function GET() {
  const dbStatus = await checkDatabaseHealth();
  const status = dbStatus.status === 'ok' ? 'ok' : 'unavailable';
  return new Response(JSON.stringify({ status, dbStatus }), {
    status: status === 'ok' ? 200 : 503,
    headers: { 'content-type': 'application/json' },
  });
}
