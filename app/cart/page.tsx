'use client'

import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeFromCart } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const vat = subtotal * 0.15 // 15% VAT
  const deliveryFee = subtotal > 500 ? 0 : 99
  const total = subtotal + vat + deliveryFee - discount

  if (items.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Your Cart is Empty</h1>
            <p className="text-gray-500 mb-8">Browse our products and find something you love!</p>
            <Link 
              href="/" 
              className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105"
            >
              Start Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
            <p className="text-gray-500 mt-1">{items.length} items in your cart</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center p-2 flex-shrink-0">
                    <img 
                      src={item.image_url || '/placeholder.jpg'} 
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                    <p className="text-lg font-bold text-blue-600 mt-1">R{item.price}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm font-semibold text-gray-700">
                      R{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>VAT (15%)</span>
                    <span>R{vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span>{deliveryFee === 0 ? 'Free' : `R${deliveryFee}`}</span>
                  </div>
                  
                  {/* Coupon Code */}
                  <div className="pt-3 border-t">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900 transition-colors">
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-blue-600">R{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Link href="/checkout">
  <button className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105">
    Proceed to Checkout →
  </button>
</Link>

                <Link 
                  href="/" 
                  className="block text-center text-sm text-gray-500 hover:text-blue-600 mt-4 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}