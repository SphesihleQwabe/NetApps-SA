'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
// ✅ CORRECT PATH - Go up 3 levels to reach app, then into lib
import { createClient } from '../../../lib/supabase/client'
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  List,
  Archive
} from 'lucide-react'

// ✅ CORRECT PATH - Go up 3 levels to reach app, then into components
import { StatusBadge, ConfirmModal, Toast, LoadingSkeleton } from '..//../components/ui'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock_quantity: number
  image_url: string
  category: string
  status: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  total_sold: number
  total_revenue: number
}

export default function AdminProducts() {
  const supabase = createClient()
  
  // State
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterStock, setFilterStock] = useState('all')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [sortField, setSortField] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
    totalSold: 0
  })

  // Load products
  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    try {
      // Build query
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .is('deleted_at', null)

      // Search
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      // Category filter
      if (filterCategory) {
        query = query.eq('category', filterCategory)
      }

      // Status filter
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      // Stock filter
      if (filterStock === 'in_stock') {
        query = query.gt('stock_quantity', 10)
      } else if (filterStock === 'low_stock') {
        query = query.gte('stock_quantity', 1).lte('stock_quantity', 10)
      } else if (filterStock === 'out_of_stock') {
        query = query.eq('stock_quantity', 0)
      }

      // Sorting
      query = query.order(sortField, { ascending: sortOrder === 'asc' })

      const { data, count, error } = await query

      if (error) throw error

      const productsData = data || []
      setProducts(productsData)
      setTotal(count || 0)

      // Get categories
      const cats = [...new Set(productsData.map(p => p.category).filter(Boolean))]
      setCategories(cats)

      // Calculate stats
      const inStock = productsData.filter(p => p.stock_quantity > 10).length
      const lowStock = productsData.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 10).length
      const outOfStock = productsData.filter(p => p.stock_quantity === 0).length
      const totalValue = productsData.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0)
      const totalSold = productsData.reduce((sum, p) => sum + (p.total_sold || 0), 0)

      setStats({
        total: productsData.length,
        inStock,
        lowStock,
        outOfStock,
        totalValue,
        totalSold
      })

    } catch (error) {
      console.error('Error loading products:', error)
      setToast({ message: 'Failed to load products', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Handle delete (archive)
  async function handleDeleteConfirm() {
    if (!productToDelete) return
    try {
      const { error } = await supabase
        .from('products')
        .update({
          deleted_at: new Date().toISOString(),
          status: 'archived'
        })
        .eq('id', productToDelete)

      if (error) throw error

      setToast({ message: 'Product archived successfully', type: 'success' })
      setShowDeleteModal(false)
      setProductToDelete(null)
      loadProducts()
    } catch (error) {
      setToast({ message: 'Failed to archive product', type: 'error' })
    }
  }

  // Handle bulk delete
  async function handleBulkDeleteConfirm() {
    if (selectedProducts.length === 0) return
    try {
      const { error } = await supabase
        .from('products')
        .update({
          deleted_at: new Date().toISOString(),
          status: 'archived'
        })
        .in('id', selectedProducts)

      if (error) throw error

      setToast({ message: `${selectedProducts.length} products archived`, type: 'success' })
      setSelectedProducts([])
      setShowBulkDeleteModal(false)
      loadProducts()
    } catch (error) {
      setToast({ message: 'Failed to archive products', type: 'error' })
    }
  }

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
    loadProducts()
  }

  // Toggle selection
  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const toggleAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p.id))
    }
  }

  // Get stock status
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700', icon: XCircle }
    if (stock < 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle }
    return { label: 'In Stock', color: 'bg-green-100 text-green-700', icon: CheckCircle }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  // Loading state
  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Archive Product"
        message="This product will be moved to archive. You can restore it later."
        confirmText="Archive"
        type="warning"
      />

      {/* Bulk Delete Modal */}
      <ConfirmModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Archive Selected Products"
        message={`Are you sure you want to archive ${selectedProducts.length} products? You can restore them later.`}
        confirmText={`Archive ${selectedProducts.length} Products`}
        type="danger"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Products
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your product inventory • {total} products total
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={loadProducts}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link href="/admin/products/new">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">In Stock</p>
              <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setTimeout(loadProducts, 300)
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value)
              setTimeout(loadProducts, 100)
            }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 min-w-[140px]"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value)
              setTimeout(loadProducts, 100)
            }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 min-w-[130px]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="hidden">Hidden</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={filterStock}
            onChange={(e) => {
              setFilterStock(e.target.value)
              setTimeout(loadProducts, 100)
            }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 min-w-[130px]"
          >
            <option value="all">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <button 
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            className="px-3 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            {viewMode === 'table' ? <Grid3X3 className="w-4 h-4 text-gray-500" /> : <List className="w-4 h-4 text-gray-500" />}
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm text-blue-700">
            {selectedProducts.length} product(s) selected
          </span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
            >
              Archive Selected
            </button>
            <button
              onClick={() => setSelectedProducts([])}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={toggleAllProducts}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900" 
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Product
                    {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900" 
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center gap-1">
                    Price
                    {sortField === 'price' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900" 
                  onClick={() => handleSort('stock_quantity')}
                >
                  <div className="flex items-center gap-1">
                    Stock
                    {sortField === 'stock_quantity' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Stock Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-sm">Try adjusting your search or filter</p>
                    <Link href="/admin/products/new">
                      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        Add Your First Product
                      </button>
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const stockStatus = getStockStatus(product.stock_quantity)
                  const StatusIcon = stockStatus.icon
                  return (
                    <tr key={product.id} className="border-b hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800">{product.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{product.description}</p>
                            {product.total_sold > 0 && (
                              <p className="text-xs text-blue-600 mt-1">
                                {product.total_sold} sold • {formatCurrency(product.total_revenue || 0)}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {product.category || 'Uncategorized'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-medium ${
                          product.stock_quantity === 0 ? 'text-red-600' :
                          product.stock_quantity < 10 ? 'text-yellow-600' :
                          'text-gray-700'
                        }`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={product.status as any} />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${stockStatus.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/admin/products/${product.id}`}>
                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <Link href={`/product/${product.id}`} target="_blank">
                            <button className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-lg transition" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <button 
                            onClick={() => {
                              setProductToDelete(product.id)
                              setShowDeleteModal(true)
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Archive"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>Showing {products.length} of {total} products</span>
            <span>|</span>
            <span>Total Value: <strong className="text-gray-700">{formatCurrency(stats.totalValue)}</strong></span>
            <span>|</span>
            <span>Total Sold: <strong className="text-gray-700">{stats.totalSold}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-gray-600 transition" title="Download Report">
              <Download className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition" title="Print">
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}