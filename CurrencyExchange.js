import React, { useState, useEffect } from 'react';
import { getExchangeRate } from '../services/api';

function CurrencyExchange() {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    // Fetch available currencies
    const fetchCurrencies = async () => {
      try {
        const response = await fetch('/api/currency-exchange/currencies');
        const data = await response.json();
        setCurrencies(data.currencies);
      } catch (error) {
        console.error('Error fetching currencies:', error);
      }
    };
    fetchCurrencies();
  }, []);

  const handleConvert = async () => {
    if (!amount || isNaN(amount)) return;
    
    setLoading(true);
    try {
      const rate = await getExchangeRate(fromCurrency, toCurrency, amount);
      setResult({
        amount,
        from: fromCurrency,
        to: toCurrency,
        convertedAmount: rate.convertedAmount,
        rate: rate.exchangeRate
      });
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="currency-exchange">
      <h2>Currency Exchange</h2>
      <div className="form-group">
        <label>From:</label>
        <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
          {currencies.map(currency => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>To:</label>
        <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
          {currencies.map(currency => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Amount:</label>
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(parseFloat(e.target.value))} 
        />
      </div>
      <button onClick={handleConvert} disabled={loading}>
        {loading ? 'Converting...' : 'Convert'}
      </button>
      {result && (
        <div className="result">
          <p>{result.amount} {result.from} = {result.convertedAmount} {result.to}</p>
          <p>Exchange Rate: 1 {result.from} = {result.rate} {result.to}</p>
        </div>
      )}
    </div>
  );
}

export default CurrencyExchange;