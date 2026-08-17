export const chains = [
  { id: 1,           name: "Ethereum",  color: "#627eea", logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628" },
  { id: 42161,       name: "Arbitrum",  color: "#28a0f0", logo: "https://assets.coingecko.com/coins/images/16621/large/arb.jpg?1696516053" },
  { id: 10,          name: "Optimism",  color: "#ff0420", logo: "https://assets.coingecko.com/coins/images/25244/large/op.jpg?1696524465" },
  { id: 8453,        name: "Base",      color: "#0052ff", logo: "https://assets.coingecko.com/coins/images/30167/large/base.jpg?1696546590" },
  { id: 137,         name: "Polygon",   color: "#8247e5", logo: "https://assets.coingecko.com/coins/images/12171/large/amatic.png?1696512035" },
  { id: 56,          name: "BNB Chain", color: "#f0b90b", logo: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1696503612" },
  { id: 43114,       name: "Avalanche", color: "#e84142", logo: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png?1696512369" },
  { id: 1151111081099710, name: "Solana", color: "#9945ff", logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png?1696505756" },
  { id: 195,          name: "Tron",    color: "#e60012", logo: "https://assets.coingecko.com/coins/images/1090/large/tron-logo.png?1547035066" },
  { id: 250,         name: "Fantom",    color: "#1969ff", logo: "https://assets.coingecko.com/coins/images/10570/large/fantom.png?1696510399" },
];

const rawTokens = [
  { id: "eth", sym: "ETH", name: "Ethereum", chain: 1, color: "#627eea", address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628" },
  { id: "usdc-eth", sym: "USDC", name: "USD Coin", chain: 1, color: "#2775ca", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1696506694" },
  { id: "usdt-eth", sym: "USDT", name: "Tether USD", chain: 1, color: "#26a17b", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png?1696503575" },
  { id: "dai-eth", sym: "DAI", name: "Dai Stablecoin", chain: 1, color: "#f4b731", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", logo: "https://assets.coingecko.com/coins/images/9956/large/4943.png?1696510136" },
  { id: "wbtc-eth", sym: "WBTC", name: "Wrapped Bitcoin", chain: 1, color: "#f09242", address: "0x2260FAC5E5542a773Aa44fBCfeDd86b1604908fe", logo: "https://assets.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1696507857" },

  { id: "arb", sym: "ARB", name: "Arbitrum", chain: 42161, color: "#28a0f0", address: "0x912CE59144191c1204E64559FE8253a0e108A351", logo: "https://assets.coingecko.com/coins/images/16621/large/arb.jpg?1696516053" },
  { id: "usdc-arb", sym: "USDC", name: "USD Coin", chain: 42161, color: "#2775ca", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1696506694" },
  { id: "gmx", sym: "GMX", name: "GMX", chain: 42161, color: "#3a90da", address: "0xfc5A1A6EB076a2C7aD06eD22C90d3E710233C904", logo: "https://assets.coingecko.com/coins/images/18323/large/gmx.png?1696518405" },

  { id: "op", sym: "OP", name: "Optimism", chain: 10, color: "#ff0420", address: "0x4200000000000000000000000000000000000042", logo: "https://assets.coingecko.com/coins/images/25244/large/op.jpg?1696524465" },
  { id: "usdc-op", sym: "USDC", name: "USD Coin", chain: 10, color: "#2775ca", address: "0x0b2C02F4eBc3D88f4B961da5e6C4Ec1523C4b18f", logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1696506694" },

  { id: "eth-base", sym: "ETH", name: "Ethereum", chain: 8453, color: "#627eea", address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628" },
  { id: "usdc-base", sym: "USDC", name: "USD Coin", chain: 8453, color: "#2775ca", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1696506694" },

  { id: "matic", sym: "MATIC", name: "Polygon", chain: 137, color: "#8247e5", address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", logo: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1696503720" },
  { id: "usdc-pol", sym: "USDC", name: "USD Coin", chain: 137, color: "#2775ca", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1696506694" },

  { id: "bnb", sym: "BNB", name: "BNB", chain: 56, color: "#f0b90b", address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", logo: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1696503612" },
  { id: "usdt-bsc", sym: "USDT", name: "Tether USD", chain: 56, color: "#26a17b", address: "0x55d398326f99059fF775485246999027B3197955", logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png?1696503575" },

  { id: "avax", sym: "AVAX", name: "Avalanche", chain: 43114, color: "#e84142", address: "0xEeeeeEeeeEeEeeEeEeEeeEEUeeeeEeeeeeeeEEeE", logo: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png?1696512369" },
  { id: "wsol", sym: "wSOL", name: "Wrapped SOL", chain: 1151111081099710, color: "#9945ff", address: "So11111111111111111111111111111111111111112", logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png?1696505756" },
  { id: "sol", sym: "SOL", name: "Solana", chain: 1151111081099710, color: "#9945ff", address: "SOL", logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png?1696505756" },
  { id: "usdt-sol", sym: "USDT", name: "Tether USD", chain: 1151111081099710, color: "#26a17b", address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png?1696503575" },
  { id: "usdt-tron", sym: "USDT", name: "Tether USD", chain: 195, color: "#26a17b", address: "0xa614f803B6FD780986A42c78Ec9c7f77e6DeD13C", logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png?1696503575" },
  { id: "ftm", sym: "FTM", name: "Fantom", chain: 250, color: "#1969ff", address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", logo: "https://assets.coingecko.com/coins/images/10570/large/fantom.png?1696510399" },

  // --- Meme coins ---------------------------------------------------
  // Ethereum
  { id: "shib-eth", sym: "SHIB", name: "Shiba Inu", chain: 1, color: "#f00500", address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", logo: "https://assets.coingecko.com/coins/images/11939/large/shiba.png?1622619446", tag: "MEME" },
  { id: "pepe-eth", sym: "PEPE", name: "Pepe", chain: 1, color: "#4caf50", address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933", logo: "https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg?1682922725", tag: "MEME" },
  { id: "floki-eth", sym: "FLOKI", name: "FLOKI", chain: 1, color: "#f0a022", address: "0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E", logo: "https://assets.coingecko.com/coins/images/16746/large/PNG_image.png?1643184642", tag: "MEME" },
  { id: "mog-eth", sym: "MOG", name: "Mog Coin", chain: 1, color: "#89b8f5", address: "0xaaeE1A9723aaDB7afA2810263653A34bA2C21C7a", logo: "https://assets.coingecko.com/coins/images/31059/large/mog.jpg?1696529903", tag: "MEME" },
  { id: "turbo-eth", sym: "TURBO", name: "Turbo", chain: 1, color: "#5865f2", address: "0xA35923162C49cF95e6BF26623385eb431ad920D3", logo: "https://assets.coingecko.com/coins/images/30117/large/turbo.png?1696529014", tag: "MEME" },

  // Base
  { id: "brett-base", sym: "BRETT", name: "Brett", chain: 8453, color: "#0052ff", address: "0x532f27101965dd16442E59d40670FaF5eBB142E7", logo: "https://assets.coingecko.com/coins/images/35529/large/1000050750.png?1709427706", tag: "MEME" },
  { id: "degen-base", sym: "DEGEN", name: "Degen", chain: 8453, color: "#a36efd", address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", logo: "https://assets.coingecko.com/coins/images/34515/large/android-chrome-512x512.png?1706527543", tag: "MEME" },
  { id: "toshi-base", sym: "TOSHI", name: "Toshi", chain: 8453, color: "#0052ff", address: "0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4", logo: "https://assets.coingecko.com/coins/images/31126/large/Toshi_logo_-_bino_%281%29.png?1696529963", tag: "MEME" },

  // BNB Chain
  { id: "babydoge-bsc", sym: "BabyDoge", name: "Baby Doge Coin", chain: 56, color: "#f0b90b", address: "0xc748673057861a797275CD8A068AbB95A902e8de", logo: "https://assets.coingecko.com/coins/images/16125/large/babydoge.jpg?1625231519", tag: "MEME" },

  // Solana
  { id: "bonk-sol", sym: "BONK", name: "Bonk", chain: 1151111081099710, color: "#f2a900", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", logo: "https://assets.coingecko.com/coins/images/28600/large/bonk.jpg?1696527587", decimals: 5, tag: "MEME" },
  { id: "wif-sol", sym: "WIF", name: "dogwifhat", chain: 1151111081099710, color: "#cc9966", address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", logo: "https://assets.coingecko.com/coins/images/33566/large/dogwifhat.jpg?1702499428", decimals: 6, tag: "MEME" },
  { id: "popcat-sol", sym: "POPCAT", name: "Popcat", chain: 1151111081099710, color: "#f5c400", address: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", logo: "https://assets.coingecko.com/coins/images/33760/large/popcat.jpg?1702990931", decimals: 9, tag: "MEME" },
  { id: "trump-sol", sym: "TRUMP", name: "Official Trump", chain: 1151111081099710, color: "#ffd700", address: "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN", logo: "https://assets.coingecko.com/coins/images/53746/large/trump.png?1737777357", decimals: 6, tag: "MEME" },
];

const defaultDecimals = (sym) => {
  if (['USDC', 'USDT'].includes(sym)) return 6;
  if (sym === 'WBTC') return 8;
  if (sym === 'wSOL' || sym === 'SOL') return 9;
  return 18;
};

export const tokens = rawTokens.map((t) => ({
  ...t,
  chainId: t.chain,
  decimals: t.decimals ?? defaultDecimals(t.sym),
}));

export const mockPrice = {
  ETH:3200, USDC:1, USDT:1, DAI:1, WBTC:64000, MKR:1800, ARB:0.9,
  GMX:32, OP:1.6, VELO:0.08, AERO:1.1, MATIC:0.55, BNB:560,
  AVAX:28, SOL:145, wSOL:145, FTM:0.6,
  // Meme coins
  SHIB:0.000018, PEPE:0.0000091, FLOKI:0.00012, MOG:0.0000016, TURBO:0.0045,
  BRETT:0.06, DEGEN:0.008, TOSHI:0.00025, BabyDoge:0.0000000016,
  BONK:0.000022, WIF:1.1, POPCAT:0.55, TRUMP:12,
};

export const routeOptions = ["Best Return", "Fastest", "Safest", "Lowest Gas"];
export const gasOptions = ["Slow", "Normal", "Fast"];
export const slippageOptions = ["Auto", "0.1%", "0.5%", "1%"];

export const defaultBridges = [
  "Across", "Stargate", "Celer", "Mayan", "Chainflip", "Relay",
];

export const defaultExchanges = [
  "Uniswap", "PancakeSwap", "Raydium", "Orca", "Aerodrome", "Camelot", "Trader Joe", "SushiSwap",
];

// Placeholder connector list — wire each `id` up to your real
// wallet connector (wagmi/ethers/viem/WalletConnect) implementation.
export const walletConnectors = [
  { id: "injected",      label: "MetaMask", icon: "/icons/metamask.svg" },
  { id: "coinbase",      label: "Coinbase Wallet", icon: "/icons/coinbase.svg" },
  { id: "walletConnect", label: "WalletConnect", badge: "QR CODE", icon: "/icons/walletConnect.svg" },
  { id: "trustWallet",   label: "Trust Wallet", icon: "/icons/trust_wallet-.svg" },
  // { id: "frame",         label: "Frame Wallet", icon: "/icons/framemint.webp" },
  // { id: "imtoken",       label: "imToken Wallet", icon: "/icons/imtoken.png" },
  // { id: "backpack",      label: "Backpack Wallet", icon: "/icons/backpack-Symbol.svg" },
  // { id: "uniswap",       label: "Uniswap Wallet", icon: "/icons/uniswap-uni-icon.svg" },
  // { id: "zerion",        label: "Zerion", icon: "/icons/Zerion.log.png" },
  // { id: "safe",          label: "Safe Wallet", icon: "/icons/safe_log.jpeg" },
  { id: "trezor",        label: "Trezor Wallet", icon: "/icons/trezor.png" },
  { id: "ledger",        label: "Ledger Wallet", icon: "/icons/ledger.png" },
  { id: "non-web3",      label: "Non-web3 wallets", icon: "/icons/non-web3-wallets.png" },
];

// Larger mock list for the "All Wallets" search panel.
export const allWalletsList = [
  "MetaMask","Coinbase Wallet","WalletConnect","Trust Wallet","Uniswap Wallet",
  "Trezor","Ledger","Non-web3 wallets","Rainbow","Argent","Zerion","Rabby",
  "Phantom","Backpack","Frame","Safe","imToken","TokenPocket","MathWallet","OKX Wallet","Bitget Wallet","Exodus","Brave Wallet","Opera Wallet",
  "Coin98","XDEFI","Zengo","Fireblocks","Gnosis Safe","1inch Wallet","Blocto","Ambire",
];
