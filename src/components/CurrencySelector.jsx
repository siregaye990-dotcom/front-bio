import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { FiChevronDown } from 'react-icons/fi';

const CurrencySelector = () => {
  const { currency, setCurrency } = useCurrency();

  const FLAGS = {
    'XOF': '🇸🇳',
    'EUR': '🇪🇺',
    'USD': '🇺🇸'
  };

  return (
    <div className="relative inline-block text-left group">
      <button className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase border border-white/20 rounded-full hover:border-gold hover:text-gold transition-all bg-white/5">
        <span className="text-base leading-none">{FLAGS[currency]}</span>
        <span>{currency}</span>
        <FiChevronDown size={12} className="group-hover:rotate-180 transition-transform opacity-60" />
      </button>
      
      <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-[#0d2410] border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[500] overflow-hidden">
        <div className="py-1">
          {Object.entries(FLAGS).map(([curr, flag]) => (
            <button
              key={curr}
              onClick={() => setCurrency(curr)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-left text-[10px] font-bold tracking-widest uppercase transition-colors ${
                currency === curr ? 'text-gold bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-lg leading-none">{flag}</span>
              <span>{curr}</span>
              {currency === curr && <div className="ml-auto w-1 h-1 rounded-full bg-gold" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurrencySelector;
