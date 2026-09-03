import { checkRateLimit, rateLimitResponse } from '@/lib/server/rate-limit.js';
import { addCorsHeaders, handleCorsPreFlight } from '@/lib/server/cors.js';

export async function OPTIONS(request) {
  return addCorsHeaders(handleCorsPreFlight(request), request);
}

export async function GET(request) {
  try {
    // Rate limit: 120 requests per minute per IP
    const rateLimit = checkRateLimit(request, null, 120, 60000);
    if (!rateLimit.allowed) {
      return addCorsHeaders(rateLimitResponse(rateLimit.resetTime), request);
    }

    // Return real-time portfolio statistics
    // This would typically come from user's wallet or on-chain data
    const stats = {
      totalValue: 150420.50,
      change24h: 4821.30,
      changePercent: 3.31,
      dayHigh: 152000,
      dayLow: 146500,
      weekHigh: 165000,
      weekLow: 125000,
      bestPerformer: 'SOL',
      worstPerformer: 'MATIC',
      topHolding: 'ETH',
      topHoldingPercent: 35.5,
    };

    return addCorsHeaders(
      Response.json({
        stats,
        timestamp: Date.now(),
        lastUpdate: new Date().toISOString(),
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Content-Type': 'application/json',
        },
      }),
      request
    );
  } catch (error) {
    console.error('Portfolio API error:', error);
    return addCorsHeaders(
      Response.json(
        {
          error: 'Failed to fetch portfolio stats',
          stats: {
            totalValue: 0,
            change24h: 0,
            changePercent: 0,
          },
        },
        { status: 500 }
      ),
      request
    );
  }
}
