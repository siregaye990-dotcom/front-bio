// src/hooks/useStock.js
import { useState, useEffect, useCallback } from 'react'
import { stockApi } from '../lib/supabase'
import { STOCK_KEYS } from '../utils/products'

const FALLBACK_KEY = 'biosen_stock_fallback'

const DEFAULT_STOCK = STOCK_KEYS.map((k, i) => ({
  product_key: k.key,
  product_name: k.label,
  quantity: [50, 30, 45, 25, 40, 20][i] ?? 30,
  alert_threshold: 10,
}))

function getLocal() {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_STOCK
  } catch { return DEFAULT_STOCK }
}
function saveLocal(stock) {
  try { localStorage.setItem(FALLBACK_KEY, JSON.stringify(stock)) } catch {}
}

export function useStock() {
  const [stock,      setStock]      = useState(getLocal())
  const [loading,    setLoading]    = useState(true)
  const [useSupabase, setUseSupabase] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await stockApi.getAll()
      if (data?.length) { setStock(data); setUseSupabase(true) }
    } catch {
      setStock(getLocal()); setUseSupabase(false)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  /** Get quantity for a given product key */
  const getQty = (key) => {
    const item = stock.find(s => s.product_key === key)
    return item?.quantity ?? 0
  }

  /** Update a single product's stock quantity */
  const update = async (key, qty) => {
    setStock(prev => prev.map(s => s.product_key === key ? { ...s, quantity: qty } : s))
    if (!useSupabase) {
      const local = getLocal()
      saveLocal(local.map(s => s.product_key === key ? { ...s, quantity: qty } : s))
    } else {
      try { await stockApi.update(key, qty) } catch {}
    }
  }

  /** Deduct quantities after a confirmed order */
  const deduct = async (items) => {
    // items: [{ product_key, qty }]
    setStock(prev => prev.map(s => {
      const item = items.find(i => i.product_key === s.product_key)
      if (!item) return s
      return { ...s, quantity: Math.max(0, s.quantity - item.qty) }
    }))
    const updated = stock.map(s => {
      const item = items.find(i => i.product_key === s.product_key)
      return item ? { ...s, quantity: Math.max(0, s.quantity - item.qty) } : s
    })
    if (!useSupabase) saveLocal(updated)
    else { try { await stockApi.deduct(items) } catch {} }
  }

  const criticalCount = stock.filter(s => s.quantity <= (s.alert_threshold ?? 10)).length

  return { stock, loading, getQty, update, deduct, reload: load, criticalCount }
}
