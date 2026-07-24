'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight, Loader2, XCircle } from 'lucide-react'
import { createClient } from '../../../lib/supabase/client'

function SuccessContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [orderId, setOrderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handlePaymentSuccess() {
      console.log('🔍 All URL params:', Object.fromEntries(searchParams.entries()))
      
      // 🔥 METHOD 1: Try to get payment ID from URL
      let paymentId = searchParams.get('m_payment_id')
      console.log('🔍 Payment ID from URL:', paymentId)

      // 🔥 METHOD 2: Try from localStorage
      if (!paymentId) {
        const savedOrderId = localStorage.getItem('pending_order_id')
        console.log('🔍 Order ID from localStorage:', savedOrderId)
        
        if (savedOrderId) {
          paymentId = savedOrderId
          localStorage.removeItem('pending_order_id')
        }
      }

      // 🔥 METHOD 3: Try to get the email from URL
      const email = searchParams.get('email')
      console.log('🔍 Email from URL:', email)

      // 🔥 METHOD 4: If still no ID, try to find the most recent pending order
      if (!paymentId && email) {
        console.log('🔍 Looking for recent order by email...')
        const { data: recentOrders, error: findError } = await supabase
          .from('orders')
          .select('id, created_at')
          .eq('email', email)
          .order('created_at', { ascending: false })
          .limit(1)

        console.log('🔍 Recent orders found:', recentOrders)

        if (recentOrders && recentOrders.length > 0) {
          paymentId = recentOrders[0].id
          console.log('🔍 Found order by email:', paymentId)
        }
      }

      // 🔥 METHOD 5: Last resort - get the most recent order from today
      if (!paymentId) {
        console.log('🔍 Looking for any recent order...')
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const { data: recentOrders } = await supabase
          .from('orders')
          .select('id, created_at')
          .gte('created_at', today.toISOString())
          .order('created_at', { ascending: false })
          .limit(1)

        if (recentOrders && recentOrders.length > 0) {
          paymentId = recentOrders[0].id
          console.log('🔍 Found recent order by date:', paymentId)
        }
      }

      if (!paymentId) {
        setError('No payment ID found. Please check your email for order confirmation.')
        setLoading(false)
        return
      }

      setOrderId(paymentId)

      try {
        // Update order status to paid
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'processing'
          })
          .eq('id', paymentId)

        if (updateError) {
          console.error('❌ Error updating order:', updateError)
        }

        // Get order items
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', paymentId)

        console.log('📦 Order items:', orderItems)

        // Deduct stock for each product
        for (const item of orderItems || []) {
          const { data: product } = await supabase
            .from('products')
            .select('stock_quantity, total_sold, total_revenue')
            .eq('id', item.product_id)
            .single()

          if (product) {
            const newStock = (product.stock_quantity || 0) - (item.quantity || 0)
            const newTotalSold = (product.total_sold || 0) + (item.quantity || 0)
            const newTotalRevenue = (product.total_revenue || 0) + ((item.unit_price || 0) * (item.quantity || 0))

            await supabase
              .from('products')
              .update({
                stock_quantity: newStock >= 0 ? newStock : 0,
                total_sold: newTotalSold,
                total_revenue: newTotalRevenue
              })
              .eq('id', item.product_id)

            console.log(`✅ Stock updated for ${item.product_name}: ${product.stock_quantity} → ${newStock}`)
          }
        }

        setLoading(false)

      } catch (err) {
        console.error('❌ Error processing payment:', err)
        setError('Payment confirmed but stock update failed')
        setLoading(false)
      }
    }

    handlePaymentSuccess()
  }, [searchParams, supabase])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Processing your payment...</h2>
          <p className="text-gray-500 text-sm mt-2">Please wait while we confirm your order.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Confirmed But...</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              Return to Home
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Successful! 🎉
        </h1>
        
        <p className="text-gray-600 mb-2">
          Thank you for your order. Your payment has been confirmed.
        </p>

        {orderId && (
          <p className="text-sm text-gray-500 mb-6">
            Order ID: <span className="font-mono font-medium">{orderId}</span>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {orderId && (
            <Link href={`/orders/${orderId}`}>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                <Package className="w-5 h-5" />
                View Order
              </button>
            </Link>
          )}
          <Link href="/">
            <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition">
              Continue Shopping
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}