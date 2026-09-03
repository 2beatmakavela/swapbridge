'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, RefreshCw, Settings, Zap } from 'lucide-react';

const CHAINS = [
  'Ethereum', 'Arbitrum', 'Optimism', 'Base', 'Polygon', 'Solana', 'zkSync',
  'Linea', 'Mode', 'Lisk', 'Zora', 'World Chain', 'Ink', 'Soneium', 'Unichain',
  'BNB Chain', 'HyperEVM', 'Plasma', 'Monad', 'MegaETH', 'Tron', 'Avalanche',
];

const DOT_CLASSES = [
  'bg-sky-400', 'bg-rose-400', 'bg-violet-400', 'bg-emerald-400', 'bg-amber-400',
  'bg-cyan-400', 'bg-fuchsia-400', 'bg-lime-400', 'bg-indigo-400', 'bg-orange-400',
];
const STROKE_CLASSES = [
  'stroke-sky-400', 'stroke-rose-400', 'stroke-violet-400', 'stroke-emerald-400', 'stroke-amber-400',
  'stroke-cyan-400', 'stroke-fuchsia-400', 'stroke-lime-400', 'stroke-indigo-400', 'stroke-orange-400',
];

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return hash % STROKE_CLASSES.length;
}

function formatCompact(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}
function formatUsd(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return '$' + formatCompact(n);
}

const FOOTER_COLUMNS = {
  Product: [
    ['Swap', '/'],
    ['Bridge', '#boltswap-chains'],
    ['Portfolio', '/portfolio'],
    ['Rewards', '/missions'],
    ['Docs', '/API_TESTING.md'],
  ],
  Company: [
    ['Careers', 'mailto:careers@boltswap.com'],
    ['Blog', '#'],
    ['Press', 'mailto:press@boltswap.com'],
    ['Support', 'mailto:support@boltswap.com'],
  ],
  Social: [
    ['X', 'https://x.com/boltswap'],
    ['Discord', 'https://discord.com'],
  ],
  'Popular routes': [
    ['Bridge to Ethereum', '#boltswap-chains'],
    ['Bridge to Solana', '#boltswap-chains'],
    ['Bridge to Base', '#boltswap-chains'],
    ['Bridge to Arbitrum', '#boltswap-chains'],
    ['Bridge to Optimism', '#boltswap-chains'],
  ],
};

const RANGES = ['Today', 'Last 7 days', 'Last 30 days', 'Last 3 months', 'All time'];

const FALLBACK_FLOWS = [
  { name: 'Across', from: 'Ethereum', to: 'Base', volume: 18400000 },
  { name: 'Stargate', from: 'Ethereum', to: 'Arbitrum', volume: 14200000 },
  { name: 'Celer', from: 'BNB Chain', to: 'Ethereum', volume: 9800000 },
  { name: 'Mayan', from: 'Solana', to: 'Ethereum', volume: 7600000 },
  { name: 'Chainflip', from: 'Ethereum', to: 'Avalanche', volume: 5300000 },
  { name: 'Across', from: 'Base', to: 'Optimism', volume: 4100000 },
];

function useLiveBridgeData(refreshMs = 90000) {
  const [state, setState] = useState({ status: 'loading', flows: [], chainCount: null, bridgeCount: null, volume24h: null, updatedAt: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: s.flows.length ? 'refreshing' : 'loading' }));
    try {
      const response = await fetch('/api/bridge-stats');
      if (!response.ok) throw new Error('live bridge stats request failed');
      const data = await response.json();

      setState({
        status: 'ready',
        flows: data.flows || [],
        chainCount: data.chains,
        bridgeCount: data.bridges,
        volume24h: data.volume24h,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      });
    } catch (err) {
      setState({
        status: 'fallback',
        flows: FALLBACK_FLOWS,
        chainCount: 22,
        bridgeCount: 6,
        volume24h: FALLBACK_FLOWS.reduce((sum, flow) => sum + flow.volume, 0),
        updatedAt: new Date(),
      });
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, refreshMs);
    return () => clearInterval(id);
  }, [load, refreshMs]);

  return { ...state, reload: load };
}

function SecondsAgo({ date }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  if (!date) return null;
  const secs = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  return <span>{secs < 60 ? `${secs}s ago` : `${Math.round(secs / 60)}m ago`}</span>;
}

function MovingFlow({ d, className, strokeWidth, opacity, delay = 0 }) {
  return (
    <path
      d={d}
      fill="none"
      className={className}
      stroke="white"
      strokeOpacity={opacity}
      strokeWidth={Math.max(1.5, strokeWidth * 0.28)}
      strokeDasharray="3 28"
      strokeLinecap="round"
    >
      <animate
        attributeName="stroke-dashoffset"
        from="0"
        to="-31"
        dur="1.8s"
        begin={`${delay}s`}
        repeatCount="indefinite"
      />
    </path>
  );
}

function FlowDiagram({ flows }) {
  const width = 1000;
  const height = Math.max(460, Math.max(
    new Set(flows.map((flow) => flow.from)).size,
    new Set(flows.map((flow) => flow.to)).size,
  ) * 34 + 60);
  const padY = 30;

  const leftChains = useMemo(() => [...new Set([...CHAINS, ...flows.map((f) => f.from)])], [flows]);
  const rightChains = useMemo(() => [...new Set([...CHAINS, ...flows.map((f) => f.to)])], [flows]);
  const connectorFlows = useMemo(() => leftChains.map((from, index) => ({
    from,
    to: rightChains[(index * 7 + 5) % rightChains.length],
  })), [leftChains, rightChains]);

  const yFor = (arr, name) => {
    const i = arr.indexOf(name);
    if (arr.length <= 1) return height / 2;
    return padY + (i * (height - padY * 2)) / (arr.length - 1);
  };

  const maxVol = Math.max(...flows.map((f) => f.volume), 1);

  return (
    <div className="grid grid-cols-[minmax(0,120px)_1fr_minmax(0,120px)] gap-4 items-stretch">
      <div className="flex flex-col justify-between py-2">
        {leftChains.map((c) => (
          <div key={c} className="flex items-center gap-2 text-sm text-neutral-400">
            <span className={`h-2.5 w-2.5 rounded-full ${DOT_CLASSES[colorFor(c)]}`} />
            <span className="truncate">{c}</span>
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: `${height}px` }} preserveAspectRatio="none">
        {connectorFlows.map((f, i) => {
          const y1 = yFor(leftChains, f.from);
          const y2 = yFor(rightChains, f.to);
          const x1 = 8;
          const x2 = width - 8;
          const midX = width / 2;
          const curveOffset = 70 + (i % 4) * 24;
          const curveDirection = i % 2 === 0 ? 1 : -1;
          return (
            <g key={`connector-${f.from}-${i}`}>
              <path
                d={`M ${x1},${y1} C ${midX - 80},${y1 + curveOffset * curveDirection} ${midX + 80},${y2 - curveOffset * curveDirection} ${x2},${y2}`}
                fill="none"
                className={STROKE_CLASSES[colorFor(f.from)]}
                strokeOpacity={0.35}
                strokeWidth={2}
                strokeLinecap="round"
              />
              <MovingFlow
                d={`M ${x1},${y1} C ${midX - 80},${y1 + curveOffset * curveDirection} ${midX + 80},${y2 - curveOffset * curveDirection} ${x2},${y2}`}
                className={STROKE_CLASSES[colorFor(f.from)]}
                strokeWidth={3}
                opacity={0.8}
                delay={(i % 6) * 0.18}
              />
            </g>
          );
        })}
        {flows.map((f, i) => {
          const y1 = yFor(leftChains, f.from);
          const y2 = yFor(rightChains, f.to);
          const x1 = 8;
          const x2 = width - 8;
          const midX = width / 2;
          const strokeWidth = 1.5 + (f.volume / maxVol) * 12;
          return (
            <g key={`${f.name}-${i}`}>
              <path
                d={`M ${x1},${y1} C ${midX},${y1} ${midX},${y2} ${x2},${y2}`}
                fill="none"
                className={STROKE_CLASSES[colorFor(f.from)]}
                strokeOpacity={0.5}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              <MovingFlow
                d={`M ${x1},${y1} C ${midX},${y1} ${midX},${y2} ${x2},${y2}`}
                className={STROKE_CLASSES[colorFor(f.from)]}
                strokeWidth={strokeWidth}
                opacity={0.95}
                delay={(i % 8) * 0.14}
              />
            </g>
          );
        })}
      </svg>

      <div className="flex flex-col justify-between py-2 text-right">
        {rightChains.map((c) => (
          <div key={c} className="flex items-center justify-end gap-2 text-sm text-neutral-400">
            <span className="truncate">{c}</span>
            <span className={`h-2.5 w-2.5 rounded-full ${DOT_CLASSES[colorFor(c)]}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BoltswapLanding() {
  const live = useLiveBridgeData();
  const [activeRange, setActiveRange] = useState('All time');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (!event.currentTarget.checkValidity()) return;
    setSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
        .font-serif-display { font-family: 'Instrument Serif', Georgia, serif; }
        .font-sans-display { font-family: 'Inter', system-ui, sans-serif; }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .live-dot { animation: pulse-dot 1.8s ease-in-out infinite; }
      `}</style>

      <header className="border-b border-white/6 bg-[#080b18]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 no-underline" aria-label="BoltSwap home">
            <img
              src="/icons/apple-touch-icon-180x180.png"
              alt="BoltSwap logo"
              className="h-8 w-8 rounded-[10px] object-contain"
            />
            <span className="text-base font-black tracking-widest text-white">BOLTSWAP</span>
          </Link>
          <Link
            href="/app"
            className="rounded-full bg-linear-to-r from-violet-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-lg shadow-violet-500/25 transition-transform hover:-translate-y-0.5"
          >
            Launch app
          </Link>
        </div>
      </header>

      <main className="font-sans-display">
        {/* HERO */}
        <section className="relative px-6 pt-24 pb-28 overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-140 flex justify-center">
            <div className="w-180 h-140 rounded-full bg-violet-700/30 blur-3xl" />
          </div>

          <div className="relative max-w-md mx-auto rounded-3xl border border-neutral-800 bg-neutral-950/80 backdrop-blur p-6 shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-1 rounded-full bg-neutral-900 p-1">
                <button type="button" className="rounded-full bg-neutral-700 px-3 py-1.5 text-sm font-semibold text-white">
                  Swap &amp; Bridge
                </button>
                <button type="button" className="px-3 py-1.5 text-sm font-medium text-neutral-500">Private</button>
                <button type="button" className="px-3 py-1.5 text-sm font-medium text-neutral-500">Gas</button>
              </div>
              <button type="button" aria-label="Settings" className="h-8 w-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
                <Settings className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-3 mb-10">
              <div className="flex-1 rounded-2xl bg-neutral-900 p-4">
                <span className="text-sm text-neutral-500">Send</span>
              </div>
              <div className="flex-1 rounded-2xl bg-neutral-900 p-4">
                <span className="text-sm text-neutral-500">Receive</span>
              </div>
            </div>

            <h1 className="text-5xl leading-tight font-bold tracking-tight mb-3">
              Find the{' '}
              <span className="bg-linear-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">best route</span>
            </h1>
            <p className="text-neutral-400 mb-8">4x audited multi-chain liquidity aggregator</p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="rounded-2xl bg-neutral-900 p-4 text-center">
                <div className="text-2xl font-bold text-violet-200">{live.chainCount ? formatCompact(live.chainCount) : '—'}</div>
                <div className="text-sm text-neutral-500 mt-1">Chains</div>
              </div>
              <div className="rounded-2xl bg-neutral-900 p-4 text-center">
                <div className="text-2xl font-bold text-violet-200">{live.bridgeCount ?? '—'}</div>
                <div className="text-sm text-neutral-500 mt-1">Bridges</div>
              </div>
              <div className="rounded-2xl bg-neutral-900 p-4 text-center">
                <div className="text-2xl font-bold text-violet-200">{formatUsd(live.volume24h)}</div>
                <div className="text-sm text-neutral-500 mt-1">24h volume</div>
              </div>
            </div>

            <Link
              href="/app"
              className="block w-full rounded-full bg-violet-600 py-3.5 text-center font-semibold text-white no-underline transition-colors hover:bg-violet-500"
            >
              Get started
            </Link>
          </div>
        </section>

        {/* SUPPORTED CHAINS */}
        <section id="boltswap-chains" className="px-6 py-20 max-w-5xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-8 mb-14">
            <div>
              <div className="text-xs tracking-widest text-neutral-500 mb-3">THE BOLTSWAP ECOSYSTEM</div>
              <h2 className="font-serif-display text-6xl">Supported Chains</h2>
            </div>
            <p className="text-neutral-400 max-w-sm">
              Bridge tokens across Ethereum, Base, Solana, BNB Chain, and a growing list of supported networks.
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-6 gap-y-10">
            {CHAINS.map((chain) => (
              <div key={chain} className="flex flex-col items-center gap-3 text-center">
                <div className="h-14 w-14 rounded-2xl border border-neutral-800 bg-neutral-900 flex items-center justify-center text-lg font-semibold text-neutral-400">
                  {chain.slice(0, 1)}
                </div>
                <span className="text-xs tracking-wide text-neutral-500">{chain.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </section>

        {/* LIVE FLOWS */}
        <section className="px-6 py-20 max-w-5xl mx-auto">
          <h2 className="font-serif-display text-6xl text-center text-orange-200 mb-10">Real-time flows</h2>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setActiveRange(r)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  activeRange === r
                    ? 'border-neutral-700 bg-neutral-800 text-white'
                    : 'border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
            <button
              type="button"
              onClick={live.reload}
              aria-label="Refresh"
              className="h-9 w-9 flex items-center justify-center rounded-full border border-neutral-800 hover:bg-neutral-800 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${live.status === 'refreshing' || live.status === 'loading' ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between text-sm text-neutral-500 mb-2 px-1">
            <span className="flex items-center gap-2 text-neutral-300 font-medium">From</span>
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${live.status === 'fallback' ? 'bg-amber-400' : 'bg-emerald-400 live-dot'}`} />
              {live.status === 'fallback' ? 'Fallback data' : 'Live'} {live.updatedAt && <SecondsAgo date={live.updatedAt} />}
            </span>
            <span className="text-neutral-300 font-medium">To</span>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6">
            {live.status === 'loading' && <div className="py-16 text-center text-neutral-500">Loading live flows…</div>}
            {live.flows.length > 0 && <FlowDiagram flows={live.flows} />}
          </div>
          <p className="text-center text-xs text-neutral-600 mt-4">Live bridge volume via DeFiLlama, with fallback data when unavailable.</p>
        </section>

        {/* FOOTER */}
        <footer className="px-6 pt-16 pb-10 border-t border-neutral-900">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-between gap-10 mb-12">
              <div className="max-w-xs">
                <div className="flex items-center gap-2 mb-6">
                  <Zap className="h-6 w-6 text-teal-400" fill="currentColor" />
                  <span className="font-semibold tracking-widest text-lg text-teal-400">BOLTSWAP</span>
                </div>
                <label className="block text-sm text-neutral-400 mb-3">Get the latest from Boltswap.</label>
                <form className="flex gap-2" onSubmit={handleSubscribe}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setSubscribed(false);
                    }}
                    required
                    aria-label="Email address"
                    className="flex-1 min-w-0 rounded-full bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                  <button
                    type="submit"
                    aria-label="Submit"
                    className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
                {subscribed && <p className="mt-2 text-xs text-emerald-400" role="status">You&apos;re on the list.</p>}
              </div>

              <div className="flex flex-wrap gap-12">
                {Object.entries(FOOTER_COLUMNS).map(([title, items]) => (
                  <div key={title}>
                    <h4 className="text-xs tracking-widest text-neutral-500 mb-4">{title.toUpperCase()}</h4>
                    <ul className="list-none m-0 p-0 space-y-2.5">
                      {items.map(([item, href]) => (
                        <li key={item}>
                          <a
                            href={href}
                            target={href.startsWith('http') ? '_blank' : undefined}
                            rel={href.startsWith('http') ? 'noreferrer' : undefined}
                            className="text-sm font-medium text-neutral-200 no-underline hover:text-white transition-colors"
                          >
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-neutral-900 text-sm text-neutral-500">
              <span>© 2026 — BOLTSWAP PROTOCOL</span>
              <div className="flex gap-6">
                <a href="/SECURITY.md" className="text-sm text-neutral-500 no-underline hover:text-neutral-300 transition-colors">PRIVACY POLICY</a>
                <a href="/SECURITY.md" className="text-sm text-neutral-500 no-underline hover:text-neutral-300 transition-colors">TERMS OF SERVICE</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
