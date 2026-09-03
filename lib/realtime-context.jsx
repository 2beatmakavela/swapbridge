'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const RealtimeContext = createContext({});

export function RealtimeProvider({ children }) {
  const [coinPrices, setCoinPrices] = useState({});
  const [priceChange, setPriceChange] = useState({});
  const [marketData, setMarketData] = useState([]);
  const [missionProgress, setMissionProgress] = useState({});
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    change24h: 0,
    changePercent: 0,
  });
  const [chainStats, setChainStats] = useState({
    chainCount: 0,
    bridgeCount: 0,
    dexCount: 0,
  });
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);

  // Price data is populated by quote requests from the swap flow.
  const fetchPrices = useCallback(async () => {
    setLastUpdate(Date.now());
  }, []);

  // Real-time market updates
  const fetchMarkets = useCallback(async () => {
    try {
      const response = await fetch('/api/markets', {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
      }).catch(() => null);

      if (response?.ok) {
        const data = await response.json();
        if (data.markets) {
          setMarketData(data.markets);
        }
      }
    } catch (err) {
      console.error('Market fetch error:', err);
    }
  }, []);

  // Real-time portfolio updates
  const fetchPortfolioStats = useCallback(async () => {
    try {
      const response = await fetch('/api/portfolio', {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
      }).catch(() => null);

      if (response?.ok) {
        const data = await response.json();
        if (data.stats) {
          setPortfolioStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Portfolio fetch error:', err);
    }
  }, []);

  // Real-time mission progress
  const fetchMissionProgress = useCallback(async () => {
    try {
      const response = await fetch('/api/missions', {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
      }).catch(() => null);

      if (response?.ok) {
        const data = await response.json();
        if (data.progress) {
          setMissionProgress(data.progress);
        }
      }
    } catch (err) {
      console.error('Mission fetch error:', err);
    }
  }, []);

  // Real-time chain stats
  const fetchChainStats = useCallback(async () => {
    try {
      const response = await fetch('/api/stats', {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
      }).catch(() => null);

      if (response?.ok) {
        const data = await response.json();
        if (data.stats) {
          setChainStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  }, []);

  // Set up polling intervals
  useEffect(() => {
    // Initial fetch
    fetchPrices();
    fetchMarkets();
    fetchPortfolioStats();
    fetchMissionProgress();
    fetchChainStats();

    // Price updates every 5 seconds
    const priceInterval = setInterval(fetchPrices, 5000);

    // Market data updates every 10 seconds
    const marketInterval = setInterval(fetchMarkets, 10000);

    // Portfolio updates every 15 seconds
    const portfolioInterval = setInterval(fetchPortfolioStats, 15000);

    // Mission progress every 20 seconds
    const missionInterval = setInterval(fetchMissionProgress, 20000);

    // Chain stats every 30 seconds
    const chainInterval = setInterval(fetchChainStats, 30000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(marketInterval);
      clearInterval(portfolioInterval);
      clearInterval(missionInterval);
      clearInterval(chainInterval);
    };
  }, [fetchPrices, fetchMarkets, fetchPortfolioStats, fetchMissionProgress, fetchChainStats]);

  const value = {
    coinPrices,
    priceChange,
    marketData,
    missionProgress,
    portfolioStats,
    chainStats,
    lastUpdate,
    isLoading,
    refreshPrices: fetchPrices,
    refreshMarkets: fetchMarkets,
    refreshPortfolio: fetchPortfolioStats,
    refreshMissions: fetchMissionProgress,
    refreshStats: fetchChainStats,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtimeData() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtimeData must be used within RealtimeProvider');
  }
  return context;
}
