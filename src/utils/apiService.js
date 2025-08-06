import axios from 'axios';

// Create axios instance with better default configuration
const apiClient = axios.create({
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache helper functions
const getCacheKey = (url, params) => {
  return `${url}${params ? '?' + new URLSearchParams(params).toString() : ''}`;
};

const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// Enhanced API request with caching and retry logic
export const apiRequest = async (url, options = {}) => {
  const { useCache = true, retries = 2, ...axiosOptions } = options;
  const cacheKey = getCacheKey(url, axiosOptions.params);

  // Check cache first
  if (useCache && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (isCacheValid(cached.timestamp)) {
      console.log('Using cached data for:', url);
      return { data: cached.data };
    } else {
      cache.delete(cacheKey);
    }
  }

  let lastError;
  
  // Retry logic
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Fetching data from: ${url} (attempt ${attempt + 1})`);
      const response = await apiClient.get(url, axiosOptions);
      
      // Cache successful response
      if (useCache && response.data) {
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
        });
      }
      
      return response;
    } catch (error) {
      lastError = error;
      console.warn(`API request failed (attempt ${attempt + 1}):`, error.message);
      
      if (attempt < retries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If all retries failed, throw the last error
  throw lastError;
};

// CoinMarketCap API request with proper headers
export const cmcApiRequest = async (config, options = {}) => {
  const { useCache = true, retries = 2 } = options;
  const cacheKey = getCacheKey(config.url, config.params);

  // Check cache first
  if (useCache && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (isCacheValid(cached.timestamp)) {
      console.log('Using cached CMC data for:', config.url);
      return { data: cached.data };
    } else {
      cache.delete(cacheKey);
    }
  }

  let lastError;
  
  // Retry logic
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Fetching CMC data from: ${config.url} (attempt ${attempt + 1})`);
      
      const response = await axios({
        method: 'GET',
        url: config.url,
        headers: config.headers,
        params: config.params,
        timeout: 15000,
      });
      
      // Cache successful response
      if (useCache && response.data) {
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
        });
      }
      
      return response;
    } catch (error) {
      lastError = error;
      console.warn(`CMC API request failed (attempt ${attempt + 1}):`, error.message);
      
      if (attempt < retries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If all retries failed, throw the last error
  throw lastError;
};

// Clear cache function
export const clearCache = () => {
  cache.clear();
  console.log('API cache cleared');
};

// Get cache size
export const getCacheSize = () => {
  return cache.size;
};
