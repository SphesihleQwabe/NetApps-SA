'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase/client'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Package, Truck, CheckCircle, Clock, XCircle, MapPin, Mail, Phone, User, ArrowLeft } from 'lucide-react'

export default function CustomerOrderDetails() {
  const params = useParams()
  const supabase = createClient()
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrder() {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .single()

      if (orderData) {
        setOrder(orderData)
      }

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', params.id)

      setItems(itemsData || [])
      setLoading(false)
    }

    loadOrder()
  }, [params.id, supabase])

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

  if (!order) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Order Not Found</h1>
            <Link href="/dashboard" className="text-blue-600 mt-4 inline-block">Back to Dashboard</Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const statusIcons: Record<string, any> = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle
  }

  const StatusIcon = statusIcons[order.status] || Clock

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Order #{order.order_number}</h1>
            <Link href="/dashboard" className="text-blue-600 hover:underline flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            {/* Status */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                <StatusIcon className="w-4 h-4" />
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>

            {/* Tracking Number */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-700">Tracking Information</h3>
              </div>
              {order.tracking_number ? (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Tracking Number:</p>
                  <p className="text-lg font-bold text-blue-600">{order.tracking_number}</p>
                  <p className="text-xs text-gray-500 mt-1">Your order has been processed and is being prepared for shipping.</p>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Your order is being processed.</p>
                  <p className="text-xs text-gray-400">A tracking number will be assigned once your order is ready to ship.</p>
                </div>
              )}
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 text-sm mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> Customer
                </h3>
                <p className="text-gray-800">{order.first_name} {order.last_name}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {order.email}</p>
                <p className="text-sm text-gray-500"><Phone className="w-3 h-3 inline" /> {order.phone}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 text-sm mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Delivery Address
                </h3>
                <p className="text-gray-800">{order.address}</p>
                <p className="text-sm text-gray-500">{order.city}, {order.province}</p>
                <p className="text-sm text-gray-500">{order.postal_code}</p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Order Items</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      {item.product_image && (
                        <img src={item.product_image} alt={item.product_name} className="w-12 h-12 object-contain" />
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{item.product_name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">R{item.total_price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">R{item.unit_price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-100 pt-4 flex justify-end">
              <div className="w-64 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>R{order.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">VAT (15%)</span><span>R{order.vat.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span>R{order.delivery_fee.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-lg border-t pt-1">
                  <span>Total</span>
                  <span className="text-blue-600">R{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="border-t border-gray-100 pt-4 text-sm text-gray-500">
              <p>Payment Method: <span className="font-medium capitalize">{order.payment_method}</span></p>
              <p>Payment Status: <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                {order.payment_status}
              </span></p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}