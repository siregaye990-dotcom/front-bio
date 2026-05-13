// src/hooks/useOrders.js
import { useState, useEffect, useCallback } from 'react'
import { ordersApi } from '../lib/supabase'

const FALLBACK_KEY = 'biosen_orders_fallback'

function seedFallback() {
  const t = new Date().toISOString()
  return [
    { id:'1', order_number:'#1001', client_name:'Fatou Diallo',   phone:'+221 77 123 45 67', address:'Dakar, Médina',  items:'Thiéré de Mil 500g ×2', total:1600, payment_method:'Wave',        status:'delivered', created_at:t, note:'' },
    { id:'2', order_number:'#1002', client_name:'Moussa Sow',     phone:'+221 76 234 56 78', address:'Dakar, Plateau', items:'Arraw de Mil 1kg ×1',    total:1600, payment_method:'Orange Money', status:'shipped',   created_at:t, note:'' },
    { id:'3', order_number:'#1003', client_name:'Aminata Ba',     phone:'+221 78 345 67 89', address:'Thiès',          items:'Thiakry de Mil 500g ×3', total:2400, payment_method:'Cash',         status:'confirmed', created_at:t, note:'Livrer avant 18h' },
    { id:'4', order_number:'#1004', client_name:'Ibrahim Ndiaye', phone:'+221 77 456 78 90', address:'Dakar, Yoff',   items:'Thiéré 1kg ×1, Arraw 500g ×2', total:3200, payment_method:'Wave',  status:'pending',   created_at:t, note:'' },
  ]
}

function getLocal() {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY)
    const data = raw ? JSON.parse(raw) : []
    return data.length ? data : seedFallback()
  } catch { return seedFallback() }
}

function saveLocal(orders) {
  try { localStorage.setItem(FALLBACK_KEY, JSON.stringify(orders)) } catch {}
}

export function useOrders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [useSupabase, setUseSupabase] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ordersApi.getAll()
      setOrders(data || [])
      setUseSupabase(true)
    } catch {
      setOrders(getLocal())
      setUseSupabase(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const updateStatus = async (order, newStatus) => {
    const updated = { ...order, status: newStatus }
    setOrders(prev => prev.map(o => o.id === order.id ? updated : o))
    try {
      if (useSupabase) await ordersApi.updateStatus(order.id, newStatus)
    } catch {}
    if (!useSupabase) {
      const local = getLocal()
      saveLocal(local.map(o => o.order_number === order.order_number ? { ...o, status: newStatus } : o))
    }
    return updated
  }

  const addOrder = (order) => {
    setOrders(prev => [order, ...prev])
    if (!useSupabase) {
      const local = getLocal()
      saveLocal([order, ...local])
    }
  }

  return { orders, loading, error, reload: load, updateStatus, addOrder, useSupabase }
}
