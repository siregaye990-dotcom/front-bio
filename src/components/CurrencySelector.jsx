import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { FiChevronDown } from 'react-icons/fi';

const CurrencySelector = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="relative inline-block text-left group">
      <button className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold tracking-widest uppercase border border-white/20 rounded-full hover:border-gold hover:text-gold transition-all">
        {currency}
        <FiChevronDown size={12} className="group-hover:rotate-180 transition-transform" />
      </button>
      
      <div className="absolute right-0 mt-2 w-24 origin-top-right rounded-md bg-[#0d2410] border border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[500]">
        <div className="py-1">
          {['XOF', 'EUR', 'USD'].map((curr) => (
            <button
              key={curr}
              onClick={() => setCurrency(curr)}
              className={`block w-full px-4 py-2 text-left text-[10px] font-bold tracking-widest uppercase transition-colors ${
                currency === curr ? 'text-gold bg-white/5' : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {curr} {curr === 'XOF' ? '🇸🇳' : curr === 'EUR' ? '🇪🇺' : '🇺🇸'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurrencySelector;
