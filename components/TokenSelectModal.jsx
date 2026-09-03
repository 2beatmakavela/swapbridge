'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { chains, tokens } from '@/lib/data';

const tokenCache = new Map();
let chainsCache = null;
const FETCH_TIMEOUT = 20000; // Allow the server time to finish the LiFi request.

function mergeTokenLists(staticTokens, liveTokens) {
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

// Helper: Fetch with timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export default function TokenSelectModal({ field, defaultChainId, onClose, onSelect }) {
  const [availableChains, setAvailableChains] = useState(chains); // Start with static data
  const chainsRefreshed = useRef(false);

  // Load chains in background without blocking UI
  useEffect(() => {
    if (chainsRefreshed.current) return;
    chainsRefreshed.current = true;
    
    // Use cached chains if available
    if (chainsCache) {
      setAvailableChains(chainsCache);
      return;
    }

    // Fetch live chains asynchronously in background (non-blocking)
    fetchWithTimeout('/api/chains', {}, FETCH_TIMEOUT)
      .then(async (res) => {
        if (res?.ok) {
          const data = await res.json();
          if (data?.chains?.length) {
            chainsCache = data.chains;
            setAvailableChains(data.chains);
          }
        }
      })
      .catch(() => {
        // Network error or timeout - keep static data
        chainsCache = chains;
      });
  }, []);

  const [query, setQuery] = useState('');
  const [chainQuery, setChainQuery] = useState('');
  const [chainId, setChainId] = useState(defaultChainId ?? null);
  const [memeFilter, setMemeFilter] = useState(false);
  const [modalTokens, setModalTokens] = useState(tokens.slice(0, 120)); // Start with static data
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const cacheKey = String(chainId ?? 'all');
    const fallbackTokens = chainId ? tokens.filter((t) => t.chain === chainId) : tokens.slice(0, 120);
    const cached = tokenCache.get(cacheKey);

    // Set static data immediately (non-blocking)
    setModalTokens(cached?.length ? cached : fallbackTokens);
    setLoading(false);

    // Fetch live tokens asynchronously in background without blocking UI
    const fetchTarget = chainId !== null ? chainId : (availableChains.length > 0 ? availableChains.map((c) => c.id) : undefined);

    if (fetchTarget !== undefined && !cached?.length) {
      const params = Array.isArray(fetchTarget) 
        ? `?chains=${fetchTarget.join(',')}`
        : `?chainId=${fetchTarget}`;

      fetchWithTimeout(`/api/tokens${params}`, {}, FETCH_TIMEOUT)
        .then(async (res) => {
          if (cancelled) return;
          if (res?.ok) {
            const data = await res.json();
            if (data?.tokens?.length) {
              const mergedTokens = mergeTokenLists(fallbackTokens, data.tokens);
              tokenCache.set(cacheKey, mergedTokens);
              setModalTokens(mergedTokens);
            }
          }
        })
        .catch(() => {
          // Timeout or network error - keep static data (already set)
        });
    }

    return () => { cancelled = true; };
  }, [chainId, availableChains]);

  const pool = useMemo(
    () => (memeFilter ? tokens.filter((t) => t.tag === 'MEME') : modalTokens),
    [memeFilter, modalTokens],
  );

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () => pool.filter((t) => {
      const symbolMatch = (t.sym || '').toLowerCase().includes(q);
      const nameMatch = (t.name || '').toLowerCase().includes(q);
      const addressMatch = (t.address || '').toLowerCase().includes(q);
      const matchesQuery = !q || symbolMatch || nameMatch || addressMatch;
      const matchesChain = memeFilter || !chainId || t.chain === chainId;
      return matchesQuery && matchesChain;
    }),
    [pool, q, memeFilter, chainId],
  );

  const filteredChains = useMemo(
    () => availableChains.filter((chain) => {
      const label = `${chain.name} ${chain.key}`.toLowerCase();
      return !chainQuery || label.includes(chainQuery.toLowerCase());
    }),
    [availableChains, chainQuery],
  );

  const visibleTokens = useMemo(() => filtered, [filtered]);
  const chainInfoMap = useMemo(
    () => new Map(availableChains.map((c) => [c.id, c])),
    [availableChains],
  );
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content token-select-modal">
        <div className="modal-header token-select-header">
          <h2>Select {field === 'from' ? 'Origin Token' : 'Token'}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="token-select-body">
          <aside className="token-chain-panel">
            <div className="token-search-box">
              <Search size={16} />
              <input
                type="text"
                className="modal-search-input"
                placeholder="Search Chains"
                value={chainQuery}
                onChange={(e) => setChainQuery(e.target.value)}
              />
            </div>

            <div className="token-chain-list">
              <button
                className={`token-chain-item ${chainId === null && !memeFilter ? 'active' : ''}`}
                onClick={() => { setChainId(null); setMemeFilter(false); }}
              >
                <img className="chain-pill-logo token-chain-all-logo" src="/Allswapchain/all-swap-chain.png" alt="All chains" />
                <span>All</span>
              </button>

              <div className="token-chain-group-title">All Chains</div>
              {filteredChains.map((c) => (
                <button
                  key={c.id}
                  className={`token-chain-item ${!memeFilter && chainId === c.id ? 'active' : ''}`}
                  onClick={() => { setMemeFilter(false); setChainId(chainId === c.id ? null : c.id); }}
                >
                  <img className="chain-pill-logo" src={c.logo} alt={c.name} />
                  <span>{c.name}</span>
                  {chainId === c.id && <span className="token-chain-check">✓</span>}
                </button>
              ))}
            </div>
          </aside>

          <section className="token-token-panel">
            <div className="token-search-box">
              <Search size={16} />
              <input
                type="text"
                className="modal-search-input"
                placeholder="Search Tokens"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {loading && (
              <div className="token-live-indicator">Loading live token data…</div>
            )}

            <div className="token-collection">
              <h3>All Tokens</h3>
              <div className="token-list">
                {loading && modalTokens.length === 0 ? (
                  <div className="token-empty-state">Loading tokens…</div>
                ) : visibleTokens.length === 0 ? (
                  <div className="token-empty-state">No tokens found</div>
                ) : (
                  visibleTokens.map((t) => (
                    <button type="button" className="token-item" key={`${t.chain}-${t.address || t.sym}`} onClick={() => onSelect(t)}>
                      <div className="token-item-left">
                        <img className="token-logo" src={t.logo} alt={t.sym} />
                        <div className="token-item-info">
                          <span className="token-item-sym">{t.sym}</span>
                          <span className="token-item-name">{t.name}</span>
                        </div>
                      </div>
                      <span className="token-chain-badge">{chainInfoMap.get(t.chain)?.name || 'Chain'}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
