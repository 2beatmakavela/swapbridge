/**
 * API Authentication Middleware
 * Provides utilities to secure API endpoints with optional API key validation.
 */

const API_KEY_HEADER = 'x-api-key';
const VALID_API_KEYS = (process.env.VALID_API_KEYS || '').split(',').filter(Boolean);

/**
 * Validate request has a valid API key (if configured)
 * Returns response if authentication fails, null if successful
 */
export function validateApiKey(request) {
  // Skip if no API keys are configured (development mode)
  if (VALID_API_KEYS.length === 0) {
    return null;
  }

  const apiKey = request.headers.get(API_KEY_HEADER);
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({ 
        error: 'Missing API key. Provide x-api-key header.' 
      }),
      { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  if (!VALID_API_KEYS.includes(apiKey)) {
    return new Response(
      JSON.stringify({ 
        error: 'Invalid API key.' 
      }),
      { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  return null; // Success
}

/**
 * Check if request is from localhost (for development)
 */
export function isLocalhost(request) {
  const origin = request.headers.get('origin') || request.headers.get('referer') || '';
  return origin.includes('localhost') || origin.includes('127.0.0.1');
}

/**
 * Validate request origin (CORS pre-flight)
 * Returns null if origin is allowed
 */
export function validateOrigin(request, allowedOrigins = []) {
  if (process.env.NODE_ENV !== 'production') {
    return null; // Skip validation in development
  }

  const origin = request.headers.get('origin');
  
  if (!origin) {
    return null; // No origin header, allow
  }

  const allowed = [
    ...(allowedOrigins || []),
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean);

  if (!allowed.includes(origin)) {
    return new Response(
      JSON.stringify({ 
        error: 'Origin not allowed' 
      }),
      { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  return null; // Success
}
