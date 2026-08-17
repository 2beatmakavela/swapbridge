'use client';

import { useEffect, useState } from 'react';
import { Settings, Sparkles, ChevronDown, ArrowDown, Fuel, Clock, AlertTriangle } from 'lucide-react';
import { gasOptions } from '@/lib/data';
import {
  receiveAmountFormatted, sendUsdValue, receiveUsdValue, exchangeRateStr,
  estimatedDurationSeconds, routeLabel, routeDuration, routeGas, routeRate, routeAmount,
} from '@/lib/format';
import RouteSourceTags from './RouteSourceTags';
import RouteVisualizer from './RouteVisualizer';

const PERCENTAGES = [25, 50, 75, 100];
const MOCK_BALANCE = 1000;

function CountdownPill({ initialSeconds = 35 }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);

    const intervalId = window.setInterval(() => {
      setSeconds((current) => (current <= 1 ? initialSeconds : current - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [initialSeconds]);

  return <span>{seconds}s</span>;
}

export default function SwapCard({
  fromToken, toToken, sendAmount, onSendAmountChange,
  onOpenTokenModal, onSwapDirection,
  selectedPercentage, onPercentageClick,
  quickView, settings, onSetGasPrice, onOpenSettings,
  routes, quoteLoading, showRoute, onToggleShowRoute,
  destinationWallet, onOpenSendToWallet,
  connectedLabel, onActionClick,
}) {
  const receiveAmount = receiveAmountFormatted(routes, fromToken, toToken, sendAmount);
  const duration = estimatedDurationSeconds(routes);
  const mainRoute = routes?.[0] || null;
  const additionalRoutes = routes && routes.length > 1 ? routes.slice(1) : [];
  const canQuote = Boolean(fromToken?.address && toToken?.address && parseFloat(sendAmount) > 0);
  const showLoadingCard = canQuote && quoteLoading && (!routes || routes.length === 0);

  if (quickView === 'gas') {
    return (
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><h1>Gas Settings</h1></div>
          <button className="icon-btn" onClick={onOpenSettings} aria-label="Settings"><Settings size={18} /></button>
        </div>
        <div className="gas-inline-list">
          {gasOptions.map((opt) => (
            <button key={opt} className="option-row" onClick={() => onSetGasPrice(opt)}>
              <span>{opt} Speed</span>
              <span className={`option-dot ${settings.gasPrice === opt ? 'selected' : ''}`} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1>Swap &amp; Bridge</h1>
          <span className="sparkle-pulse"><Sparkles size={16} /></span>
        </div>
        <button className="icon-btn" onClick={onOpenSettings} aria-label="Settings"><Settings size={18} /></button>
      </div>

      <div className="swap-boxes-container">
        <div className="swap-box send-box">
          <div className="swap-box-label">Send</div>
          <div className="swap-box-main">
            <div className="swap-amount-col">
              <input
                className="swap-big-input"
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={sendAmount}
                onChange={(e) => onSendAmountChange(e.target.value)}
              />
              <div className="swap-usd-line">${sendUsdValue(fromToken, sendAmount)} <span className="usd-toggle">↑↓</span></div>
            </div>
            <button className="token-select-pill" onClick={() => onOpenTokenModal('from')}>
              {fromToken ? (
                <>
                  <img className="pill-logo" src={fromToken.logo} alt={fromToken.sym} />
                  <span className="pill-sym">{fromToken.sym}</span>
                </>
              ) : <span className="pill-sym">Select Token</span>}
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="percentage-buttons">
            {PERCENTAGES.map((p) => (
              <button
                key={p}
                className={`percent-btn ${selectedPercentage === p ? 'active' : ''}`}
                onClick={() => onPercentageClick(p, MOCK_BALANCE)}
              >
                {p === 100 ? 'MAX' : `${p}%`}
              </button>
            ))}
          </div>
        </div>

        <div className="swap-direction-wrap">
          <button className="swap-direction-circle-btn" onClick={onSwapDirection} aria-label="Swap direction">
            <ArrowDown size={18} />
          </button>
        </div>

        <div className="swap-box receive-box">
          <div className="swap-box-label">Receive</div>
          <div className="swap-box-main">
            <div className="swap-amount-col">
              <div className="swap-big-number">{receiveAmount}</div>
              <div className="swap-usd-line">${receiveUsdValue(routes, fromToken, toToken, sendAmount)} <span className="usd-toggle">↑↓</span></div>
            </div>
            <button className="token-select-pill" onClick={() => onOpenTokenModal('to')}>
              {toToken ? (
                <>
                  <img className="pill-logo" src={toToken.logo} alt={toToken.sym} />
                  <span className="pill-sym">{toToken.sym}</span>
                </>
              ) : <span className="pill-sym">Select Token</span>}
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>

      {canQuote && (
        showLoadingCard ? (
          <div className="best-return-card">
            <div className="best-return-header">
              <span className="best-return-badge">{settings.routePriority || 'Best Return'}</span>
              <div className="loading-spinner-ring" />
            </div>
            <div style={{ padding: '8px 0', color: 'var(--text-dim)', fontSize: 13 }}>
              Checking swap &amp; bridge engines for the best rate… <CountdownPill initialSeconds={35} />
            </div>
          </div>
        ) : (
          <>
            {routes && routes.length > 0 && (
              <div className="engines-checked-line">
                Compared {routes.length} engine{routes.length === 1 ? '' : 's'} • showing {settings.routePriority || 'Best Return'}
              </div>
            )}

            <div className="best-return-card">
              <div className="best-return-header">
                <span className="best-return-badge">{settings.routePriority || 'Best Return'}</span>
                <div className="loading-spinner-ring" />
              </div>
              <div className="best-return-body">
                <div className="best-return-left">
                  <div className="best-return-avatar-wrap">
                    {toToken ? <img className="best-return-avatar" src={toToken.logo} alt={toToken.sym} /> : <div className="best-return-avatar-placeholder" />}
                  </div>
                  <div className="best-return-info">
                    <div className="best-return-amount-row"><span className="best-return-amount">{receiveAmount}</span></div>
                    <div className="best-return-sub">${receiveUsdValue(routes, fromToken, toToken, sendAmount)}</div>
                    <RouteSourceTags route={mainRoute} />
                  </div>
                </div>
                <button className="expand-chevron-btn" onClick={onToggleShowRoute}><ChevronDown size={16} /></button>
              </div>
              <div className="best-return-footer">
                <span className="rate-text">{exchangeRateStr(routes, fromToken, toToken, sendAmount)}</span>
                <div className="best-return-metrics">
                  <span className="metric-pill"><Fuel size={12} /> {mainRoute ? routeGas(mainRoute) : '$0.37'}</span>
                  <span className="metric-pill"><Clock size={12} /> <CountdownPill initialSeconds={duration || 35} /></span>
                </div>
              </div>
              <button className="show-all-pill-btn" onClick={onToggleShowRoute}>{showRoute ? 'Hide details' : 'Show all'}</button>
            </div>

            {showRoute && <RouteVisualizer fromToken={fromToken} toToken={toToken} routes={routes} routePriority={settings.routePriority} />}

            {additionalRoutes.map((route) => (
              <div className="best-return-card" style={{ marginTop: 12 }} key={route.engineId}>
                <div className="best-return-header">
                  <span className="best-return-badge">{routeLabel(route)}</span>
                  <div className="loading-spinner-ring" />
                </div>
                <div className="best-return-body">
                  <div className="best-return-left">
                    <div className="best-return-avatar-wrap">
                      {toToken ? <img className="best-return-avatar" src={toToken.logo} alt={toToken.sym} /> : <div className="best-return-avatar-placeholder" />}
                    </div>
                    <div className="best-return-info">
                      <div className="best-return-amount-row"><span className="best-return-amount">{routeAmount(route, routes, fromToken, toToken, sendAmount)}</span></div>
                      <div className="best-return-sub">{routeRate(route, fromToken, toToken, sendAmount)}</div>
                      <RouteSourceTags route={route} />
                    </div>
                  </div>
                  <button className="expand-chevron-btn" disabled><ChevronDown size={16} /></button>
                </div>
                <div className="best-return-footer">
                  <span className="rate-text">{routeRate(route, fromToken, toToken, sendAmount)}</span>
                  <div className="best-return-metrics">
                    <span className="metric-pill"><Fuel size={12} /> {routeGas(route)}</span>
                    <span className="metric-pill"><Clock size={12} /> <CountdownPill initialSeconds={route?.durationSec || duration || 35} /></span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )
      )}

      {toToken && (
        <div className="send-wallet-card" onClick={onOpenSendToWallet}>
          <div className="send-wallet-header">
            <span className="send-wallet-title">Send to wallet</span>
          </div>
          <div className="send-wallet-input-row">
            <div className="send-wallet-avatar-placeholder">
              <span className="sub-badge">
                <img className="sub-badge-icon" src={toToken.logo} alt={toToken.sym} />
              </span>
            </div>
            <input className="send-wallet-input" type="text" placeholder="Enter wallet address" value={destinationWallet || ''} readOnly />
          </div>
        </div>
      )}

      <div className="actions-single">
        <button className="main-action-btn" onClick={onActionClick}>
          {connectedLabel ? 'Execute Swap' : 'Connect wallet'}
        </button>
      </div>
    </div>
  );
}
