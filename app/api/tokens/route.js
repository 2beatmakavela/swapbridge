import { fetchLiveTokens } from '@/lib/lifi.js';
import { tokens as staticTokens } from '@/lib/data.js';
import { captureServerException, initServerSentry } from '@/lib/server/sentry.js';

initServerSentry();

function mergeTokens(staticTokens, liveTokens) {
  const merged = new Map(
    staticTokens.map((token) => [
      `${token.chain}:${String(token.address || token.sym).toLowerCase()}`,
      token,
    ]),
  );
  for (const token of liveTokens || []) {
    const key = `${token.chain}:${String(token.address || token.sym).toLowerCase()}`;
    merged.set(key, { ...merged.get(key), ...token });
  }
  return [...merged.values()];
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const chainIdParam = url.searchParams.get('chainId');
    const chainsParam = url.searchParams.get('chains');
    
    // Support both single chainId and comma-separated chains
    const chains = chainIdParam 
      ? [Number(chainIdParam)]
      : chainsParam 
        ? chainsParam.split(',').map(Number)
        : undefined;

    // Get static tokens immediately (fast response)
    let tokens = chains 
      ? staticTokens.filter((t) => chains.includes(t.chain))
      : staticTokens;
    
    let isLive = false;

    try {
      // Allow the large upstream token catalog to finish while the client shows static data.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const liveTokens = await fetchLiveTokens(chains, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (liveTokens && liveTokens.length > 0) {
        tokens = mergeTokens(tokens, liveTokens);
        isLive = true;
      }
    } catch (liveError) {
      // If live fetch fails or times out, continue with static data
      // This is intentional - we prefer fast response over waiting
    }
    
    return new Response(JSON.stringify({ tokens, isLive }), {
      status: 200,
      headers: { 
        'content-type': 'application/json',
        'cache-control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    captureServerException(error, { path: '/api/tokens' });
    const url = new URL(request.url);
    const chainIdParam = url.searchParams.get('chainId');
    const chainsParam = url.searchParams.get('chains');
    const chains = chainIdParam 
      ? [Number(chainIdParam)]
      : chainsParam 
        ? chainsParam.split(',').map(Number)
        : undefined;
    const fallbackTokens = chains 
      ? staticTokens.filter((t) => chains.includes(t.chain))
      : staticTokens;
    
    return new Response(JSON.stringify({ error: 'Failed to fetch live tokens', tokens: fallbackTokens, isLive: false }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
}
