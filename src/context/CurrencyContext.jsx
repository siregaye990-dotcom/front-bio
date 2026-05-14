import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('biosen_currency') || 'XOF';
  });

  useEffect(() => {
    localStorage.setItem('biosen_currency', currency);
  }, [currency]);

  const getPrice = (baseXofPrice) => {
    if (currency === 'XOF') return `${baseXofPrice} FCFA`;
    
    // Fixed conversion specified by user
    let converted;
    if (baseXofPrice === 800) converted = 1.52;
    else if (baseXofPrice === 1600) converted = 3.05;
    else {
      // For subtotals and other amounts, use the average rate (0.0019)
      converted = baseXofPrice * 0.0019;
    }
    
    const symbol = currency === 'EUR' ? '€' : '$';
    return `${symbol}${converted.toFixed(2)}`;
  };

  const formatPrice = (amountXof) => {
    if (currency === 'XOF') return `${amountXof} FCFA`;
    const symbol = currency === 'EUR' ? '€' : '$';
    const converted = amountXof * 0.0019;
    return `${symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, getPrice, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};
