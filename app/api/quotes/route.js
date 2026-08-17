import { captureServerException, initServerSentry } from '@/lib/server/sentry.js';
import { getAllQuotes } from '@/lib/engines.js';
import { normalizeWalletAddress, sanitizeRequestBody, validateQuotePayload } from '@/lib/server/validation.js';
import { rateLimit } from '@/lib/server/redis.js';

initServerSentry();

function createErrorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(request) {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  try {
    const limitResult = await rateLimit(`rate:quotes:${ip}`, 30, 60);
    if (!limitResult.allowed) {
      return createErrorResponse('Rate limit exceeded.', 429);
    }

    const body = await request.json().catch(() => null);
    const validation = validateQuotePayload(body);
    if (!validation.valid) {
      return createErrorResponse(validation.message, 422);
    }

    const walletAddress = normalizeWalletAddress(body.walletAddress) || '0x0000000000000000000000000000000000000000';
    const result = await getAllQuotes({
      fromToken: body.fromToken,
      toToken: body.toToken,
      sendAmount: body.sendAmount,
      walletAddress,
      routePriority: body.routePriority,
      settings: body.settings || {},
    });

    return new Response(JSON.stringify({ requestId, routes: result }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    captureServerException(error, { requestId, path: '/api/quotes' });
    return createErrorResponse('Unable to fetch quotes at this time.', 502);
  }
}
