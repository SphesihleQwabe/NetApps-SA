'use client'

import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
}

export default function ProductsPage() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        setProducts(data)
      } catch (error) {
        console.error('Error:', error)
      }
      setLoading(false)
    }
    loadProducts()
  }, [])

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

  const filteredProducts = filter 
    ? products.filter(p => p.category === filter)
    : products

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">All Products</h1>
        <p className="text-gray-500 mb-6">{products.length} products available</p>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button 
            onClick={() => setFilter('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              !filter ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden">
              <Link href={`/product/${product.id}`}>
                <div className="h-48 bg-gray-100 flex items-center justify-center p-4">
                  <img 
                    src={product.image_url || '/placeholder.png'} 
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                </div>
              </Link>
              <div className="p-4">
                <span className="text-xs text-gray-500 uppercase">{product.category}</span>
                <Link href={`/product/${product.id}`}>
                  <h3 className="font-semibold text-gray-800 hover:text-blue-600 mt-1">{product.name}</h3>
                </Link>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xl font-bold text-blue-600">R{product.price}</span>
                  <button 
                    onClick={() => addToCart(product)}
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}