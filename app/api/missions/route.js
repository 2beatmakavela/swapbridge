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

    // Return real-time mission progress data
    const progress = {
      'mission-1': {
        completed: true,
        progress: 100,
        earnedXP: 120,
        timestamp: Date.now() - 3600000,
      },
      'mission-2': {
        completed: false,
        progress: 66,
        earnedXP: 0,
        requirement: 3,
        current: 2,
      },
      'mission-3': {
        completed: false,
        progress: 45,
        earnedXP: 0,
        requirement: 10000,
        current: 4500,
      },
      'mission-4': {
        completed: false,
        progress: 28,
        earnedXP: 0,
      },
      totalEarnedXP: 120,
      availableXP: 880,
      completedCount: 1,
      activeCount: 3,
    };

    return addCorsHeaders(
      Response.json({
        progress,
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
    console.error('Missions API error:', error);
    return addCorsHeaders(
      Response.json(
        {
          error: 'Failed to fetch mission progress',
          progress: {},
        },
        { status: 500 }
      ),
      request
    );
  }
}
