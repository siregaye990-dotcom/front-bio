import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { FiChevronDown } from 'react-icons/fi';

const CurrencySelector = () => {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currencies = [ 
    { code: 'XOF', label: 'XOF', country: 'sn' }, 
    { code: 'EUR', label: 'EUR', country: 'eu' }, 
    { code: 'USD', label: 'USD', country: 'us' } 
  ];

  const selectedCurrency = currencies.find(c => c.code === currency) || currencies[0];

  // Fermer le menu si on clique ailleurs sur la page
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bouton principal — Clique pour ouvrir */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 transition-all hover:opacity-80"
      >
        <img 
          src={`https://flagcdn.com/w40/${selectedCurrency.country}.png`}
          alt={selectedCurrency.label}
          className="w-5 h-auto shadow-sm"
        />
        <span className="text-[11px] font-bold tracking-tight uppercase !text-white">{selectedCurrency.label}</span>
        <FiChevronDown size={14} className={`!text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Menu déroulant — S'affiche uniquement au clic */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-28 rounded-sm bg-[#0d2410] border border-white/10 shadow-2xl z-[500] overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="py-1">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => {
                  setCurrency(curr.code);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3 py-2 text-left text-[11px] font-bold tracking-tight uppercase transition-colors ${
                  currency === curr.code ? '!text-white bg-white/10 font-black' : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <img 
                  src={`https://flagcdn.com/w40/${curr.country}.png`}
                  alt={curr.label}
                  className="w-5 h-auto shadow-sm"
                />
                <span>{curr.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
