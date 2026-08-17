'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  ArrowRight,
  BarChart3,
  Layers,
  Sparkles,
  Wallet,
  Star,
  X,
} from 'lucide-react';
import {
  chains,
  defaultBridges,
  defaultExchanges,
  mockPrice,
  tokens,
} from '@/lib/data';
import { fetchLiveChains } from '@/lib/lifi';
import { BRIDGE_ENGINES, chainDexMap } from '@/lib/engines';

const tabs = ['Overview', 'Tokens', 'DeFi Protocols'];
const protocolCards = [
  { name: 'Aave', category: 'Lending', tvl: '$7.1B', yield: '+2.8%' },
  { name: 'Curve', category: 'Stable swaps', tvl: '$4.2B', yield: '+3.2%' },
  { name: 'Lido', category: 'Staking', tvl: '$12.8B', yield: '+4.5%' },
  { name: 'Uniswap', category: 'DEX', tvl: '$3.7B', yield: '+1.9%' },
  { name: 'GMX', category: 'Derivatives', tvl: '$1.4B', yield: '+5.0%' },
];

const holdingsMap = {
  ETH: 1.18,
  USDC: 5400,
  USDT: 2800,
  MATIC: 340,
  SOL: 9.25,
  WBTC: 0.038,
  PEPE: 1240000,
  ARB: 7100,
  BONK: 620000,
};

function formatCurrency(value) {
  if (value == null || Number.isNaN(value)) return '$0';
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatSmallCurrency(value) {
  if (value == null || Number.isNaN(value)) return '$0.00';
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return '0%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export default function PortfolioSection({ onOpenTrade = () => {} }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [liveChains, setLiveChains] = useState(chains);
  const [liveBridgeCount, setLiveBridgeCount] = useState(
    BRIDGE_ENGINES.filter((engine) => engine.live).length,
  );
  const [liveDexCount, setLiveDexCount] = useState(
    new Set(Object.values(chainDexMap).flat()).size,
  );

  useEffect(() => {
    let cancelled = false;
    fetchLiveChains()
      .then((data) => {
        if (!cancelled && data?.length) {
          setLiveChains(data);
        }
      })
      .catch(() => {
        // Leave fallback counts in place if live fetch fails.
      });
    return () => { cancelled = true; };
  }, []);

  const holdings = useMemo(() => {
    return Object.entries(holdingsMap).map(([sym, amount]) => {
      const token = tokens.find((tokenItem) => tokenItem.sym === sym);
      const price = mockPrice[sym] ?? 0;
      return {
        symbol: sym,
        name: token?.name ?? sym,
        chain: token?.name === sym ? 'Ethereum' : token?.chainName ?? token?.chain ?? 'Ethereum',
        amount,
        price,
        value: Number((amount * price).toFixed(2)),
        image: token?.logo ?? '/icons/eth.svg',
        color: token?.color ?? '#8b5cf6',
      };
    });
  }, []);

  const portfolioValue = useMemo(
    () => holdings.reduce((sum, holding) => sum + (holding.value || 0), 0),
    [holdings],
  );

  const totalAssets = holdings.length;

  const [selectedToken, setSelectedToken] = useState(null);

  const visibleHoldings = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return holdings;
    return holdings.filter((holding) =>
      holding.symbol.toLowerCase().includes(normalized) ||
      holding.name.toLowerCase().includes(normalized) ||
      holding.chain.toLowerCase().includes(normalized),
    );
  }, [holdings, searchTerm]);

  const allocationTotal = portfolioValue || 1;

  function openTokenDetails(token) {
    setSelectedToken(token);
  }

  function closeTokenDetails() {
    setSelectedToken(null);
  }

  return (
    <section className="portfolio-section">
      <div className="portfolio-hero-card">
        <div className="portfolio-hero-copy">
          <p className="portfolio-hero-kicker">Portfolio</p>
          <h1>Welcome to Boltswap Portfolio!</h1>
          <p className="portfolio-hero-description">
            DeFi's interactive portfolio. Track your asset value, holdings, and protocols in one place.
          </p>

          <div className="portfolio-hero-stats">
            <div className="portfolio-hero-stat">
              <span className="portfolio-stat-value">{liveChains.length}</span>
              <span className="portfolio-stat-label">Chains</span>
            </div>
            <div className="portfolio-hero-stat">
              <span className="portfolio-stat-value">{liveBridgeCount}</span>
              <span className="portfolio-stat-label">Bridges</span>
            </div>
            <div className="portfolio-hero-stat">
              <span className="portfolio-stat-value">{liveDexCount}</span>
              <span className="portfolio-stat-label">DEXs</span>
            </div>
          </div>

          <div className="portfolio-hero-actions">
            <button className="portfolio-primary-button" onClick={onOpenTrade}>
              Get started
            </button>
          </div>
        </div>
      </div>

      <div className="portfolio-tab-row">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab}
            className={`portfolio-tab-pill ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="portfolio-panel">
        {activeTab === 'Overview' && (
          <div className="portfolio-overview-grid">
            <div className="portfolio-overview-card">
              <div className="portfolio-card-icon">
                <Sparkles size={18} />
              </div>
              <h3>Net worth growth</h3>
              <p>Performance across your assets and protocols over the last 30 days.</p>
              <strong>+12.4%</strong>
            </div>
            <div className="portfolio-overview-card">
              <div className="portfolio-card-icon">
                <Wallet size={18} />
              </div>
              <h3>Wallet exposure</h3>
              <p>Balanced and diversified positions across blue chip and emerging markets.</p>
              <strong>{totalAssets} assets</strong>
            </div>
            <div className="portfolio-overview-card">
              <div className="portfolio-card-icon">
                <Layers size={18} />
              </div>
              <h3>Protocol allocation</h3>
              <p>Track your active DeFi exposure by lending, staking, and trading protocols.</p>
              <strong>{protocolCards.length} protocols</strong>
            </div>
          </div>
        )}

        {activeTab === 'Tokens' && (
          <div className="portfolio-tokens-panel">
            <div className="portfolio-search-row">
              <div className="portfolio-search-input">
                <Search size={16} />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search tokens, chains, or symbols"
                />
              </div>
              <button type="button" className="portfolio-secondary-button">
                Import asset
              </button>
            </div>

            <div className="portfolio-token-table-wrapper">
              <table className="portfolio-token-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Chain</th>
                    <th>Balance</th>
                    <th>Value</th>
                    <th>Allocation</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleHoldings.map((holding) => (
                    <tr
                      key={holding.symbol}
                      className="portfolio-token-row"
                      onClick={() => openTokenDetails(holding)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div className="portfolio-token-cell">
                          {holding.image ? (
                            <img
                              src={holding.image}
                              alt={`${holding.symbol} icon`}
                              className="portfolio-token-icon"
                            />
                          ) : (
                            <div
                              className="portfolio-token-dot"
                              style={{ backgroundColor: holding.color }}
                            />
                          )}
                          <div>
                            <strong>{holding.symbol}</strong>
                            <span>{holding.name}</span>
                          </div>
                        </div>
                      </td>
                      <td>{holding.chain}</td>
                      <td>{holding.amount.toLocaleString()} {holding.symbol}</td>
                      <td>{formatSmallCurrency(holding.value)}</td>
                      <td>{formatPercent((holding.value / allocationTotal) * 100)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'DeFi Protocols' && (
          <div className="portfolio-protocol-list">
            {protocolCards.map((protocol) => (
              <div key={protocol.name} className="protocol-card">
                <div className="protocol-card-header">
                  <div>
                    <h3>{protocol.name}</h3>
                    <p>{protocol.category}</p>
                  </div>
                  <span className="protocol-yield">{protocol.yield}</span>
                </div>
                <div className="protocol-card-body">
                  <p>{protocol.tvl} TVL</p>
                  <button type="button" className="portfolio-sm-button">
                    Manage
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedToken && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeTokenDetails(); }}>
          <div className="modal-content" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <div>
                <h2>{selectedToken.symbol} Details</h2>
                <p style={{ color: 'var(--text-dim)', margin: '6px 0 0' }}>{selectedToken.name}</p>
              </div>
              <button className="close-btn" onClick={closeTokenDetails} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ padding: '24px', overflowY: 'auto' }}>
              <div className="portfolio-detail-header" style={{ display: 'flex', gap: '18px', alignItems: 'center', marginBottom: '22px' }}>
                <div className="portfolio-token-dot" style={{ width: 48, height: 48, backgroundColor: selectedToken.color }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.75rem' }}>{selectedToken.symbol}</h3>
                  <p style={{ margin: '6px 0 0', color: 'var(--text-dim)' }}>{selectedToken.name}</p>
                </div>
              </div>
              <div className="portfolio-detail-grid" style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', marginBottom: '24px' }}>
                <div className="portfolio-detail-card" style={{ padding: '18px', borderRadius: '22px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Balance</span>
                  <strong style={{ display: 'block', marginTop: '8px', fontSize: '1.4rem' }}>{selectedToken.amount.toLocaleString()} {selectedToken.symbol}</strong>
                </div>
                <div className="portfolio-detail-card" style={{ padding: '18px', borderRadius: '22px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Market value</span>
                  <strong style={{ display: 'block', marginTop: '8px', fontSize: '1.4rem' }}>{formatSmallCurrency(selectedToken.value)}</strong>
                </div>
                <div className="portfolio-detail-card" style={{ padding: '18px', borderRadius: '22px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Price</span>
                  <strong style={{ display: 'block', marginTop: '8px', fontSize: '1.4rem' }}>{formatSmallCurrency(selectedToken.price)}</strong>
                </div>
                <div className="portfolio-detail-card" style={{ padding: '18px', borderRadius: '22px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Allocation</span>
                  <strong style={{ display: 'block', marginTop: '8px', fontSize: '1.4rem' }}>{formatPercent((selectedToken.value / allocationTotal) * 100)}</strong>
                </div>
              </div>
              <div className="portfolio-detail-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button type="button" className="portfolio-primary-button" style={{ flex: 1, minWidth: '140px' }}>Buy more</button>
                <button type="button" className="portfolio-secondary-button" style={{ flex: 1, minWidth: '140px' }}>Trade</button>
                <button type="button" className="portfolio-sm-button" style={{ flex: 1, minWidth: '140px' }}>Add to favorites</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
