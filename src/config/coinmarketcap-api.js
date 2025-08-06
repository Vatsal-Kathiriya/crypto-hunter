// CoinMarketCap API Configuration
// Note: CoinMarketCap API has CORS restrictions and typically requires a backend proxy
// For development, we'll implement graceful fallback to CoinGecko

const CMC_API_KEY = '66d7706e-9368-4690-8f6e-483f97608bc5'; // Your provided API key
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

// For production, you should implement a backend proxy to avoid CORS issues
// Example backend endpoint: '/api/coinmarketcap/listings'

// Headers for CoinMarketCap API
export const getHeaders = () => ({
  'X-CMC_PRO_API_KEY': CMC_API_KEY,
  'Accept': 'application/json',
  'Content-Type': 'application/json',
});

// Get list of cryptocurrencies with market data
export const CoinListCMC = (currency = 'USD', limit = 100) => ({
  url: `${BASE_URL}/cryptocurrency/listings/latest`,
  params: {
    start: 1,
    limit: limit,
    convert: currency,
    sort: 'market_cap',
    sort_dir: 'desc',
  },
  headers: getHeaders(),
});

// Get specific cryptocurrency data
export const SingleCoinCMC = (id, currency = 'USD') => ({
  url: `${BASE_URL}/cryptocurrency/quotes/latest`,
  params: {
    id: id,
    convert: currency,
  },
  headers: getHeaders(),
});

// Get cryptocurrency metadata
export const CoinMetadataCMC = (id) => ({
  url: `${BASE_URL}/cryptocurrency/info`,
  params: {
    id: id,
  },
  headers: getHeaders(),
});

// Get trending cryptocurrencies (top gainers)
export const TrendingCoinsCMC = (currency = 'USD', limit = 10) => ({
  url: `${BASE_URL}/cryptocurrency/trending/gainers-losers`,
  params: {
    start: 1,
    limit: limit,
    convert: currency,
    time_period: '24h',
  },
  headers: getHeaders(),
});

// Get historical data (OHLCV)
export const HistoricalChartCMC = (id, currency = 'USD', timeStart, timeEnd) => ({
  url: `${BASE_URL}/cryptocurrency/quotes/historical`,
  params: {
    id: id,
    convert: currency,
    time_start: timeStart,
    time_end: timeEnd,
    interval: '1d',
  },
  headers: getHeaders(),
});

// Currency symbols mapping
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  CNY: '¥',
  SEK: 'kr',
  NZD: 'NZ$',
};

// Convert CoinGecko format to CoinMarketCap format
export const convertCMCToCoinGeckoFormat = (cmcData) => {
  if (!cmcData || !cmcData.data) return [];
  
  return cmcData.data.map(coin => ({
    id: coin.id.toString(),
    symbol: coin.symbol.toLowerCase(),
    name: coin.name,
    image: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
    current_price: coin.quote.USD?.price || 0,
    market_cap: coin.quote.USD?.market_cap || 0,
    market_cap_rank: coin.cmc_rank || 0,
    price_change_percentage_24h: coin.quote.USD?.percent_change_24h || 0,
    total_volume: coin.quote.USD?.volume_24h || 0,
    last_updated: coin.last_updated,
  }));
};

// Convert single coin data
export const convertSingleCoinCMC = (cmcData, metadata = null) => {
  if (!cmcData || !cmcData.data) return null;
  
  const coinId = Object.keys(cmcData.data)[0];
  const coin = cmcData.data[coinId];
  
  return {
    id: coin.id.toString(),
    symbol: coin.symbol.toLowerCase(),
    name: coin.name,
    image: {
      large: `https://s2.coinmarketcap.com/static/img/coins/200x200/${coin.id}.png`,
      small: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
      thumb: `https://s2.coinmarketcap.com/static/img/coins/32x32/${coin.id}.png`,
    },
    market_cap_rank: coin.cmc_rank || 0,
    description: {
      en: metadata?.description || 'No description available.',
    },
    market_data: {
      current_price: {
        usd: coin.quote.USD?.price || 0,
        inr: coin.quote.INR?.price || 0,
      },
      market_cap: {
        usd: coin.quote.USD?.market_cap || 0,
        inr: coin.quote.INR?.market_cap || 0,
      },
      total_volume: {
        usd: coin.quote.USD?.volume_24h || 0,
        inr: coin.quote.INR?.volume_24h || 0,
      },
    },
    last_updated: coin.last_updated,
  };
};
