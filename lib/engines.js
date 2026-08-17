// Multi-engine routing layer.
//
//   Layer 1 (DEX liquidity)   -> chainDexMap below; attached to each route
//                                as `dexSources` so the UI can show which
//                                pools a quote is actually routing through.
//   Layer 2 (Swap engines)    -> same-chain quote aggregators.
//   Layer 3 (Bridge engines)  -> cross-chain quote aggregators.
//
// Honesty note: LI.FI, Jupiter, Across, Relay and Mayan all expose public,
// key-less, CORS-friendly REST endpoints that a static frontend can call
// directly, so those are wired up for real. 1inch, ODOS, OpenOcean, and
// Uniswap's own Trading API now require an API key (meant to be called from
// a backend), and Stargate/Celer/Chainflip don't expose a simple quote-only
// REST endpoint without their SDKs. Those six are modeled as "simulated"
// engines -- clearly tagged "Est." in the UI -- so the multi-engine
// comparison still renders, but nothing pretends to be live data it isn't.
// Swap the `simulate*` functions below for real backend calls whenever you
// have a server to hold the API keys.

import { mockPrice } from './data.js';
import { fetchLiveQuote } from './lifi.js';

export const SOLANA_CHAIN_ID = 1151111081099710;

/* ---------------- Layer 1: DEX liquidity sources per chain ---------------- */

export const chainDexMap = {
  1: ['Uniswap', 'SushiSwap'],
  42161: ['Camelot', 'Uniswap', 'SushiSwap'],
  10: ['Uniswap'],
  8453: ['Aerodrome', 'Uniswap'],
  137: ['Uniswap', 'SushiSwap'],
  56: ['PancakeSwap', 'SushiSwap'],
  43114: ['Trader Joe', 'SushiSwap'],
  [SOLANA_CHAIN_ID]: ['Raydium', 'Orca'],
  195: ['SushiSwap'],
  250: ['SushiSwap'],
};

function dexSourcesFor(chainId, enabledExchanges) {
  const pool = chainDexMap[chainId] || ['Uniswap'];
  const filtered = enabledExchanges ? pool.filter((d) => enabledExchanges.has(d)) : pool;
  return filtered.length ? filtered : pool.slice(0, 1);
}

/* ---------------- Layer 2: Swap engines (same-chain) ---------------- */

export const SWAP_ENGINES = [
  { id: 'lifi', name: 'LI.FI', live: true },
  { id: 'jupiter', name: 'Jupiter', live: true },
  { id: '1inch', name: '1inch', live: false },
  { id: 'odos', name: 'ODOS', live: false },
  { id: 'openocean', name: 'OpenOcean', live: false },
  { id: 'uniswap', name: 'Uniswap Routing', live: false },
];

/* ---------------- Layer 3: Bridge engines (cross-chain) ---------------- */

export const BRIDGE_ENGINES = [
  { id: 'across', name: 'Across', live: true },
  { id: 'relay', name: 'Relay', live: true },
  { id: 'mayan', name: 'Mayan', live: true },
  { id: 'stargate', name: 'Stargate', live: false },
  { id: 'celer', name: 'Celer', live: false },
  { id: 'chainflip', name: 'Chainflip', live: false },
];

/* ---------------- Helpers ---------------- */

function rawToHuman(raw, decimals) {
  try {
    const value = BigInt(raw).toString();
    const padded = value.padStart(decimals + 1, '0');
    const whole = padded.slice(0, -decimals);
    const fraction = padded.slice(-decimals).replace(/0+$/, '');
    return parseFloat(fraction ? `${whole}.${fraction}` : whole);
  } catch {
    return 0;
  }
}

// Small deterministic pseudo-variance (0.85x-1.15x by default) so simulated
// engines don't all return the exact same number, without flickering on
// every re-render the way Math.random() would.
function jitter(seed, spread = 0.15) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const r = (h % 1000) / 1000;
  return 1 + (r - 0.5) * 2 * spread;
}

function mockRate(fromToken, toToken, sendAmount) {
  const fromPrice = mockPrice[fromToken.sym] || 0;
  const toPrice = mockPrice[toToken.sym] || 0;
  const amt = parseFloat(sendAmount) || 0;
  return toPrice > 0 ? (amt * fromPrice) / toPrice : 0;
}

/* ---------------- Layer 2 adapters ---------------- */

async function fetchLiveQuoteAdapter({ fromToken, toToken, amountRaw, walletAddress, routePriority, enabledExchanges }) {
  const data = await fetchLiveQuote({
    fromChain: fromToken.chainId,
    toChain: toToken.chainId,
    fromToken: fromToken.address,
    toToken: toToken.address,
    fromAmount: amountRaw,
    fromAddress: walletAddress,
    routePriority,
  });
  const toAmount = rawToHuman(data?.toAmount, toToken.decimals);
  if (!toAmount) throw new Error('LI.FI: empty quote');
  const toolName = data?.toolDetails?.name;
  const sameChain = fromToken.chain === toToken.chain;
  return {
    engineId: 'lifi', engineName: 'LI.FI', simulated: false,
    toAmount,
    gasUsd: Number(data?.estimate?.gasCosts?.[0]?.amountUSD) || 0.4,
    durationSec: Number(data?.estimate?.executionDuration) || (sameChain ? 15 : 60),
    dexSources: sameChain ? (toolName ? [toolName] : dexSourcesFor(fromToken.chain, enabledExchanges)) : [],
    bridgeName: sameChain ? null : (toolName || 'LI.FI Bridge'),
    raw: data,
  };
}

// Docs: https://station.jup.ag/docs/api/quote-api -- public, CORS-enabled,
// no key required. Same-chain (Solana) only.
async function fetchJupiterQuote({ fromToken, toToken, amountRaw }) {
  const url = `https://quote-api.jup.ag/v6/quote?inputMint=${fromToken.address}&outputMint=${toToken.address}&amount=${amountRaw}&slippageBps=50`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Jupiter API returned ${res.status}`);
  const data = await res.json();
  if (!data?.outAmount) throw new Error('Jupiter: no outAmount in response');
  const dexSources = Array.from(new Set((data.routePlan || [])
    .map((s) => s?.swapInfo?.label)
    .filter(Boolean)));
  return {
    engineId: 'jupiter', engineName: 'Jupiter', simulated: false,
    toAmount: rawToHuman(data.outAmount, toToken.decimals),
    gasUsd: 0.001,
    durationSec: 2,
    dexSources: dexSources.length ? dexSources : ['Raydium'],
    bridgeName: null,
    raw: data,
  };
}

// 1inch, ODOS and OpenOcean all gate their production quote endpoints behind
// an API key today (meant to be called server-side), and a from-scratch
// on-chain Uniswap auto-router needs an RPC provider -- none of that is
// something a static frontend can do safely. These stand in as clearly
// labeled estimates until you have a backend to hold the keys.
function simulateSwapEngine(engine, { fromToken, toToken, sendAmount, enabledExchanges }) {
  const base = mockRate(fromToken, toToken, sendAmount);
  const toAmount = base * jitter(`${engine.id}-${fromToken.sym}-${toToken.sym}`);
  return {
    engineId: engine.id, engineName: engine.name, simulated: true,
    toAmount,
    gasUsd: Math.max(0.05, 0.3 * jitter(`${engine.id}-gas`, 0.6)),
    durationSec: Math.round(8 + jitter(`${engine.id}-dur`, 0.7) * 18),
    dexSources: dexSourcesFor(fromToken.chain, enabledExchanges),
    bridgeName: null,
    raw: null,
  };
}

/* ---------------- Layer 3 adapters ---------------- */

// Docs: https://docs.across.to/reference/api-reference -- public, no key.
// Across bridges a single asset between chains (it doesn't swap), so it's
// only a valid candidate when both sides are "the same" token.
async function fetchAcrossQuote({ fromToken, toToken, amountRaw }) {
  const url = `https://app.across.to/api/suggested-fees?token=${fromToken.address}&originChainId=${fromToken.chainId}&destinationChainId=${toToken.chainId}&amount=${amountRaw}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Across API returned ${res.status}`);
  const data = await res.json();
  const relayFeePct = Number(data?.relayerFeePct) / 1e18 || 0;
  const lpFeePct = Number(data?.lpFeePct) / 1e18 || 0;
  const totalFeePct = Number.isFinite(relayFeePct + lpFeePct) ? relayFeePct + lpFeePct : 0.001;
  const amountFloat = rawToHuman(amountRaw, fromToken.decimals);
  return {
    engineId: 'across', engineName: 'Across', simulated: false,
    toAmount: amountFloat * (1 - totalFeePct),
    gasUsd: 0.5,
    durationSec: Number(data?.estimatedFillTimeSec) || 90,
    dexSources: [],
    bridgeName: 'Across',
    raw: data,
  };
}

// Docs: https://docs.relay.link/references/api/get-quote -- public, no key.
// Handles swap + bridge together, so fromToken/toToken can differ.
async function fetchRelayQuote({ fromToken, toToken, amountRaw, walletAddress }) {
  const res = await fetch('https://api.relay.link/quote', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      user: walletAddress,
      originChainId: fromToken.chainId,
      destinationChainId: toToken.chainId,
      originCurrency: fromToken.address,
      destinationCurrency: toToken.address,
      amount: amountRaw,
      tradeType: 'EXACT_INPUT',
    }),
  });
  if (!res.ok) throw new Error(`Relay API returned ${res.status}`);
  const data = await res.json();
  const currencyOut = data?.details?.currencyOut;
  if (!currencyOut) throw new Error('Relay: no currencyOut in response');
  const toAmount = currencyOut.amountFormatted
    ? parseFloat(currencyOut.amountFormatted)
    : rawToHuman(currencyOut.amount, toToken.decimals);
  return {
    engineId: 'relay', engineName: 'Relay', simulated: false,
    toAmount,
    gasUsd: parseFloat(data?.fees?.gas?.amountUsd) || 0.4,
    durationSec: Number(data?.details?.timeEstimate) || 30,
    dexSources: [],
    bridgeName: 'Relay',
    raw: data,
  };
}

// Docs: https://docs.mayan.finance/ -- public, no key. Specializes in
// Solana <-> EVM swap+bridge routes.
function mayanChainKey(chainId) {
  const map = {
    1: 'ethereum', 42161: 'arbitrum', 10: 'optimism', 8453: 'base',
    137: 'polygon', 56: 'bsc', 43114: 'avalanche', [SOLANA_CHAIN_ID]: 'solana',
  };
  return map[chainId] || 'ethereum';
}

async function fetchMayanQuote({ fromToken, toToken, amountRaw }) {
  const amount = rawToHuman(amountRaw, fromToken.decimals);
  const url = `https://price-api.mayan.finance/v3/quote?amountIn=${amount}&fromToken=${fromToken.address}&fromChain=${mayanChainKey(fromToken.chain)}&toToken=${toToken.address}&toChain=${mayanChainKey(toToken.chain)}&slippageBps=50`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Mayan API returned ${res.status}`);
  const data = await res.json();
  const best = Array.isArray(data?.quotes) ? data.quotes[0] : data;
  const toAmount = Number(best?.expectedAmountOut);
  if (!Number.isFinite(toAmount)) throw new Error('Mayan: no expectedAmountOut in response');
  return {
    engineId: 'mayan', engineName: 'Mayan', simulated: false,
    toAmount,
    gasUsd: Number(best?.gasDrop) || 0.35,
    durationSec: Number(best?.etaSeconds) || 60,
    dexSources: [],
    bridgeName: 'Mayan',
    raw: data,
  };
}

// Stargate, Celer and Chainflip don't offer a plain no-key quote-only REST
// endpoint that works from a browser (Stargate/Celer expect on-chain reads
// via their SDKs; Chainflip's is a broker RPC) -- simulated the same way as
// the Layer-2 fallback engines above, clearly tagged "Est." in the UI.
function simulateBridgeEngine(engine, { fromToken, toToken, sendAmount }) {
  const base = mockRate(fromToken, toToken, sendAmount);
  const toAmount = base * jitter(`${engine.id}-bridge-${fromToken.sym}-${toToken.sym}`) * 0.997;
  return {
    engineId: engine.id, engineName: engine.name, simulated: true,
    toAmount,
    gasUsd: Math.max(0.1, 0.4 * jitter(`${engine.id}-gas`, 0.5)),
    durationSec: Math.round(30 + jitter(`${engine.id}-dur`, 0.8) * 150),
    dexSources: [],
    bridgeName: engine.name,
    raw: null,
  };
}

/* ---------------- Orchestrator ---------------- */

export async function getAllQuotes(ctx) {
  const { fromToken, toToken, sendAmount, walletAddress, routePriority, settings } = ctx;
  if (!fromToken || !toToken || !(parseFloat(sendAmount) > 0)) return [];

  const amountRaw = (() => {
    const n = parseFloat(sendAmount);
    if (!n || !fromToken.decimals) return null;
    return BigInt(Math.round(n * 10 ** fromToken.decimals)).toString();
  })();
  if (!amountRaw) return [];

  const sameChain = fromToken.chain === toToken.chain;
  const enabledExchanges = settings?.exchangesEnabled;
  const enabledBridges = settings?.bridgesEnabled;
  const addr = walletAddress || '0x0000000000000000000000000000000000000000';

  const jobs = [];

  // LI.FI covers both same-chain swaps and cross-chain bridging, so it's
  // always attempted first regardless of layer.
  jobs.push(
    fetchLiveQuoteAdapter({ fromToken, toToken, amountRaw, walletAddress: addr, routePriority, enabledExchanges })
      .catch((err) => { console.error('[LI.FI]', err.message); return null; })
  );

  if (sameChain) {
    if (fromToken.chain === SOLANA_CHAIN_ID) {
      jobs.push(
        fetchJupiterQuote({ fromToken, toToken, amountRaw })
          .catch((err) => { console.error('[Jupiter]', err.message); return null; })
      );
    }
    SWAP_ENGINES.filter((e) => !e.live).forEach((e) => {
      jobs.push(Promise.resolve(simulateSwapEngine(e, { fromToken, toToken, sendAmount, enabledExchanges })));
    });
  } else {
    const sameAsset = fromToken.sym === toToken.sym;
    if (sameAsset && (!enabledBridges || enabledBridges.has('Across'))) {
      jobs.push(
        fetchAcrossQuote({ fromToken, toToken, amountRaw })
          .catch((err) => { console.error('[Across]', err.message); return null; })
      );
    }
    if (!enabledBridges || enabledBridges.has('Relay')) {
      jobs.push(
        fetchRelayQuote({ fromToken, toToken, amountRaw, walletAddress: addr })
          .catch((err) => { console.error('[Relay]', err.message); return null; })
      );
    }
    if (!enabledBridges || enabledBridges.has('Mayan')) {
      jobs.push(
        fetchMayanQuote({ fromToken, toToken, amountRaw })
          .catch((err) => { console.error('[Mayan]', err.message); return null; })
      );
    }
    BRIDGE_ENGINES.filter((e) => !e.live).forEach((e) => {
      if (!enabledBridges || enabledBridges.has(e.name)) {
        jobs.push(Promise.resolve(simulateBridgeEngine(e, { fromToken, toToken, sendAmount })));
      }
    });
  }

  const settled = await Promise.allSettled(jobs);
  let results = settled
    .map((r) => (r.status === 'fulfilled' ? r.value : null))
    .filter(Boolean);

  if (results.length === 0) {
    // Absolute fallback so the UI always has at least one route to show,
    // even if every network call above failed (offline, CORS, etc).
    results = [sameChain
      ? simulateSwapEngine({ id: 'lifi', name: 'LI.FI' }, { fromToken, toToken, sendAmount, enabledExchanges })
      : simulateBridgeEngine({ id: 'across', name: 'Across' }, { fromToken, toToken, sendAmount })];
  }

  const toPrice = mockPrice[toToken.sym] || 0;
  results.forEach((r) => { r.toAmountUsd = r.toAmount * toPrice; });

  results.sort((a, b) => {
    if (routePriority === 'Fastest') return a.durationSec - b.durationSec;
    if (routePriority === 'Lowest Gas') return a.gasUsd - b.gasUsd;
    if (routePriority === 'Safest') {
      if (a.simulated !== b.simulated) return a.simulated ? 1 : -1;
      return b.toAmount - a.toAmount;
    }
    return b.toAmount - a.toAmount; // "Best Return" default
  });

  return results;
}
