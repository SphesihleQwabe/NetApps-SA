// src/hooks/useInventory.ts

import { useState, useEffect, useCallback } from 'react'
import {
  getProducts,
  getProductById,
  getProductStats,
  addProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  permanentlyDeleteProduct,
  bulkDeleteProducts,
  bulkUpdateStatus,
  bulkUpdateCategory,
  bulkUpdatePrice,
  getInventoryHistory,
  getLowStockProducts,
  getOutOfStockProducts,
  getProductAnalytics
} from '../lib/services/inventory.service'
import type { Product, ProductStats, ProductFilter, InventoryHistory, ProductAnalytics } from '../types/inventory.types'

// HOOK: Fetch products with filters
export function useProducts(filters: ProductFilter = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, count } = await getProducts(filters)
      setProducts(data)
      setTotal(count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, loading, error, total, refetch: fetchProducts }
}

// HOOK: Fetch single product
export function useProduct(id: string | null) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProduct = useCallback(async () => {
    if (!id) {
      setProduct(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getProductById(id)
      setProduct(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  return { product, loading, error, refetch: fetchProduct }
}

// HOOK: Fetch product stats
export function useProductStats() {
  const [stats, setStats] = useState<ProductStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getProductStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}

// HOOK: Add product
export function useAddProduct() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const add = useCallback(async (productData: Partial<Product>) => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const result = await addProduct(productData)
      setSuccess(true)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { add, loading, error, success, reset: () => setSuccess(false) }
}

// HOOK: Update product
export function useUpdateProduct() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const update = useCallback(async (id: string, updates: Partial<Product>) => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const result = await updateProduct(id, updates)
      setSuccess(true)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { update, loading, error, success, reset: () => setSuccess(false) }
}

// HOOK: Delete product
export function useDeleteProduct() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteProductAction = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await deleteProduct(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { deleteProduct: deleteProductAction, loading, error }
}

// HOOK: Bulk delete products
export function useBulkDelete() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bulkDelete = useCallback(async (ids: string[]) => {
    setLoading(true)
    setError(null)
    try {
      await bulkDeleteProducts(ids)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete products')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { bulkDelete, loading, error }
}

// HOOK: Bulk update status
export function useBulkUpdateStatus() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bulkUpdate = useCallback(async (ids: string[], status: string) => {
    setLoading(true)
    setError(null)
    try {
      await bulkUpdateStatus(ids, status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { bulkUpdate, loading, error }
}

// HOOK: Get inventory history
export function useInventoryHistory(productId: string | null) {
  const [history, setHistory] = useState<InventoryHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!productId) {
      setHistory([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getInventoryHistory(productId)
      setHistory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { history, loading, error, refetch: fetchHistory }
}

// HOOK: Get low stock products
export function useLowStockProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getLowStockProducts()
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch low stock products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, loading, error, refetch: fetchProducts }
}

// HOOK: Get out of stock products
export function useOutOfStockProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getOutOfStockProducts()
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch out of stock products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, loading, error, refetch: fetchProducts }
}

// HOOK: Get product analytics
export function useProductAnalytics(productId: string | null) {
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    if (!productId) {
      setAnalytics(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getProductAnalytics(productId)
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return { analytics, loading, error, refetch: fetchAnalytics }
}