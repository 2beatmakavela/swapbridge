import { mockPrice } from '@/lib/data';

export function receiveAmountMock(fromToken, toToken, sendAmount) {
  if (!fromToken || !toToken || !sendAmount) return '0.00';
  const fromPrice = mockPrice[fromToken.sym] || 0;
  const toPrice = mockPrice[toToken.sym] || 0;
  if (toPrice === 0) return '0.00';
  const amt = (parseFloat(sendAmount) || 0) * fromPrice / toPrice;
  return amt.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

export function receiveAmountFormatted(routes, fromToken, toToken, sendAmount) {
  const best = routes?.[0];
  if (best) return best.toAmount.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  return receiveAmountMock(fromToken, toToken, sendAmount);
}

export function sendUsdValue(fromToken, sendAmount) {
  if (!fromToken) return '0.00';
  const amt = parseFloat(sendAmount) || 0;
  const price = mockPrice[fromToken.sym] || 0;
  return (amt * price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function receiveUsdValue(routes, fromToken, toToken, sendAmount) {
  if (!toToken) return '0.00';
  const best = routes?.[0];
  if (best) return best.toAmountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const amt = parseFloat(receiveAmountMock(fromToken, toToken, sendAmount)) || 0;
  const price = mockPrice[toToken.sym] || 0;
  return (amt * price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function exchangeRateStr(routes, fromToken, toToken, sendAmount) {
  const receiveAmount = receiveAmountFormatted(routes, fromToken, toToken, sendAmount);
  if (!fromToken || !toToken || !sendAmount || !receiveAmount) return '1 USDC \u2248 0.013233 wSOL';
  const rate = parseFloat(receiveAmount) / (parseFloat(sendAmount) || 1);
  return `1 ${fromToken.sym} \u2248 ${rate.toFixed(6)} ${toToken.sym}`;
}

export function estimatedDurationSeconds(routes) {
  return routes?.[0]?.durationSec ?? null;
}

export function routeLabel(route) {
  return route?.engineName || 'Alternative';
}
export function routeDuration(route) {
  const num = route?.durationSec;
  return Number.isFinite(num) && num > 0 ? `${Math.round(num)}s` : '\u2014';
}
export function routeGas(route) {
  const num = route?.gasUsd;
  return Number.isFinite(num) && num >= 0 ? `$${num.toFixed(2)}` : '$0.00';
}
export function routeRate(route, fromToken, toToken, sendAmount) {
  if (!fromToken || !toToken) return `1 ${fromToken?.sym || 'FROM'} \u2248 0 ${toToken?.sym || 'TO'}`;
  const toAmt = route?.toAmount;
  const fromAmt = parseFloat(sendAmount) || 1;
  if (!toAmt || !fromAmt) return `1 ${fromToken.sym} \u2248 0 ${toToken.sym}`;
  const rate = toAmt / fromAmt;
  return `1 ${fromToken.sym} \u2248 ${rate.toFixed(6)} ${toToken.sym}`;
}
export function routeAmount(route, routes, fromToken, toToken, sendAmount) {
  const amount = route?.toAmount;
  return Number.isFinite(amount) && toToken
    ? amount.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })
    : receiveAmountFormatted(routes, fromToken, toToken, sendAmount);
}
