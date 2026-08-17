'use client';

import { useEffect, useState } from 'react';
import { Zap, Clock, ShieldCheck } from 'lucide-react';
import { estimatedDurationSeconds, routeGas } from '@/lib/format';

function LiveCountdown({ initialSeconds = 35 }) {
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

export default function RouteVisualizer({ fromToken, toToken, routes, routePriority }) {
  if (!fromToken || !toToken) return null;
  const mainRoute = routes?.[0] || null;
  const duration = estimatedDurationSeconds(routes);
  const countdownStart = Number.isFinite(duration) && duration > 0 ? duration : 35;
  const toAmount = mainRoute?.toAmount?.toLocaleString(undefined, {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }) || '0.00';
  const toUsd = mainRoute?.toAmountUsd?.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) || '0.00';

  return (
    <div className="route-visualizer-container">
      <div className="route-header">
        <div className="route-title"><Zap size={14} /><span>Optimal Route ({routePriority || 'Best Return'})</span></div>
        <span className="route-badge">100% Security Score</span>
      </div>

      <div className="route-summary-card">
        <div className="route-summary-badge">Best Return</div>
        <div className="route-summary-row">
          <div className="route-summary-left">
            <div className="route-summary-avatar">
              <img src={toToken.logo} alt={toToken.sym} className="route-summary-avatar-img" />
            </div>
            <div>
              <div className="route-summary-amount">{toAmount}</div>
              <div className="route-summary-sub">${toUsd} • {toToken.sym} on {toToken.name || 'Target Chain'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="route-flow">
        <div className="flow-step">
          <img src={fromToken.logo} alt={fromToken.sym} className="step-token-logo" />
          <div className="step-info"><span className="step-sym">{fromToken.sym}</span><span className="step-chain">{fromToken.name || 'Origin Chain'}</span></div>
        </div>
        <div className="flow-connector"><div className="connector-pulse" /><div className="connector-line" /></div>
        <div className="flow-step protocol-step">
          <div className="protocol-badge">{mainRoute ? mainRoute.engineName : 'LI.FI Direct'}</div>
        </div>
        <div className="flow-connector"><div className="connector-pulse" style={{ animationDelay: '0.9s' }} /><div className="connector-line" /></div>
        <div className="flow-step">
          <img src={toToken.logo} alt={toToken.sym} className="step-token-logo" />
          <div className="step-info"><span className="step-sym">{toToken.sym}</span><span className="step-chain">{toToken.name || 'Target Chain'}</span></div>
        </div>
      </div>

      <div className="route-details-card">
        <div className="route-detail-row">
          <span className="route-detail-label">Network cost</span>
          <span className="route-detail-value">&lt;$0.01</span>
        </div>
        <div className="route-detail-row">
          <span className="route-detail-label">Price impact</span>
          <span className="route-detail-value">-35.48%</span>
        </div>
        <div className="route-detail-row">
          <span className="route-detail-label">Max. slippage</span>
          <span className="route-detail-value">Auto</span>
        </div>
        <div className="route-detail-row">
          <span className="route-detail-label">Min. received</span>
          <span className="route-detail-value">{toAmount}</span>
        </div>
        <div className="route-detail-row">
          <span className="route-detail-label">Exchange rate</span>
          <span className="route-detail-value">1 SOL ≈ {toAmount} {toToken.sym}</span>
        </div>
        <div className="route-detail-row">
          <span className="route-detail-label">Estimated time</span>
          <span className="route-detail-value"><LiveCountdown initialSeconds={countdownStart} /></span>
        </div>
      </div>

      <div className="route-metrics">
        <div className="metric-item"><Clock size={12} /><span>Est. ~<LiveCountdown initialSeconds={countdownStart} /></span></div>
        <div className="metric-item"><ShieldCheck size={12} /><span>Slippage &lt; 0.5%</span></div>
        <div className="metric-item highlight"><span>Est. Gas ~{mainRoute ? routeGas(mainRoute) : '$0.01'}</span></div>
      </div>
    </div>
  );
}
