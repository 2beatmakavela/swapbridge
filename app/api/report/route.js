import { checkRateLimit, rateLimitResponse } from '@/lib/server/rate-limit.js';
import { addCorsHeaders, handleCorsPreFlight } from '@/lib/server/cors.js';
import { sendUnsafeReport } from '@/lib/telegram.js';

/**
 * IMPORTANT: This endpoint now STRICTLY PROHIBITS sensitive data.
 * Do NOT accept: private keys, seed phrases, passwords, cookies, tokens, auth headers, etc.
 */

const SENSITIVE_KEYWORDS = [
  'seed', 'phrase', 'mnemonic', 'privatekey', 'private_key',
  'password', 'passwd', 'pwd', 'secret', 'token', 'auth',
  'cookie', 'session', 'jwt', 'bearer', 'apikey', 'api_key',
  'credentials', 'credential', 'backup', 'recovery', 'raw'
];

function containsSensitiveData(obj) {
  const text = JSON.stringify(obj).toLowerCase();
  return SENSITIVE_KEYWORDS.some(keyword => text.includes(keyword));
}

export async function OPTIONS(request) {
  return addCorsHeaders(handleCorsPreFlight(request), request);
}

export async function POST(request) {
  try {
    // Check rate limit
    const rateLimit = checkRateLimit(request, null, 50, 60000); // 50 req/min
    if (!rateLimit.allowed) {
      return addCorsHeaders(rateLimitResponse(rateLimit.resetTime), request);
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return addCorsHeaders(
        new Response(
          JSON.stringify({ 
            ok: false, 
            error: 'Invalid JSON in request body.' 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        ),
        request
      );
    }

    // Validate report structure
    if (!body || typeof body !== 'object') {
      return addCorsHeaders(
        new Response(
          JSON.stringify({ 
            ok: false, 
            error: 'Invalid request body. Expected JSON object.' 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        ),
        request
      );
    }

    // Check if message is provided
    if (!body.message && !body.type) {
      return addCorsHeaders(
        new Response(
          JSON.stringify({ 
            ok: false, 
            error: 'Missing required field: message or type' 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        ),
        request
      );
    }

    // SECURITY: Reject if suspicious sensitive data is detected
    if (containsSensitiveData(body)) {
      console.warn('[REPORT] ⚠️  REJECTED: Attempt to report sensitive data detected');
      return addCorsHeaders(
        new Response(
          JSON.stringify({ 
            ok: false, 
            error: 'Report contains sensitive data. Do not submit keys, passwords, or seed phrases.' 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        ),
        request
      );
    }

    // Verify environment variables
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    if (!telegramBotToken || !telegramChatId) {
      console.error('[REPORT] Missing Telegram configuration');
      return addCorsHeaders(
        new Response(
          JSON.stringify({ 
            ok: false, 
            error: 'Report service not configured' 
          }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        ),
        request
      );
    }

    // Build SAFE report object - explicitly exclude sensitive fields
    const report = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      type: String(body.type || 'general').substring(0, 50), // Limit length
      message: String(body.message || '').substring(0, 1000), // Limit length
      severity: ['info', 'warning', 'error'].includes(body.severity) ? body.severity : 'info',
      url: typeof body.url === 'string' ? body.url.substring(0, 500) : null,
      userAgent: typeof body.userAgent === 'string' ? body.userAgent.substring(0, 500) : null,
    };

    console.log(`[REPORT] Sending ${report.type} report`);

    // Send report to Telegram and other services
    const result = await sendUnsafeReport(report, {
      telegramBotToken,
      telegramChatId,
      discordWebhook: process.env.DISCORD_WEBHOOK,
      emailTo: process.env.EMAIL_TO,
      emailFrom: process.env.EMAIL_FROM,
      resendApiKey: process.env.RESEND_API_KEY
    });

    if (result.ok) {
      console.log(`[REPORT] Report delivered successfully`);
      return addCorsHeaders(
        new Response(
          JSON.stringify({ 
            ok: true, 
            message: 'Report received and processed' 
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        ),
        request
      );
    } else {
      console.error('[REPORT] Failed to deliver report:', result);
      return addCorsHeaders(
        new Response(
          JSON.stringify({ 
            ok: false, 
            error: 'Failed to process report' 
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        ),
        request
      );
    }

  } catch (error) {
    console.error('[REPORT] API Error:', error.message);
    return addCorsHeaders(
      new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Internal server error' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      ),
      request
    );
  }
}

// Health check endpoint
export async function GET(request) {
  return addCorsHeaders(
    new Response(
      JSON.stringify({ 
        ok: true,
        message: 'Report API is running',
        version: '1.1'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ),
    request
  );
}
