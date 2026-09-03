// Data loader with cache-first approach using static data as fallback
// Loads static data immediately, then enhances with live data asynchronously

import { chains as staticChains, tokens as staticTokens } from './data.js';
import { fetchLiveChains as fetchLifiChains, fetchLiveTokens as fetchLifiTokens } from './lifi.js';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let chainsCacheTime = 0;
let tokensCacheTime = 0;
let chainsCache = null;
let tokensCache = new Map();

/**
 * Get chains with static data immediately, then enhance with live data in background
 * Returns static data first, then updates via callback when live data is ready
 */
export async function loadChainsWithFallback() {
  const now = Date.now();
  
  // Return cached live data if still fresh
  if (chainsCache && now - chainsCacheTime < CACHE_TTL) {
    return chainsCache;
  }
  
  // Return static data immediately
  return staticChains;
}

/**
 * Fetch live chains in background and cache them
 * Safe to call without awaiting - updates cache silently
 */
export function enhanceChainsInBackground() {
  const now = Date.now();
  
  // Skip if cache is still fresh
  if (chainsCache && now - chainsCacheTime < CACHE_TTL) {
    return Promise.resolve(chainsCache);
  }
  
  // Fetch live data without blocking
  return fetchLifiChains()
    .then((liveChains) => {
      chainsCache = liveChains && liveChains.length > 0 ? liveChains : staticChains;
      chainsCacheTime = Date.now();
      return chainsCache;
    })
    .catch(() => {
      // Keep static data on error
      chainsCache = staticChains;
      chainsCacheTime = Date.now();
      return chainsCache;
    });
}

/**
 * Get tokens with static data immediately
 * Returns static data first, then updates via callback when live data is ready
 */
export async function loadTokensWithFallback(chainIdOrIds) {
  const cacheKey = Array.isArray(chainIdOrIds)
    ? chainIdOrIds.join(',')
    : String(chainIdOrIds ?? 'all');
  
  const now = Date.now();
  
  // Return cached live data if still fresh
  const cached = tokensCache.get(cacheKey);
  if (cached && now - cached.time < CACHE_TTL) {
    return cached.data;
  }
  
  // Return static data immediately
  if (chainIdOrIds) {
    const ids = Array.isArray(chainIdOrIds) ? chainIdOrIds : [chainIdOrIds];
    return staticTokens.filter((t) => ids.includes(t.chain));
  }
  
  return staticTokens;
}

/**
 * Fetch live tokens in background and cache them
 * Safe to call without awaiting - updates cache silently
 */
export function enhanceTokensInBackground(chainIdOrIds) {
  const cacheKey = Array.isArray(chainIdOrIds)
    ? chainIdOrIds.join(',')
    : String(chainIdOrIds ?? 'all');
  
  const now = Date.now();
  
  // Skip if cache is still fresh
  const cached = tokensCache.get(cacheKey);
  if (cached && now - cached.time < CACHE_TTL) {
    return Promise.resolve(cached.data);
  }
  
  // Fetch live data without blocking
  return fetchLifiTokens(chainIdOrIds)
    .then((liveTokens) => {
      const data = liveTokens && liveTokens.length > 0 ? liveTokens : 
        (chainIdOrIds ? 
          staticTokens.filter((t) => {
            const ids = Array.isArray(chainIdOrIds) ? chainIdOrIds : [chainIdOrIds];
            return ids.includes(t.chain);
          }) : 
          staticTokens);
      
      tokensCache.set(cacheKey, { data, time: Date.now() });
      return data;
    })
    .catch(() => {
      // Keep static data on error
      const staticFallback = chainIdOrIds ?
        staticTokens.filter((t) => {
          const ids = Array.isArray(chainIdOrIds) ? chainIdOrIds : [chainIdOrIds];
          return ids.includes(t.chain);
        }) :
        staticTokens;
      
      tokensCache.set(cacheKey, { data: staticFallback, time: Date.now() });
      return staticFallback;
    });
}

/**
 * Convenience function to load chains and start background enhancement
 */
export async function getChainsOptimized() {
  const staticData = await loadChainsWithFallback();
  // Start background fetch without blocking
  enhanceChainsInBackground();
  return staticData;
}

/**
 * Convenience function to load tokens and start background enhancement
 */
export async function getTokensOptimized(chainIdOrIds) {
  const staticData = await loadTokensWithFallback(chainIdOrIds);
  // Start background fetch without blocking
  enhanceTokensInBackground(chainIdOrIds);
  return staticData;
}

// Preload and cache static data at module load
export function initializeCache() {
  chainsCache = staticChains;
  chainsCacheTime = Date.now();
  tokensCache.set('all', { data: staticTokens, time: Date.now() });
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initializeCache();
}
