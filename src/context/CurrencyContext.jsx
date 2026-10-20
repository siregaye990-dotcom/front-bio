import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export const CURRENCIES = {
  XOF: { code: 'XOF', flag: '🇸🇳', symbol: 'FCFA', rate: 1, decimals: 0 },
  EUR: { code: 'EUR', flag: '🇪🇺', symbol: '€', rate: 1 / 400, decimals: 2 },
  USD: { code: 'USD', flag: '🇺🇸', symbol: '$', rate: 1 / 400, decimals: 2 },
  CAD: { code: 'CAD', flag: '🇨🇦', symbol: 'C$', rate: 3 / 800, decimals: 2 },
};

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    if (typeof window === 'undefined') return 'XOF';
    const saved = window.localStorage.getItem('sweetbio_currency');
    return saved && CURRENCIES[saved] ? saved : 'XOF';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('sweetbio_currency', currency);
    }
  }, [currency]);

  const formatPrice = useMemo(() => (amount, targetCurrency = currency) => {
    const config = CURRENCIES[targetCurrency] || CURRENCIES.XOF;
    const converted = amount * config.rate;
    const formatted = converted.toLocaleString('fr-FR', {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    });
    return `${formatted} ${config.symbol}`;
  }, [currency]);

  const getPrice = useMemo(() => (amount, targetCurrency = currency) => {
    return formatPrice(amount, targetCurrency);
  }, [formatPrice]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, getPrice, formatPrice, CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
};
