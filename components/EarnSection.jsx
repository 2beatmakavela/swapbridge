'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  BadgeCheck,
  Coins,
  LayoutGrid,
  LayoutList,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { chains, tokens } from '@/lib/data';

const pageTabs = ['For you', 'All markets', 'Your positions'];
const timeFilters = ['7d', '30d'];
const filterKeys = ['Chain', 'Protocol', 'Type', 'Asset'];

const defaultFilters = {
  Chain: 'All',
  Protocol: 'All',
  Type: 'All',
  Asset: 'All',
  Sort: 'APY',
};

const priceIdsByAsset = {
  USDC: 'usd-coin',
  USDT: 'tether',
  DAI: 'dai',
  EURS: 'eurs',
  ETH: 'ethereum',
  stETH: 'staked-ether',
  WBTC: 'wrapped-bitcoin',
  ARB: 'arbitrum',
  GMX: 'gmx',
  OP: 'optimism',
  MATIC: 'matic-network',
  BNB: 'binancecoin',
  AVAX: 'avalanche-2',
  SOL: 'solana',
  FTM: 'fantom',
  SHIB: 'shiba-inu',
  PEPE: 'pepe',
  FLOKI: 'floki',
  BONK: 'bonk',
  TRUMP: 'donald-trump',
  WIF: 'dogwifhat',
};

const staticMarkets = [
  {
    id: 'aave-usdc',
    title: 'Aave USDC Savings',
    protocol: 'Aave',
    chain: 'Ethereum',
    category: 'Lending',
    asset: 'USDC',
    badge: 'Lending',
    subtitle: 'Large pool liquidity with strong security',
    apyBase: 3.58,
    tvl: 1980000000,
    image: '/icons/aave.svg',
    position: true,
  },
  {
    id: 'morpho-kpk-usdc',
    title: 'Morpho KPK USDC',
    protocol: 'Morpho',
    chain: 'Ethereum',
    category: 'Lending',
    asset: 'USDC',
    badge: 'Lending',
    subtitle: 'Liquidity rewards, stable yield',
    apyBase: 3.76,
    tvl: 20330000,
    image: '/icons/morpho.svg',
    position: true,
  },
  {
    id: 'aave-eurs',
    title: 'Aave EURS Vault',
    protocol: 'Aave',
    chain: 'Ethereum',
    category: 'Stable',
    asset: 'EURS',
    badge: 'Stable',
    subtitle: 'Euro stablecoin yield with low volatility',
    apyBase: 4.25,
    tvl: 122000000,
    image: '/icons/aave.svg',
  },
  {
    id: 'lido-restake',
    title: 'Lido Restaking',
    protocol: 'Lido',
    chain: 'Ethereum',
    category: 'Restaking',
    asset: 'stETH',
    badge: 'Restaking',
    subtitle: 'Secure, liquid staking exposure',
    apyBase: 7.2,
    tvl: 6900000000,
    image: '/icons/lido.svg',
    position: true,
  },
  {
    id: 'hyperlend-ueth',
    title: 'HyperLend UETH',
    protocol: 'HyperLend',
    chain: 'HyperEVM',
    category: 'Lending',
    asset: 'UETH',
    badge: 'Lending',
    subtitle: 'Next-gen staking for bridged ETH',
    apyBase: 3.24,
    tvl: 4390000,
    image: '/icons/hyperlend.svg',
  },
  {
    id: 'curve-point-boost',
    title: 'Curve Point Boost',
    protocol: 'Curve',
    chain: 'Arbitrum',
    category: 'Rewards',
    asset: 'USDC',
    badge: 'Points',
    subtitle: 'Yield plus incentive rewards',
    apyBase: 12.1,
    tvl: 480000000,
    image: '/icons/curve.svg',
    position: true,
  },
];

function formatTVL(value) {
  if (value == null || Number.isNaN(value)) return '—';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function formatApy(value) {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value.toFixed(2)}%`;
}

function formatChange(value) {
  if (value == null || Number.isNaN(value)) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function normalizeAssetId(asset) {
  return asset
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '');
}

async function resolveCoinGeckoAssetIds(assetSymbols) {
  const known = { ...priceIdsByAsset };
  const missing = assetSymbols.filter((asset) => !known[asset]);
  if (missing.length === 0) {
    return known;
  }

  const response = await fetch('https://api.coingecko.com/api/v3/coins/list');
  if (!response.ok) {
    throw new Error('Failed to resolve CoinGecko asset IDs');
  }

  const coins = await response.json();
  const symbolMap = {};
  const nameMap = {};

  coins.forEach((coin) => {
    const symbol = coin.symbol?.toUpperCase();
    if (symbol && !symbolMap[symbol]) {
      symbolMap[symbol] = coin.id;
    }
    const name = coin.name?.toLowerCase();
    if (name && !nameMap[name]) {
      nameMap[name] = coin.id;
    }
  });

  missing.forEach((asset) => {
    if (symbolMap[asset.toUpperCase()]) {
      known[asset] = symbolMap[asset.toUpperCase()];
      return;
    }
    const fallback = normalizeAssetId(asset);
    if (nameMap[fallback]) {
      known[asset] = nameMap[fallback];
      return;
    }
    known[asset] = fallback;
  });

  return known;
}

function getDisplayApy(market, timeRange) {
  const base = market.apyBase ?? 0;
  if (timeRange === '30d') {
    return base * 1.08;
  }
  if (timeRange === '7d') {
    return base * 0.96;
  }
  return base;
}

export default function EarnSection() {
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState(defaultFilters);
  const [marketData, setMarketData] = useState([]);
  const [coinPrices, setCoinPrices] = useState({});
  const [priceChange, setPriceChange] = useState({});
  const [activeTab, setActiveTab] = useState('All markets');
  const [activeTime, setActiveTime] = useState('7d');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMarketId, setSelectedMarketId] = useState(null);

  useEffect(() => {
    const liveMarketData = tokens.map((token) => {
      const asset = token.sym;
      const chainName = chainNames[token.chain] ?? String(token.chain);
      const seed = asset
        .split('')
        .reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const apyBase = 2 + (seed % 16) + (token.tag === 'MEME' ? 6 : 0);
      const tvl = 5_000_000 + ((seed % 12) * 120_000_00);
      const position = ['USDC', 'USDT', 'ETH', 'WBTC', 'MATIC', 'SOL'].includes(asset);

      return {
        id: `${token.chain}-${asset}-${token.address}`,
        title: `${token.name} ${asset}`,
        protocol: token.tag === 'MEME' ? 'Meme Market' : token.name,
        chain: chainName,
        category: token.tag || 'Token',
        asset,
        badge: token.tag || 'Asset',
        subtitle: `${token.name} on ${chainName}`,
        apyBase,
        tvl,
        image: token.logo,
        position,
      };
    });

    setMarketData(liveMarketData);

    const fetchLivePrices = async () => {
      setLoading(true);
      setError(null);

      try {
        const symbols = Array.from(new Set(liveMarketData.map((market) => market.asset))).filter(Boolean);
        const lookup = await resolveCoinGeckoAssetIds(symbols);
        const ids = Array.from(new Set(Object.values(lookup))).filter(Boolean);
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`
        );

        if (!response.ok) {
          throw new Error('Failed to load live prices');
        }

        const data = await response.json();
        const prices = {};
        const changes = {};

        Object.entries(lookup).forEach(([asset, id]) => {
          prices[asset] = data[id]?.usd ?? (asset === 'USDC' || asset === 'USDT' ? 1 : 0);
          changes[asset] = data[id]?.usd_24h_change ?? 0;
        });

        setCoinPrices(prices);
        setPriceChange(changes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchLivePrices();
  }, []);

  const chainNames = useMemo(
    () => Object.fromEntries(chains.map((chain) => [chain.id, chain.name])),
    []
  );

  const availableFilters = useMemo(() => {
    const sets = {
      Chain: new Set(['All']),
      Protocol: new Set(['All']),
      Type: new Set(['All']),
      Asset: new Set(['All']),
    };

    marketData.forEach((market) => {
      sets.Chain.add(market.chain);
      sets.Protocol.add(market.protocol);
      sets.Type.add(market.category);
      sets.Asset.add(market.asset);
    });

    return Object.fromEntries(
      Object.entries(sets).map(([key, values]) => [key, [...values].sort()])
    );
  }, [marketData]);

  const visibleMarkets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return marketData
      .filter((market) => activeFilters.Chain === 'All' || market.chain === activeFilters.Chain)
      .filter((market) => activeFilters.Protocol === 'All' || market.protocol === activeFilters.Protocol)
      .filter((market) => activeFilters.Type === 'All' || market.category === activeFilters.Type)
      .filter((market) => activeFilters.Asset === 'All' || market.asset === activeFilters.Asset)
      .filter((market) => {
        if (!normalizedSearch) return true;
        return [market.title, market.protocol, market.chain, market.asset, market.category]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      });
  }, [activeFilters, marketData, search]);

  const sortedMarkets = useMemo(() => {
    const sorted = [...visibleMarkets];

    if (activeFilters.Sort === 'TVL') {
      return sorted.sort((a, b) => b.tvl - a.tvl);
    }

    if (activeFilters.Sort === 'Asset') {
      return sorted.sort((a, b) => a.asset.localeCompare(b.asset));
    }

    return sorted.sort((a, b) => b.apyBase - a.apyBase);
  }, [activeFilters.Sort, visibleMarkets]);

  const onFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
    setSelectedMarketId(null);
  };

  const filteredMarketsByTab = useMemo(() => {
    if (activeTab === 'Your positions') {
      return sortedMarkets.filter((market) => market.position);
    }
    if (activeTab === 'For you') {
      return sortedMarkets.filter((market) => market.badge !== 'Points');
    }
    return sortedMarkets;
  }, [activeTab, sortedMarkets]);

  const displayedMarkets = filteredMarketsByTab;
  const marketCount = displayedMarkets.length;
  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(displayedMarkets.length / pageSize));

  const pagedMarkets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayedMarkets.slice(start, start + pageSize);
  }, [displayedMarkets, currentPage]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= pageCount; i += 1) {
      pages.push(i);
    }
    return pages;
  }, [pageCount]);

  const setPage = (page) => {
    if (page < 1) return;
    if (page > pageCount) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeFilters, activeTab, activeTime]);

  const selectedMarket = displayedMarkets.find((market) => market.id === selectedMarketId);

  return (
    <section className="earn-section earn-market-page">
      <div className="earn-topbar">
        <div className="earn-tabs-bar">
          {pageTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={tab === activeTab ? 'earn-tab-pill active' : 'earn-tab-pill'}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="earn-time-bar">
          {timeFilters.map((option) => (
            <button
              key={option}
              type="button"
              className={option === activeTime ? 'earn-time-pill active' : 'earn-time-pill'}
              onClick={() => setActiveTime(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="earn-filter-panel card">
        <div className="earn-filter-row">
          {filterKeys.map((label) => (
            <label key={label} className="earn-filter-select">
              <span>{label}</span>
              <select value={activeFilters[label]} onChange={(e) => onFilterChange(label, e.target.value)}>
                {availableFilters[label].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <label className="earn-filter-select">
            <span>Sort</span>
            <select value={activeFilters.Sort} onChange={(e) => onFilterChange('Sort', e.target.value)}>
              {['APY', 'TVL', 'Asset'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="earn-filter-actions">
          <div className="earn-search-input">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search by pool, asset, chain, or protocol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="earn-view-controls">
            <button type="button" className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>
              <LayoutGrid size={16} />
            </button>
            <button type="button" className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
              <LayoutList size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="earn-summary-row">
        <div>
          <span className="earn-summary-label">{marketCount} pools</span>
          <span className="earn-summary-text">Showing {activeTime} yield and live prices</span>
        </div>
        <div className="earn-summary-note">
          {loading ? 'Loading live prices…' : error ? `Price fetch failed: ${error}` : 'Prices updated from CoinGecko'}
        </div>
      </div>

      <div className={viewMode === 'list' ? 'earn-cards-list' : 'earn-cards-grid'}>
        {pagedMarkets.map((market) => {
          const price = coinPrices[market.asset] ?? coinPrices.ETH ?? 0;
          const change = priceChange[market.asset] ?? 0;
          const tvlValue = formatTVL(market.tvl);
          const apyValue = formatApy(getDisplayApy(market, activeTime));

          return (
            <article key={market.id} className={`earn-market-card ${viewMode}`}>
              <div className="earn-card-header">
                <span className="earn-badge">{market.badge}</span>
                <span className="earn-card-icon">{market.asset}</span>
              </div>
              <div className="earn-card-body">
                <div>
                  <h3>{market.title}</h3>
                  <p>{market.protocol} • {market.chain}</p>
                </div>
                <div className="earn-card-asset">{market.asset}</div>
              </div>
              <div className="earn-card-stats">
                <div>
                  <span>APY</span>
                  <strong>{apyValue}</strong>
                </div>
                <div>
                  <span>TVL</span>
                  <strong>{tvlValue}</strong>
                </div>
              </div>
              <div className="earn-card-stats">
                <div>
                  <span>Price</span>
                  <strong>{price ? `$${price.toFixed(4)}` : 'n/a'}</strong>
                </div>
                <div>
                  <span>24h</span>
                  <strong className={change >= 0 ? 'positive-change' : 'negative-change'}>{formatChange(change)}</strong>
                </div>
              </div>
              <div className="earn-card-stats">
                <div>
                  <span>Asset value</span>
                  <strong>{market.asset === 'USDC' || market.asset === 'USDT' ? '$1.00' : price ? `$${price.toFixed(2)}` : 'n/a'}</strong>
                </div>
                <div>
                  <span>TVL</span>
                  <strong>{tvlValue}</strong>
                </div>
              </div>
              <div className="earn-card-footer">
                <span>{market.subtitle}</span>
                <button type="button" onClick={() => setSelectedMarketId(market.id)}>View pool</button>
              </div>
            </article>
          );
        })}
      </div>

      {selectedMarket && (
        <div className="earn-market-detail card">
          <div className="earn-market-detail-header">
            <div>
              <h3>{selectedMarket.title}</h3>
              <p>{selectedMarket.protocol} • {selectedMarket.chain}</p>
            </div>
            <button type="button" onClick={() => setSelectedMarketId(null)}>Close</button>
          </div>
          <div className="earn-market-detail-body">
            <div>
              <strong>Asset</strong>
              <span>{selectedMarket.asset}</span>
            </div>
            <div>
              <strong>APY</strong>
              <span>{formatApy(getDisplayApy(selectedMarket, activeTime))}</span>
            </div>
            <div>
              <strong>TVL</strong>
              <span>{formatTVL(selectedMarket.tvl)}</span>
            </div>
            <div>
              <strong>Live price</strong>
              <span>{coinPrices[selectedMarket.asset] ? `$${coinPrices[selectedMarket.asset].toFixed(4)}` : 'n/a'}</span>
            </div>
          </div>
          <p className="earn-market-detail-description">{selectedMarket.subtitle}</p>
        </div>
      )}

      <div className="earn-pagination card">
        <button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
          <ChevronLeft size={16} />
        </button>
        <div className="page-numbers">
          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              className={page === currentPage ? 'active' : ''}
              onClick={() => setPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
        <button type="button" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}
