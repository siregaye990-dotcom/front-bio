// src/components/CartItem.jsx
import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

export default function CartItem({ item, index, updateQty, removeItem }) {
  const { formatPrice } = useCurrency();

  return (
    <div className="flex items-center gap-3 p-4 bg-[#f8fcf9] rounded-2xl animate-in fade-in slide-in-from-left-2 duration-200">
      {/* Color Dot */}
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-[#1f1a15] truncate leading-tight">{item.name}</div>
        <div className="text-[11px] text-[#7f7460] mt-0.5">{item.size}</div>
      </div>
      
      {/* Quantity Controls */}
      <div className="flex items-center gap-2 px-2 py-1 bg-white border border-black/5 rounded-lg shadow-sm">
        <button 
          onClick={() => updateQty(index, -1)}
          className="w-5 h-5 flex items-center justify-center text-[#1f1a15] hover:bg-black/5 rounded transition-colors"
        >
          −
        </button>
        <span className="text-[12px] font-bold w-4 text-center">{item.qty}</span>
        <button 
          onClick={() => updateQty(index, 1)}
          className="w-5 h-5 flex items-center justify-center text-[#1f1a15] hover:bg-black/5 rounded transition-colors"
        >
          +
        </button>
      </div>
      
      {/* Price */}
      <div className="text-[13px] font-bold text-[#1a6b35] min-w-[55px] text-right">
        {formatPrice(item.total)}
      </div>
      
      {/* Remove Button */}
      <button 
        onClick={() => removeItem(index)}
        className="text-[#cccccc] hover:text-red-500 transition-colors ml-1"
      >
        ✕
      </button>
    </div>
  );
}
