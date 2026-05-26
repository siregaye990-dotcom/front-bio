import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    // Force USD for now as requested
    if (currency !== 'USD') setCurrency('USD');
  }, [currency]);

  const getPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const formatPrice = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, getPrice, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};
