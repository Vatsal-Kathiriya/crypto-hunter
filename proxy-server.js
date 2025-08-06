// Simple Express.js proxy server for CoinMarketCap API
// Run this separately: node proxy-server.js

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

const CMC_API_KEY = '66d7706e-9368-4690-8f6e-483f97608bc5';
const CMC_BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

// Proxy endpoint for cryptocurrency listings
app.get('/api/listings', async (req, res) => {
  try {
    const { start = 1, limit = 100, convert = 'USD' } = req.query;
    
    const response = await axios.get(`${CMC_BASE_URL}/cryptocurrency/listings/latest`, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json',
      },
      params: {
        start,
        limit,
        convert,
        sort: 'market_cap',
        sort_dir: 'desc',
      },
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('CMC API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch data from CoinMarketCap',
      message: error.message 
    });
  }
});

// Proxy endpoint for single cryptocurrency
app.get('/api/quote/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { convert = 'USD' } = req.query;
    
    const response = await axios.get(`${CMC_BASE_URL}/cryptocurrency/quotes/latest`, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json',
      },
      params: {
        id,
        convert,
      },
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('CMC API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch coin data from CoinMarketCap',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`CoinMarketCap proxy server running on http://localhost:${PORT}`);
  console.log(`Test the health endpoint: http://localhost:${PORT}/health`);
});

module.exports = app;
