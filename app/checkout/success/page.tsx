'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const paymentId = searchParams.get('m_payment_id')
    if (paymentId) {
      setOrderId(paymentId)
    }
  }, [searchParams])

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