const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');

// Currency Exchange
router.get('/currency-exchange', financeController.getExchangeRate);

// Cryptocurrency Calculator
router.get('/cryptocurrency-calculator', financeController.getCryptocurrencyValue);

// Get available currencies
router.get('/currency-exchange/currencies', (req, res) => {
  // This could be fetched from the API or maintained statically
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD'];
  res.json({ currencies });
});

module.exports = router;