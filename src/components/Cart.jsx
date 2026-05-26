// src/components/Cart.jsx
import React from 'react';
import { FiLock, FiShield } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { WHATSAPP_NUMBER } from '../utils/products';
import CartItem from './CartItem';

export default function Cart({ onCheckout }) {
  const { items, subtotal, total, updateQty, removeItem, clear } = useCart();
  const { formatPrice } = useCurrency();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Votre panier est vide !');
      return;
    }
    onCheckout();
  };

  return (
    <div className="bg-white rounded-[24px] border border-black/5 p-7 sticky top-24 shadow-sm h-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛒</span>
          <h2 className="font-serif text-[24px] font-bold text-[#1f1a15]">Panier</h2>
        </div>
        <button 
          onClick={clear}
          className="text-[11px] text-[#7f7460] underline hover:text-[#1f1a15] transition-colors"
        >
          Vider
        </button>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-3 mb-6 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {items.length === 0 ? (
          <p className="text-center py-8 text-[#7f7460] text-[12px] italic">Votre panier est vide</p>
        ) : (
          items.map((item, i) => (
            <CartItem 
              key={item.key} 
              item={item} 
              index={i} 
              updateQty={updateQty} 
              removeItem={removeItem} 
            />
          ))
        )}
      </div>

      {/* Summary */}
      <div className="space-y-3 mb-6 pt-5 border-t border-black/5">
        <div className="flex justify-between text-[13px] text-[#7f7460]">
          <span>Sous-total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center text-[18px] font-bold text-[#1f1a15] pt-3 border-t border-black/[0.08]">
          <span>Total</span>
          <span className="text-[#1a6b35] text-[20px]">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button 
          onClick={handleCheckout}
          className="w-full bg-[#1a6b35] hover:bg-[#155a2c] text-white rounded-xl py-4 flex items-center justify-center gap-2 font-bold text-[12px] tracking-widest uppercase shadow-lg shadow-green-900/10 transition-all hover:-translate-y-0.5"
        >
          <FiLock size={12} />
          Commander maintenant
        </button>
        
        <div className="flex items-center justify-center gap-2 text-[10px] text-[#7f7460]">
          <FiShield size={12} className="text-[#1a6b35]" />
          <span>Orange Money · Wave · Carte</span>
        </div>

        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=Bonjour%20Bio%20S%C3%A9n%2C%20je%20voudrais%20commander%20!`}
          target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 rounded-xl py-3.5 font-bold text-[11px] transition-all"
        >
          <FaWhatsapp size={15} />
          Commander via WhatsApp
        </a>
      </div>
    </div>
  );
}
