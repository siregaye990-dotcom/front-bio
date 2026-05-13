// src/hooks/useProducts.js
import { useState, useEffect, useCallback } from 'react'
import { productsApi } from '../lib/supabase'

export default function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await productsApi.getAll()
      setProducts(data || [])
    } catch (error) {
      console.error('Impossible de charger les produits:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const updateProduct = async (id, fields) => {
    const updated = await productsApi.update(id, fields)
    setProducts(prev => prev.map(product => product.id === updated.id ? updated : product))
    return updated
  }

  const createProduct = async (product) => {
    const created = await productsApi.create(product)
    setProducts(prev => [created, ...prev])
    return created
  }

  return {
    products,
    loading,
    reload: loadProducts,
    updateProduct,
    createProduct,
  }
}
