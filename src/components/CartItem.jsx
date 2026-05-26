// src/components/CartItem.jsx
import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import styles from './Cart.module.css';

export default function CartItem({ item, index, updateQty, removeItem }) {
  const { formatPrice } = useCurrency();

  return (
    <div className={styles.item}>
      {/* Color Dot */}
      <div className={styles.itemDot} style={{ background: item.color }} />
      
      {/* Info */}
      <div className={styles.itemInfo}>
        <div className={styles.itemName}>{item.name}</div>
        <div className={styles.itemSize}>{item.size}</div>
      </div>
      
      {/* Quantity Controls */}
      <div className={styles.qtyControls}>
        <button 
          onClick={() => updateQty(index, -1)}
          className={styles.qtyBtn}
        >
          −
        </button>
        <span className={styles.qtyVal}>{item.qty}</span>
        <button 
          onClick={() => updateQty(index, 1)}
          className={styles.qtyBtn}
        >
          +
        </button>
      </div>
      
      {/* Price */}
      <div className={styles.itemPrice}>
        {formatPrice(item.total)}
      </div>
      
      {/* Remove Button */}
      <button 
        onClick={() => removeItem(index)}
        className={styles.removeBtn}
      >
        ✕
      </button>
    </div>
  );
}
