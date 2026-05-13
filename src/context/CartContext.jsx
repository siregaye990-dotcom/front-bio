// src/context/CartContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext(null)

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, size, price, qty, color, stockKey } = action.payload
      const key = `${product.id}-${size}`
      const existing = state.items.find(i => i.key === key)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.key === key ? { ...i, qty: i.qty + qty, total: (i.qty + qty) * i.price } : i
          )
        }
      }
      return {
        ...state,
        items: [...state.items, {
          key, id: product.id, name: product.name,
          size, price, qty, total: qty * price, color, stockKey
        }]
      }
    }
    case 'UPDATE_QTY': {
      const { index, delta } = action.payload
      const item = state.items[index]
      const newQty = item.qty + delta
      if (newQty < 1) {
        return { ...state, items: state.items.filter((_, i) => i !== index) }
      }
      return {
        ...state,
        items: state.items.map((it, i) =>
          i === index ? { ...it, qty: newQty, total: newQty * it.price } : it
        )
      }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((_, i) => i !== action.payload) }
    case 'CLEAR':
      return { ...state, items: [], promo: null }
    case 'APPLY_PROMO':
      return { ...state, promo: action.payload }
    default:
      return state
  }
}

const INITIAL_STATE = { items: [], promo: null }
const FREE_SHIPPING_THRESHOLD = 5000
const SHIPPING_FEE = 500

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, INITIAL_STATE, () => {
    try {
      const saved = localStorage.getItem('biosen_cart')
      return saved ? JSON.parse(saved) : INITIAL_STATE
    } catch { return INITIAL_STATE }
  })

  useEffect(() => {
    try { localStorage.setItem('biosen_cart', JSON.stringify(state)) } catch {}
  }, [state])

  const subtotal = state.items.reduce((s, i) => s + i.total, 0)
  const shipping = state.items.length > 0
    ? (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE)
    : 0
  const discount = state.promo
    ? Math.round(subtotal * state.promo.pct)
    : 0
  const total = subtotal + shipping - discount
  const count = state.items.reduce((s, i) => s + i.qty, 0)

  const addItem = (product, size, price, qty, color, stockKey) =>
    dispatch({ type: 'ADD_ITEM', payload: { product, size, price, qty, color, stockKey } })

  const updateQty = (index, delta) =>
    dispatch({ type: 'UPDATE_QTY', payload: { index, delta } })

  const removeItem = (index) =>
    dispatch({ type: 'REMOVE_ITEM', payload: index })

  const clear = () => dispatch({ type: 'CLEAR' })

  const applyPromo = (promo) =>
    dispatch({ type: 'APPLY_PROMO', payload: promo })

  return (
    <CartContext.Provider value={{
      items: state.items, promo: state.promo,
      subtotal, shipping, discount, total, count,
      addItem, updateQty, removeItem, clear, applyPromo
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
