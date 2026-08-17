'use client';

import { ArrowUpDown, Fuel } from 'lucide-react';

export default function QuickToolbar({ quickView, onSwapDirection, onSetGasView }) {
  return (
    <div className="quick-toolbar">
      <button className={quickView === 'swap' ? 'active' : ''} onClick={onSwapDirection} aria-label="Swap direction">
        <ArrowUpDown size={18} />
      </button>
      <button className={quickView === 'gas' ? 'active' : ''} onClick={onSetGasView} aria-label="Gas price">
        <Fuel size={18} />
      </button>
    </div>
  );
}
