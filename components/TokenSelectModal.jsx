'use client';

import { useEffect, useMemo, useState } from 'react';
import { X, Search } from 'lucide-react';
import { chains, tokens } from '@/lib/data';
import { fetchLiveChains, fetchLiveTokens } from '@/lib/lifi';

const tokenCache = new Map();

export default function TokenSelectModal({ field, defaultChainId, onClose, onSelect }) {
  const [availableChains, setAvailableChains] = useState(chains);
  const [chainsLoading, setChainsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setChainsLoading(true);
    fetchLiveChains()
      .then((data) => {
        if (!cancelled && data?.length) {
          setAvailableChains(data);
        }
      })
      .catch(() => {
        setAvailableChains(chains);
      })
      .finally(() => {
        if (!cancelled) setChainsLoading(false);
      });

    return () => { cancelled = true; };
  }, []);
  const [query, setQuery] = useState('');
  const [chainId, setChainId] = useState(defaultChainId ?? null);
  const [memeFilter, setMemeFilter] = useState(false);
  const [modalTokens, setModalTokens] = useState(tokens);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supportedChainIds = new Set(availableChains.map((c) => c.id));
    const useAllChains = chainId === null;
    const queryString = query.trim().toLowerCase();
    const shouldFetchAllChains = useAllChains && queryString.length >= 2;
    const canFetch = chainId !== null || shouldFetchAllChains;
    const cacheKey = canFetch ? String(chainId ?? 'all') : `fallback:${chainId ?? 'all'}`;
    const fallbackTokens = chainId ? tokens.filter((t) => t.chain === chainId) : tokens.slice(0, 120);
    const cached = tokenCache.get(cacheKey);

    setModalTokens(cached?.length ? cached : fallbackTokens);

    if (!canFetch) {
      setModalTokens(fallbackTokens);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const fetchTarget = chainId !== null ? chainId : (availableChains.length > 0 ? availableChains.map((c) => c.id) : undefined);

    fetchLiveTokens(fetchTarget)
      .then((data) => {
        if (cancelled) return;
        const final = data.length ? data : fallbackTokens;
        tokenCache.set(cacheKey, final);
        setModalTokens(final);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setModalTokens(fallbackTokens);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [chainId, availableChains, query]);

  const pool = useMemo(
    () => (memeFilter ? tokens.filter((t) => t.tag === 'MEME') : modalTokens),
    [memeFilter, modalTokens],
  );

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () => pool.filter((t) => {
      const matchesQuery = !q || t.sym.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || (t.address || '').toLowerCase().includes(q);
      const matchesChain = memeFilter || !chainId || t.chain === chainId;
      return matchesQuery && matchesChain;
    }),
    [pool, q, memeFilter, chainId],
  );

  const MAX_RENDERED = 140;
  const visibleTokens = useMemo(() => filtered.slice(0, MAX_RENDERED), [filtered]);
  const hasMoreTokens = filtered.length > MAX_RENDERED;
  const chainInfoMap = useMemo(
    () => new Map(availableChains.map((c) => [c.id, c])),
    [availableChains],
  );

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Select {field === 'from' ? 'Pay Token' : 'Receive Token'}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="modal-search-box">
            <Search size={16} />
            <input
              type="text"
              className="modal-search-input"
              placeholder="Search token name or paste address..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              style={{ paddingLeft: 40 }}
            />
          </div>

          <div className="chain-pills">
            <div
              className={`chain-pill ${chainId === null && !memeFilter ? 'active' : ''}`}
              onClick={() => { setChainId(null); setMemeFilter(false); }}
            >
              <span>All Chains</span>
            </div>
            <div
              className={`chain-pill meme-pill ${memeFilter ? 'active' : ''}`}
              onClick={() => setMemeFilter((v) => !v)}
            >
              <span>🔥 Memes</span>
            </div>
            {availableChains.map((c) => (
              <div
                key={c.id}
                className={`chain-pill ${!memeFilter && chainId === c.id ? 'active' : ''}`}
                onClick={() => { setMemeFilter(false); setChainId(chainId === c.id ? null : c.id); }}
              >
                <img className="chain-pill-logo" src={c.logo} alt={c.name} />
                <span>{c.name}</span>
              </div>
            ))}
          </div>

          <div className="token-list">
            {loading && modalTokens.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-dim)' }}></div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-dim)' }}>No tokens found</div>
            ) : (
              visibleTokens.map((t) => {
                const chainInfo = chainInfoMap.get(t.chain);
                return (
                  <div className="token-item" key={`${t.chain}-${t.address}`} onClick={() => onSelect(t)}>
                    <div className="token-item-left">
                      <img className="token-logo" src={t.logo} alt={t.sym} />
                      <div className="token-item-info">
                        <span className="token-item-sym">{t.sym}{t.tag && <span className="meme-tag">{t.tag}</span>}</span>
                        <span className="token-item-name">{t.name}</span>
                      </div>
                    </div>
                    {chainInfo && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-dim)' }}>
                        <img className="token-chain-logo" src={chainInfo.logo} alt={chainInfo.name} />
                        <span>{chainInfo.name}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {hasMoreTokens && (
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-dim)' }}>
                Showing first {MAX_RENDERED} tokens. Narrow your search or choose a chain.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
