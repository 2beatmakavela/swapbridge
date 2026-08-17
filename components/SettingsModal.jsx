'use client';

import { useState } from 'react';
import {
  X, ArrowLeft, Sliders, Fuel, ShieldAlert, EyeOff, Layers, RefreshCw, Check,
} from 'lucide-react';
import { routeOptions, gasOptions, slippageOptions } from '@/lib/data';

export default function SettingsModal({ settings, onClose, onChange }) {
  const [view, setView] = useState('main');

  function selectOption(key, value) {
    onChange({ ...settings, [key]: value });
    setView('main');
  }

  function toggleHideSmallBalances() {
    onChange({ ...settings, hideSmallBalances: !settings.hideSmallBalances });
  }

  function toggleChecklistItem(listKey, name) {
    const set = new Set(settings[listKey]);
    if (set.has(name)) set.delete(name); else set.add(name);
    onChange({ ...settings, [listKey]: set });
  }

  function toggleSelectAll(listKey) {
    const baseKey = listKey.replace('Enabled', '');
    const allItems = settings[baseKey];
    const current = settings[listKey];
    onChange({ ...settings, [listKey]: current.size === allItems.length ? new Set() : new Set(allItems) });
  }

  let title = 'Settings';
  let body = null;

  if (view === 'main') {
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={() => setView('route')} className="settings-row">
          <span className="settings-row-left"><span style={{ color: 'var(--purple)', display: 'inline-flex' }}><Sliders size={18} /></span> Route Priority</span>
          <span className="settings-row-value">{settings.routePriority} ›</span>
        </button>
        <button onClick={() => setView('gas')} className="settings-row">
          <span className="settings-row-left"><span style={{ color: 'var(--cyan)', display: 'inline-flex' }}><Fuel size={18} /></span> Gas Price</span>
          <span className="settings-row-value">{settings.gasPrice} ›</span>
        </button>
        <button onClick={() => setView('slippage')} className="settings-row">
          <span className="settings-row-left"><span style={{ color: 'var(--pink)', display: 'inline-flex' }}><ShieldAlert size={18} /></span> Max. Slippage</span>
          <span className="settings-row-value">{settings.slippage} ›</span>
        </button>
        <div className="settings-row" style={{ cursor: 'default' }}>
          <span className="settings-row-left"><span style={{ color: 'var(--text-dim)', display: 'inline-flex' }}><EyeOff size={18} /></span> Hide Small Balances</span>
          <div
            onClick={toggleHideSmallBalances}
            className={`settings-toggle ${settings.hideSmallBalances ? 'on' : ''}`}
          >
            <div className="settings-toggle-knob" />
          </div>
        </div>
        <button onClick={() => setView('bridges')} className="settings-row">
          <span className="settings-row-left"><span style={{ color: '#a855f7', display: 'inline-flex' }}><Layers size={18} /></span> Enabled Bridges</span>
          <span className="settings-row-value">{settings.bridgesEnabled.size}/{settings.bridges.length} ›</span>
        </button>
        <button onClick={() => setView('exchanges')} className="settings-row">
          <span className="settings-row-left"><span style={{ color: '#38bdf8', display: 'inline-flex' }}><RefreshCw size={18} /></span> Enabled Exchanges</span>
          <span className="settings-row-value">{settings.exchangesEnabled.size}/{settings.exchanges.length} ›</span>
        </button>
      </div>
    );
  } else if (view === 'route' || view === 'gas' || view === 'slippage') {
    const map = {
      route: { label: 'Route Priority', options: routeOptions, key: 'routePriority' },
      gas: { label: 'Gas Price', options: gasOptions, key: 'gasPrice' },
      slippage: { label: 'Max. Slippage', options: slippageOptions, key: 'slippage' },
    };
    const cfg = map[view];
    title = cfg.label;
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cfg.options.map((opt) => (
          <button key={opt} className="option-row" onClick={() => selectOption(cfg.key, opt)}>
            <span>{opt}</span>
            <span className={`option-dot ${settings[cfg.key] === opt ? 'selected' : ''}`} />
          </button>
        ))}
      </div>
    );
  } else if (view === 'bridges' || view === 'exchanges') {
    const listKey = view;
    const enabledKey = `${view}Enabled`;
    const items = settings[listKey];
    const enabledSet = settings[enabledKey];
    title = view === 'bridges' ? 'Bridges' : 'Exchanges';
    body = (
      <div>
        <div className="settings-list-header">
          <span>{enabledSet.size}/{items.length} selected</span>
          <button onClick={() => toggleSelectAll(enabledKey)} className="settings-select-all-btn">
            {enabledSet.size === items.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((name) => (
            <button key={name} onClick={() => toggleChecklistItem(enabledKey, name)} className="settings-row">
              <span>{name}</span>
              <div className={`settings-checkbox ${enabledSet.has(name) ? 'checked' : ''}`}>
                {enabledSet.has(name) && <Check size={14} />}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {view !== 'main' && (
              <button className="close-btn" onClick={() => setView('main')} aria-label="Back" style={{ marginRight: 4 }}>
                <ArrowLeft size={16} />
              </button>
            )}
            <h2>{title}</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="modal-body">{body}</div>
      </div>
    </div>
  );
}
