'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import Link from 'next/link'
import { Printer, ArrowLeft } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Order Not Found</h1>
          <Link href="/" className="text-blue-600 mt-4 inline-block">Go Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header Bar - Hidden when printing */}
      <div className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/admin/orders" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 print:py-4">
        <div className="bg-white rounded-xl shadow-sm p-8 print:shadow-none print:p-4 relative overflow-hidden">
          {/* Background Watermark Logo */}
          <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none print:opacity-[0.02]">
            <img 
              src="/images/products/logo.jpg"
              alt="NetApps Development"
              className="object-contain w-[80%] h-[80%] max-w-3xl mx-auto"
            />
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="border-b-2 border-blue-600 pb-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-green-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      N
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">
                        <span className="text-blue-600">Net</span>
                        <span className="text-green-500">Apps</span>
                      </h1>
                      <p className="text-sm text-gray-500">Development</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    125 Florence Nzama Street, Durban, 4001
                  </p>
                  <p className="text-sm text-gray-500">📧 info@netappsdevelopment.com</p>
                  <p className="text-sm text-gray-500">📞 071 175 3994</p>
                </div>
                <div className="text-right">
                  <div className="bg-blue-50 px-6 py-3 rounded-lg border border-blue-200">
                    <h2 className="text-2xl font-bold text-gray-800">TAX INVOICE</h2>
                    <p className="text-sm text-gray-500"># {order.order_number}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bill To</h3>
                <p className="font-semibold text-gray-800">{order.first_name} {order.last_name}</p>
                <p className="text-sm text-gray-600">{order.email}</p>
                <p className="text-sm text-gray-600">{order.phone}</p>
                <p className="text-sm text-gray-600">{order.address}</p>
                <p className="text-sm text-gray-600">{order.city}, {order.province}</p>
                <p className="text-sm text-gray-600">{order.postal_code}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Order Details</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-600' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {order.payment_status || 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Method</span>
                    <span className="font-medium capitalize">{order.payment_method || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="px-4 py-3 text-left text-sm font-bold">Description</th>
                    <th className="px-4 py-3 text-center text-sm font-bold">Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-bold">Unit Price</th>
                    <th className="px-4 py-3 text-right text-sm font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className={index !== items.length - 1 ? 'border-b border-gray-200' : ''}>
                      <td className="px-4 py-3 text-sm text-gray-800">{item.product_name}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">R {item.unit_price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-800">R {item.total_price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-gray-600">Subtotal</td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-gray-800">R {order.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-gray-600">VAT (15%)</td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-gray-800">R {order.vat.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-gray-600">Delivery Fee</td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-gray-800">R {order.delivery_fee.toFixed(2)}</td>
                  </tr>
                  {order.discount > 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-green-600">Discount</td>
                      <td className="px-4 py-2 text-right text-sm font-medium text-green-600">-R {order.discount.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-gray-800">
                    <td colSpan={3} className="px-4 py-3 text-right text-lg font-bold text-gray-800">TOTAL</td>
                    <td className="px-4 py-3 text-right text-lg font-bold text-blue-600">R {order.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-800 pt-4 mt-4 text-center">
              <p className="text-sm font-medium text-gray-700">Thank you for your business!</p>
              <p className="text-xs text-gray-400 mt-1">All amounts are in South African Rand (ZAR)</p>
              <p className="text-xs text-gray-400">This is a computer-generated invoice.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-4 {
            padding: 1rem !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .bg-gray-800 {
            background-color: #1f2937 !important;
            color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .border-t-2 {
            border-top-width: 2px !important;
          }
          .border-gray-800 {
            border-color: #1f2937 !important;
          }
          .text-blue-600 {
            color: #2563eb !important;
          }
          .bg-blue-50 {
            background-color: #eff6ff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-gray-50 {
            background-color: #f9fafb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-green-100 {
            background-color: #dcfce7 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-yellow-100 {
            background-color: #fef3c7 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-blue-100 {
            background-color: #dbeafe !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-red-100 {
            background-color: #fee2e2 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-gray-100 {
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .border-b-2 {
            border-bottom-width: 2px !important;
          }
          .border-blue-600 {
            border-color: #2563eb !important;
          }
          td, th {
            border: 1px solid #ddd !important;
            padding: 6px 10px !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .absolute {
            display: none !important;
          }
          .rounded-xl {
            border-radius: 0 !important;
          }
          .shadow-sm {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  )
}