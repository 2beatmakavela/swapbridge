import { fetchLiveChains } from '@/lib/lifi.js';
import { chains as staticChains } from '@/lib/data.js';
import { captureServerException, initServerSentry } from '@/lib/server/sentry.js';

initServerSentry();

function mergeChains(staticChains, liveChains) {
  const merged = new Map(staticChains.map((chain) => [String(chain.id), chain]));
  for (const chain of liveChains || []) {
    const key = String(chain.id);
    merged.set(key, { ...merged.get(key), ...chain });
  }
  return [...merged.values()];
}

export async function GET(request) {
  try {
    // Return static chains immediately (fast response)
    // Then try to fetch live chains with a timeout for background enhancement
    let chains = staticChains;
    let isLive = false;

    try {
      // Allow the upstream request to finish while the client shows static data.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const liveChains = await fetchLiveChains({ signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (liveChains && liveChains.length > 0) {
        chains = mergeChains(staticChains, liveChains);
        isLive = true;
      }
    } catch (liveError) {
      // If live fetch fails or times out, continue with static data
      // This is intentional - we prefer fast response over waiting
    }

    return new Response(JSON.stringify({ chains, isLive }), {
      status: 200,
      headers: { 
        'content-type': 'application/json',
        'cache-control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    captureServerException(error, { path: '/api/chains' });
    return new Response(JSON.stringify({ error: 'Failed to fetch chains', chains: staticChains, isLive: false }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
}
