'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LogoBackground from '../components/LogoBackground'
import Link from 'next/link'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'

interface WishlistItem {
  id: string
  product_id: string
  product_name: string
  product_price: number
  product_image: string
}

export default function WishlistPage() {
  const router = useRouter()
  const supabase = createClient()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadWishlist() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login?redirect=wishlist')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .single()
      setUser(userData)

      setItems([
        {
          id: '1',
          product_id: '1',
          product_name: 'iPhone 15 Pro',
          product_price: 24999,
          product_image: '/images/products/iphone-15-pro.jpg'
        },
        {
          id: '2',
          product_id: '2',
          product_name: 'Samsung Galaxy S24 Ultra',
          product_price: 21999,
          product_image: '/images/products/samsung-s24-ultra.jpg'
        }
      ])
      setLoading(false)
    }
    loadWishlist()
  }, [router, supabase])

  const removeFromWishlist = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

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
      <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 overflow-hidden">
        <LogoBackground />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Wishlist</h1>
          <p className="text-gray-500 mb-6">{items.length} items saved</p>

          {items.length === 0 ? (
            <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100">
              <Heart className="mx-auto text-gray-300" size={64} />
              <h2 className="text-2xl font-bold text-gray-700 mt-4">Your wishlist is empty</h2>
              <p className="text-gray-500 mt-2">Save your favorite items here</p>
              <Link href="/" className="inline-block mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <div key={item.id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                  <Link href={`/product/${item.product_id}`}>
                    <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-contain" />
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/product/${item.product_id}`}>
                      <h3 className="font-semibold text-gray-800 hover:text-blue-600">{item.product_name}</h3>
                    </Link>
                    <p className="text-xl font-bold text-blue-600 mt-2">R{item.product_price.toFixed(2)}</p>
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 text-sm flex items-center justify-center gap-1">
                        <ShoppingCart size={16} /> Add to Cart
                      </button>
                      <button onClick={() => removeFromWishlist(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-200">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}