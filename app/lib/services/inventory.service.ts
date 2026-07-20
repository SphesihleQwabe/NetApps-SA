// src/lib/services/inventory.service.ts

import { createClient } from '../../../lib/supabase/client'
import type { 
  Product, 
  InventoryHistory, 
  ProductAnalytics, 
  ProductStats,
  ProductFilter 
} from '../../types/inventory.types'

const supabase = createClient()

// GET PRODUCTS WITH FILTERS
export async function getProducts(filters: ProductFilter = {}) {
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })

  // Status filter - exclude deleted unless explicitly requested
  if (!filters.status) {
    query = query.is('deleted_at', null)
  }

  // Search
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  // Category
  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  // Status
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  // Stock status
  if (filters.stockStatus) {
    if (filters.stockStatus === 'in_stock') {
      query = query.gt('stock_quantity', 10)
    } else if (filters.stockStatus === 'low_stock') {
      query = query.gte('stock_quantity', 1).lte('stock_quantity', 10)
    } else if (filters.stockStatus === 'out_of_stock') {
      query = query.eq('stock_quantity', 0)
    }
  }

  // Price range
  if (filters.priceMin) {
    query = query.gte('price', filters.priceMin)
  }
  if (filters.priceMax) {
    query = query.lte('price', filters.priceMax)
  }

  // Sorting
  if (filters.sortBy) {
    const order = filters.sortOrder || 'desc'
    query = query.order(filters.sortBy, { ascending: order === 'asc' })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  // Pagination
  if (filters.page && filters.limit) {
    const start = (filters.page - 1) * filters.limit
    query = query.range(start, start + filters.limit - 1)
  }

  const { data, error, count } = await query
  if (error) throw error
  return { data: data as Product[], count: count || 0 }
}

// GET SINGLE PRODUCT
export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Product
}

// GET PRODUCT STATS
export async function getProductStats() {
  const { data, error } = await supabase
    .from('products')
    .select('stock_quantity, price, total_sold, total_revenue')
    .is('deleted_at', null)

  if (error) throw error

  const products: any[] = data || []
  const stats: ProductStats = {
    total: products.length,
    inStock: products.filter((p: any) => p.stock_quantity > 10).length,
    lowStock: products.filter((p: any) => p.stock_quantity > 0 && p.stock_quantity <= 10).length,
    outOfStock: products.filter((p: any) => p.stock_quantity === 0).length,
    totalValue: products.reduce((sum: number, p: any) => sum + (p.price * p.stock_quantity), 0),
    totalSold: products.reduce((sum: number, p: any) => sum + (p.total_sold || 0), 0),
    totalRevenue: products.reduce((sum: number, p: any) => sum + (p.total_revenue || 0), 0)
  }

  return stats
}

// ADD NEW PRODUCT
export async function addProduct(productData: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock_quantity: productData.stock_quantity || 0,
      category: productData.category || 'Uncategorized',
      image_url: productData.image_url,
      status: productData.status || 'draft',
      low_stock_threshold: productData.low_stock_threshold || 10
    })
    .select()
    .single()

  if (error) throw error

  // Add to inventory history
  if (productData.stock_quantity && productData.stock_quantity > 0) {
    await addInventoryHistory({
      product_id: data.id,
      quantity_change: productData.stock_quantity,
      previous_quantity: 0,
      new_quantity: productData.stock_quantity,
      reason: 'restock'
    })
  }

  return data as Product
}

// UPDATE PRODUCT
export async function updateProduct(id: string, updates: Partial<Product>) {
  // Get current product
  const current = await getProductById(id)

  // Update product
  const { data, error } = await supabase
    .from('products')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Track stock changes
  if (updates.stock_quantity !== undefined && updates.stock_quantity !== current.stock_quantity) {
    const change = updates.stock_quantity - current.stock_quantity
    await addInventoryHistory({
      product_id: id,
      quantity_change: change,
      previous_quantity: current.stock_quantity,
      new_quantity: updates.stock_quantity,
      reason: 'manual_adjustment'
    })
  }

  return data as Product
}

// SOFT DELETE PRODUCT
export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .update({
      deleted_at: new Date().toISOString(),
      status: 'archived'
    })
    .eq('id', id)

  if (error) throw error
}

// RESTORE PRODUCT
export async function restoreProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .update({
      deleted_at: null,
      status: 'draft'
    })
    .eq('id', id)

  if (error) throw error
}

// PERMANENTLY DELETE PRODUCT
export async function permanentlyDeleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// BULK ACTIONS
export async function bulkDeleteProducts(ids: string[]) {
  const { error } = await supabase
    .from('products')
    .update({
      deleted_at: new Date().toISOString(),
      status: 'archived'
    })
    .in('id', ids)

  if (error) throw error
}

export async function bulkUpdateStatus(ids: string[], status: string) {
  const { error } = await supabase
    .from('products')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .in('id', ids)

  if (error) throw error
}

export async function bulkUpdateCategory(ids: string[], category: string) {
  const { error } = await supabase
    .from('products')
    .update({ 
      category,
      updated_at: new Date().toISOString()
    })
    .in('id', ids)

  if (error) throw error
}

export async function bulkUpdatePrice(ids: string[], price: number) {
  const { error } = await supabase
    .from('products')
    .update({ 
      price,
      updated_at: new Date().toISOString()
    })
    .in('id', ids)

  if (error) throw error
}

// INVENTORY HISTORY
export async function addInventoryHistory(history: Omit<InventoryHistory, 'id' | 'created_at'>) {
  const { error } = await supabase
    .from('inventory_history')
    .insert(history)

  if (error) throw error
}

export async function getInventoryHistory(productId: string, limit = 20) {
  const { data, error } = await supabase
    .from('inventory_history')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as InventoryHistory[]
}

// PRODUCT ANALYTICS
export async function getProductAnalytics(productId: string) {
  const { data, error } = await supabase
    .from('product_analytics')
    .select('*')
    .eq('product_id', productId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as ProductAnalytics | null
}

export async function updateProductAnalytics(productId: string, updates: Partial<ProductAnalytics>) {
  const { data } = await supabase
    .from('product_analytics')
    .select('*')
    .eq('product_id', productId)

  if (data && data.length > 0) {
    const { error } = await supabase
      .from('product_analytics')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('product_id', productId)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('product_analytics')
      .insert({
        product_id: productId,
        ...updates
      })
    if (error) throw error
  }
}

// GET LOW STOCK PRODUCTS
export async function getLowStockProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .is('deleted_at', null)
    .lte('stock_quantity', 10)
    .order('stock_quantity', { ascending: true })

  if (error) throw error
  return data as Product[]
}

// GET OUT OF STOCK PRODUCTS
export async function getOutOfStockProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .is('deleted_at', null)
    .eq('stock_quantity', 0)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Product[]
}