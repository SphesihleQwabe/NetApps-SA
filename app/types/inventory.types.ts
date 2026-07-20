// src/types/inventory.types.ts

export interface Product {
  id: string
  name: string
  description: string
  short_description?: string
  price: number
  compare_price?: number
  stock_quantity: number
  low_stock_threshold: number
  status: 'active' | 'draft' | 'hidden' | 'archived'
  deleted_at?: string
  total_sold: number
  total_revenue: number
  category: string
  brand?: string
  image_url?: string
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
    unit?: string
  }
  meta_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
}

export interface InventoryHistory {
  id: string
  product_id: string
  quantity_change: number
  previous_quantity: number
  new_quantity: number
  reason: 'purchase' | 'restock' | 'manual_adjustment' | 'order_cancellation'
  reference_id?: string // order_id or product_id
  reference_type?: 'order' | 'return' | 'restock'
  created_by?: string // user_id
  created_at: string
}

export interface ProductAnalytics {
  id: string
  product_id: string
  total_views: number
  total_added_to_cart: number
  total_wishlist_adds: number
  conversion_rate: number
  last_viewed_at?: string
  updated_at: string
}

export interface ProductAuditLog {
  id: string
  product_id: string
  user_id: string
  action: 'create' | 'update' | 'delete' | 'restore' | 'status_change'
  old_values?: any
  new_values?: any
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface ProductStats {
  total: number
  inStock: number
  lowStock: number
  outOfStock: number
  totalValue: number
  totalSold: number
  totalRevenue: number
}

export interface ProductFilter {
  search?: string
  category?: string
  status?: string
  stockStatus?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  priceMin?: number
  priceMax?: number
  sortBy?: 'name' | 'price' | 'stock' | 'created_at' | 'total_sold'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}