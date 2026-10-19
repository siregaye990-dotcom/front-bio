// src/components/Cart.jsx
import React from 'react';
import { FiLock } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { WHATSAPP_NUMBER } from '../utils/products';
import CartItem from './CartItem';
import styles from './Cart.module.css';

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
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.icon}>🛒</span>
          <h2 className={styles.title}>Panier</h2>
        </div>
        <button 
          onClick={clear}
          className={styles.clearBtn}
        >
          Vider
        </button>
      </div>

      {/* Items */}
      <div className={`${styles.itemsList} custom-scrollbar`}>
        {items.length === 0 ? (
          <p className={styles.emptyMsg}>Votre panier est vide</p>
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
      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span>Sous-total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>Total</span>
          <span className={styles.totalVal}>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button 
          onClick={handleCheckout}
          className={styles.checkoutBtn}
        >
          <FiLock size={12} />
          Commander maintenant
        </button>
        
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=Bonjour%20Bio%20S%C3%A9n%2C%20je%20voudrais%20commander%20!`}
          target="_blank" rel="noreferrer"
          className={styles.waBtn}
        >
          <FaWhatsapp size={15} />
          Commander via WhatsApp
        </a>
      </div>
    </div>
  );
}
