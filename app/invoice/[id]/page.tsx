'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Link from 'next/link'

interface Order {
  id: string
  order_number: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postal_code: string
  subtotal: number
  vat: number
  delivery_fee: number
  discount: number
  total: number
  status: string
  payment_method: string
  payment_status: string
  created_at: string
}

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadInvoice() {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', params.id)
          .single()

        if (orderError || !orderData) {
          router.push('/')
          return
        }

        setOrder(orderData)

        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', params.id)

        setItems(itemsData || [])
      } catch (error) {
        console.error('Error loading invoice:', error)
        router.push('/')
      }
      setLoading(false)
    }

    loadInvoice()
  }, [params.id, router])

  const handlePrint = () => {
    window.print()
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

  if (!order) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Order Not Found</h1>
            <Link href="/" className="text-blue-600 mt-4 inline-block">Go Home</Link>
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
        <div className="max-w-4xl mx-auto px-4">
          {/* Print Button */}
          <div className="flex justify-end mb-4 no-print">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              🖨️ Print Invoice
            </button>
          </div>

          {/* Invoice */}
          <div className="bg-white rounded-xl shadow-sm p-8 print:shadow-none print:p-4 relative overflow-hidden">
            {/* Background Logo */}
            <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none print:opacity-[0.03]">
              <img 
                src="/images/products/logo.jpg"
                alt="NetApps Development"
                className="object-contain w-[80%] h-[80%] max-w-3xl mx-auto"
              />
            </div>
            
            {/* Content - Keep above background */}
            <div className="relative z-10">
              {/* Header */}
              <div className="border-b pb-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                        N
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-gray-800">NetApps Development</h1>
                        <p className="text-gray-500">A Better Digital Experience</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      125 Florence Nzama Street, North Beach, Durban, 4001
                    </p>
                    <p className="text-sm text-gray-500">📧 info@netappsdevelopment.com</p>
                    <p className="text-sm text-gray-500">📞 071 175 3994</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-bold text-blue-600">INVOICE</h2>
                    <p className="text-sm text-gray-500">#{order.order_number}</p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(order.created_at).toLocaleDateString('en-ZA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Bill To:</h3>
                  <p className="font-medium text-gray-800">{order.first_name} {order.last_name}</p>
                  <p className="text-gray-600">{order.email}</p>
                  <p className="text-gray-600">{order.phone}</p>
                  <p className="text-gray-600">{order.address}</p>
                  <p className="text-gray-600">{order.city}, {order.province}</p>
                  <p className="text-gray-600">{order.postal_code}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-semibold text-gray-700 mb-2">Order Details:</h3>
                  <p className="text-sm text-gray-600">Status: 
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-600' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">Payment: 
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {order.payment_status || 'Pending'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">Method: {order.payment_method || 'N/A'}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Description</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Quantity</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Unit Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-3 text-sm text-gray-800">{item.product_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">R{item.unit_price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">R{item.total_price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-800">R{order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">VAT (15%)</span>
                      <span className="text-gray-800">R{order.vat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="text-gray-800">R{order.delivery_fee.toFixed(2)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount</span>
                        <span className="text-red-500">-R{order.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total</span>
                      <span className="text-blue-600">R{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t mt-6 pt-4 text-center text-sm text-gray-400">
                <p>Thank you for shopping with NetApps Development!</p>
                <p className="mt-1">This is a computer-generated invoice. No signature required.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}