const axios = require('axios');
const { EXCHANGE_RATE_API_KEY, COIN_GECKO_API_KEY } = require('../config/apiKeys');

exports.getExchangeRate = async (req, res) => {
  try {
    const { from, to, amount } = req.query;
    
    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Fetch from ExchangeRate-API
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/pair/${from}/${to}/${amount}`
    );
    
    res.json({
      from,
      to,
      amount,
      convertedAmount: response.data.conversion_result,
      exchangeRate: response.data.conversion_rate
    });
  } catch (error) {
    console.error('Currency exchange error:', error);
    res.status(500).json({ error: 'Currency conversion failed' });
  }
};

exports.getCryptocurrencyValue = async (req, res) => {
  try {
    const { from, to, amount } = req.query;
    
    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Fetch from CoinGecko
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${from}&vs_currencies=${to}`,
      {
        headers: { 'x-cg-api-key': COIN_GECKO_API_KEY }
      }
    );
    
    const rate = response.data[from.toLowerCase()][to.toLowerCase()];
    const convertedAmount = parseFloat(amount) * rate;
    
    res.json({
      from,
      to,
      amount,
      convertedAmount,
      exchangeRate: rate
    });
  } catch (error) {
    console.error('Cryptocurrency conversion error:', error);
    res.status(500).json({ error: 'Cryptocurrency conversion failed' });
  }
};