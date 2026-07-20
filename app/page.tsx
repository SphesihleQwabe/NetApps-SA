'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import Header from './components/Header'
import Footer from './components/Footer'
import { useCart } from './context/CartContext'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Zap, TrendingDown, Clock, Star } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  stock_quantity: number
}

export default function Home() {
  const supabase = createClient()
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('first_name, last_name, role')
          .eq('email', session.user.email)
          .single()
        if (userData) setUser(userData)
      }

      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        if (Array.isArray(data)) {
          setProducts(data)
        } else {
          setProducts([])
        }
      } catch (error) {
        console.error('Error loading products:', error)
        setProducts([])
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (products.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(products.length, 4))
    }, 5000)
    return () => clearInterval(interval)
  }, [products])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.min(products.length, 4))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.min(products.length, 4)) % Math.min(products.length, 4))
  }

  // ✅ SLIDER PRODUCTS - Different from grid (first 4 in-stock products with discounts)
  const sliderProducts = products
    .filter(p => p.stock_quantity > 0)
    .slice(0, 4)
    .map((product, index) => {
      const discounts = [25, 15, 20, 30]
      const discount = discounts[index] || 15
      const originalPrice = product.price / (1 - discount / 100)
      return {
        ...product,
        discount,
        originalPrice: Math.round(originalPrice)
      }
    })

  // ✅ FEATURED PRODUCTS - Different from slider (next 8 products)
  const featuredProducts = products.slice(4, 12)

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main>
        {/* Premium Hero Slider */}
        <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
            <img 
              src="/images/products/logo.jpg"
              alt="NetApps Development"
              className="object-contain w-full h-full max-w-4xl mx-auto"
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16 z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-xl md:text-2xl font-bold text-white">🔥 Limited Time Offers</h2>
                </div>
                <p className="text-blue-100 text-sm">Special discounts on selected items</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={prevSlide}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Slider */}
            <div className="relative overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {sliderProducts.map((product) => (
                  <div key={product.id} className="w-full flex-shrink-0 px-1">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10 border border-white/10">
                      {/* Product Image */}
                      <div className="w-48 h-48 md:w-56 md:h-56 flex-shrink-0 relative">
                        <img 
                          src={product.image_url || '/placeholder.png'} 
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                        {/* Discount Badge */}
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                          <TrendingDown className="w-4 h-4" />
                          {product.discount}% OFF
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="text-center md:text-left flex-1">
                        <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                          <span className="text-xs text-blue-200 uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full">
                            {product.category}
                          </span>
                          <span className="text-xs text-yellow-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Limited Time
                          </span>
                        </div>
                        
                        <h3 className="text-2xl md:text-3xl font-bold mt-2">{product.name}</h3>
                        <p className="text-blue-100 text-sm mt-1 max-w-md mx-auto md:mx-0 line-clamp-2">
                          {product.description}
                        </p>

                        {/* Price */}
                        <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                          <span className="text-3xl md:text-4xl font-bold text-white">
                            R{product.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            R{product.originalPrice.toFixed(2)}
                          </span>
                          <span className="bg-green-500/30 text-green-300 px-2 py-0.5 rounded-full text-sm font-semibold">
                            Save R{(product.originalPrice - product.price).toFixed(2)}
                          </span>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-4 mt-3 justify-center md:justify-start">
                          <span className={`text-sm ${product.stock_quantity > 0 ? 'text-green-300' : 'text-red-300'}`}>
                            {product.stock_quantity > 0 ? `✅ ${product.stock_quantity} in stock` : '❌ Out of Stock'}
                          </span>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                          <Link 
                            href={`/product/${product.id}`}
                            className="px-6 py-2.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-medium backdrop-blur-sm border border-white/20"
                          >
                            View Details
                          </Link>
                          <button 
                            onClick={() => addToCart(product)}
                            className="px-6 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold"
                            disabled={product.stock_quantity === 0}
                          >
                            {product.stock_quantity > 0 ? '🛒 Add to Cart' : 'Out of Stock'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {sliderProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    currentSlide === index ? 'bg-white w-8' : 'bg-white/40 w-4 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Grid - Different products */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Featured Products</h2>
                <p className="text-gray-500 mt-1">Browse our collection</p>
              </div>
              <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                View All →
              </Link>
            </div>

            {featuredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No products available</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                  >
                    <Link href={`/product/${product.id}`}>
                      <div className="aspect-square bg-gray-50 flex items-center justify-center p-4 overflow-hidden relative">
                        <img 
                          src={product.image_url || '/placeholder.png'} 
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.stock_quantity < 5 && product.stock_quantity > 0 && (
                          <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                            Low Stock
                          </span>
                        )}
                        {product.stock_quantity === 0 && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                        {product.category}
                      </span>
                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition-colors mt-1 line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1 h-10">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xl font-bold text-blue-600">
                          R{product.price.toFixed(2)}
                        </span>
                        <button 
                          onClick={() => addToCart(product)}
                          className={`px-4 py-2 text-white text-sm rounded-lg transition-colors font-medium ${
                            product.stock_quantity > 0 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : 'bg-gray-400 cursor-not-allowed'
                          }`}
                          disabled={product.stock_quantity === 0}
                        >
                          {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                      {product.stock_quantity < 5 && product.stock_quantity > 0 && (
                        <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Only {product.stock_quantity} left!
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}