'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'

export default function AddProductPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: '',
    image_url: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!form.name || !form.description || !form.price || !form.stock_quantity) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    const priceNum = parseFloat(form.price)
    const stockNum = parseInt(form.stock_quantity)

    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price')
      setLoading(false)
      return
    }

    if (isNaN(stockNum) || stockNum < 0) {
      setError('Please enter a valid stock quantity')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: form.name,
          description: form.description,
          price: priceNum,
          stock_quantity: stockNum,
          category: form.category || 'Uncategorized',
          image_url: form.image_url || null
        })
        .select()

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setForm({
          name: '',
          description: '',
          price: '',
          stock_quantity: '',
          category: '',
          image_url: ''
        })
        setTimeout(() => {
          router.push('/admin/products')
        }, 2000)
      }
    } catch (err) {
      setError('Failed to add product')
    }

    setLoading(false)
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <Save className="w-4 h-4" />
          Product added successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              rows={4}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product description"
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (R) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="99.99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
              <input
                type="number"
                min="0"
                required
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10"
              />
            </div>
          </div>

          {/* Category and Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Electronics, Laptops, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="/images/products/product-name.jpg"
              />
            </div>
          </div>

          {/* Image Preview */}
          {form.image_url && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
              <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img src={form.image_url} alt="Preview" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 rounded-lg text-white font-medium transition ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
            <Link
              href="/admin/products"
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}