// src/lib/supabase.js
// ⚠️  IMPORTANT : Remplacez ces valeurs par vos vraies clés Supabase
// 1. Allez sur https://supabase.com → votre projet → Settings → API
// 2. Copiez "Project URL" et "anon public key"

import { createClient } from '@supabase/supabase-js'
import { PRODUCTS } from '../utils/products'

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://VOTRE-PROJET.supabase.co'
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'votre-anon-key'
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000'

const isSupabaseConfigured = SUPABASE_URL !== 'https://VOTRE-PROJET.supabase.co' && SUPABASE_ANON_KEY !== 'votre-anon-key'

export const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null

// ─── HELPER POUR L'API BACKEND ────────────────────────────────────────────────
export const backendApi = {
  async get(endpoint) {
    const res = await fetch(`${API_URL}${endpoint}`)
    return res.json()
  },
  async post(endpoint, body) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    return res.json()
  }
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────

export const ordersApi = {
  // Récupérer toutes les commandes (admin)
  async getAll() {
    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    } else {
      // Fallback to localStorage
      return JSON.parse(localStorage.getItem('biosen_orders') || '[]')
    }
  },

  // Récupérer une commande par son numéro (suivi client)
  async getById(orderId) {
    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderId.toUpperCase())
        .single()
      if (error) throw error
      return data
    } else {
      // Fallback to localStorage
      const orders = JSON.parse(localStorage.getItem('biosen_orders') || '[]')
      return orders.find(o => o.order_number === orderId.toUpperCase())
    }
  },

  // Créer une nouvelle commande
  async create(order) {
    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .insert([order])
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      // Fallback to localStorage
      const orders = JSON.parse(localStorage.getItem('biosen_orders') || '[]')
      const newOrder = { ...order, id: Date.now().toString(), created_at: new Date().toISOString() }
      orders.unshift(newOrder)
      localStorage.setItem('biosen_orders', JSON.stringify(orders))
      return newOrder
    }
  },

  // Mettre à jour le statut d'une commande (admin)
  async updateStatus(id, status) {
    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      // Fallback to localStorage
      const orders = JSON.parse(localStorage.getItem('biosen_orders') || '[]')
      const updated = orders.map(o => o.id === id ? { ...o, status, updated_at: new Date().toISOString() } : o)
      localStorage.setItem('biosen_orders', JSON.stringify(updated))
      return updated.find(o => o.id === id)
    }
  },

  // Annuler une commande
  async cancel(id) {
    return ordersApi.updateStatus(id, 'cancelled')
  }
}

export const productsApi = {
  async getAll() {
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true })
      if (error) throw error
      return data
    } else {
      const stored = JSON.parse(localStorage.getItem('biosen_products') || '[]')
      if (stored.length > 0) {
        return stored
      }
      localStorage.setItem('biosen_products', JSON.stringify(PRODUCTS))
      return PRODUCTS
    }
  },

  async update(id, payload) {
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      const products = JSON.parse(localStorage.getItem('biosen_products') || '[]')
      const updated = products.map(product => product.id === id ? { ...product, ...payload, updated_at: new Date().toISOString() } : product)
      localStorage.setItem('biosen_products', JSON.stringify(updated))
      return updated.find(product => product.id === id)
    }
  },

  async create(payload) {
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      const products = JSON.parse(localStorage.getItem('biosen_products') || '[]')
      const nextId = Date.now()
      const newProduct = { ...payload, id: nextId, created_at: new Date().toISOString() }
      products.unshift(newProduct)
      localStorage.setItem('biosen_products', JSON.stringify(products))
      return newProduct
    }
  }
}

// ─── STOCK ────────────────────────────────────────────────────────────────────

export const stockApi = {
  // Récupérer tous les stocks
  async getAll() {
    if (supabase) {
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .order('product_key')
      if (error) throw error
      return data
    } else {
      // Fallback to localStorage
      return JSON.parse(localStorage.getItem('biosen_stock') || JSON.stringify([
        { product_key: 'Arraw-500g', product_name: 'Arraw de Mil 500g', quantity: 50, alert_threshold: 10 },
        { product_key: 'Arraw-1kg', product_name: 'Arraw de Mil 1kg', quantity: 30, alert_threshold: 5 },
        { product_key: 'Thiéré-500g', product_name: 'Thiéré de Mil 500g', quantity: 45, alert_threshold: 10 },
        { product_key: 'Thiéré-1kg', product_name: 'Thiéré de Mil 1kg', quantity: 25, alert_threshold: 5 },
        { product_key: 'Thiakry-500g', product_name: 'Thiakry de Mil 500g', quantity: 40, alert_threshold: 10 },
        { product_key: 'Thiakry-1kg', product_name: 'Thiakry de Mil 1kg', quantity: 20, alert_threshold: 5 }
      ]))
    }
  },

  // Mettre à jour une quantité
  async update(productKey, quantity) {
    if (supabase) {
      const { data, error } = await supabase
        .from('stock')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('product_key', productKey)
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      // Fallback to localStorage
      const stock = JSON.parse(localStorage.getItem('biosen_stock') || '[]')
      const updated = stock.map(s => s.product_key === productKey ? { ...s, quantity, updated_at: new Date().toISOString() } : s)
      localStorage.setItem('biosen_stock', JSON.stringify(updated))
      return updated.find(s => s.product_key === productKey)
    }
  },

  // Déduire du stock après commande
  async deduct(items) {
    if (supabase) {
      // items = [{ product_key: 'Arraw-500g', qty: 2 }, ...]
      for (const item of items) {
        const { data: current } = await supabase
          .from('stock')
          .select('quantity')
          .eq('product_key', item.product_key)
          .single()
        if (current) {
          await supabase
            .from('stock')
            .update({ quantity: Math.max(0, current.quantity - item.qty) })
            .eq('product_key', item.product_key)
        }
      }
    } else {
      // Fallback to localStorage
      const stock = JSON.parse(localStorage.getItem('biosen_stock') || '[]')
      for (const item of items) {
        const current = stock.find(s => s.product_key === item.product_key)
        if (current) {
          current.quantity = Math.max(0, current.quantity - item.qty)
        }
      }
      localStorage.setItem('biosen_stock', JSON.stringify(stock))
    }
  }
}

// ─── AUTH (ADMIN) ─────────────────────────────────────────────────────────────

export const authApi = {
  async signIn(email, password) {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    } else {
      throw new Error('Supabase not configured')
    }
  },

  async signOut() {
    if (supabase) {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }
  },

  async getSession() {
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    }
    return null
  },

  onAuthChange(callback) {
    if (supabase) {
      return supabase.auth.onAuthStateChange(callback)
    }
    return { data: { subscription: { unsubscribe: () => {} } } }
  }
}

// ─── VISITS (statistiques) ────────────────────────────────────────────────────

export const visitsApi = {
  async track() {
    if (supabase) {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('visits')
        .select('count')
        .eq('date', today)
        .single()

      if (data) {
        await supabase
          .from('visits')
          .update({ count: data.count + 1 })
          .eq('date', today)
      } else {
        await supabase
          .from('visits')
          .insert([{ date: today, count: 1 }])
      }
    } else {
      // Fallback: track in localStorage
      const today = new Date().toISOString().split('T')[0]
      const visits = JSON.parse(localStorage.getItem('biosen_visits') || '[]')
      const existing = visits.find(v => v.date === today)
      if (existing) {
        existing.count += 1
      } else {
        visits.push({ date: today, count: 1 })
      }
      localStorage.setItem('biosen_visits', JSON.stringify(visits))
    }
  },

  async getLast7Days() {
    if (supabase) {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .order('date', { ascending: false })
        .limit(7)
      if (error) return []
      return data.reverse()
    } else {
      // Fallback to localStorage
      const visits = JSON.parse(localStorage.getItem('biosen_visits') || '[]')
      return visits.slice(-7).reverse()
    }
  }
}
