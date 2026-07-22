'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../../../lib/supabase/client'
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Printer, 
  Mail,
  Phone,
  MapPin,
  User,
  CreditCard,
  RefreshCw,
  AlertCircle,
  Building,
  Calendar,
  FileText
} from 'lucide-react'

export default function OrderDetailsPage() {
  const params = useParams()
  const supabase = createClient()
  const orderId = params.id as string

  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [showTracking, setShowTracking] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  async function loadOrder() {
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderData) {
      setOrder(orderData)
      setTrackingNumber(orderData.tracking_number || '')
    }

    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)

    setItems(itemsData || [])
    setLoading(false)
  }

  const updateStatus = async (newStatus: string) => {
    setUpdating(true)
    await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
    
    setOrder({ ...order, status: newStatus })
    setUpdating(false)
  }

  const updateTracking = async () => {
    setUpdating(true)
    await supabase
      .from('orders')
      .update({ 
        tracking_number: trackingNumber,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
    
    setOrder({ ...order, tracking_number: trackingNumber })
    setShowTracking(false)
    setUpdating(false)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Order not found</h2>
        <Link href="/admin/orders" className="inline-block mt-4 text-blue-600 hover:underline">
          ← Back to orders
        </Link>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped: 'bg-purple-50 text-purple-700 border-purple-200',
    delivered: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200'
  }

  const statusIcons: Record<string, any> = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle
  }

  const StatusIcon = statusIcons[order.status] || Clock
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="space-y-6">
      {/* PROFESSIONAL INVOICE - Print Area */}
      <div id="print-area" className="hidden print:block">
        <div className="min-h-screen bg-white p-10 relative">
          {/* Background Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
            <div className="text-[300px] font-bold text-gray-900 select-none">N</div>
          </div>
          
          {/* Company Logo Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <img 
              src="/images/products/logo.jpg" 
              alt="NetApps"
              className="w-[500px] h-[500px] object-contain"
            />
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
            {/* Invoice Header */}
            <div className="border-b-4 border-blue-600 pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-500 rounded-xl flex items-center justify-center">
                      <img 
                        src="/images/products/logo.jpg" 
                        alt="NetApps"
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-800">
                        <span className="text-blue-600">Net</span>
                        <span className="text-green-500">Apps</span>
                      </h1>
                      <p className="text-sm text-gray-500">Development</p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600 space-y-0.5">
                    <p>125 Florence Nzama Street, Durban, 4001</p>
                    <p>Email: info@netappsdevelopment.com</p>
                    <p>Phone: 071 175 3994</p>
                    <p>VAT Registration: 1234567890</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-blue-50 px-6 py-3 rounded-lg border border-blue-200">
                    <h2 className="text-2xl font-bold text-gray-800">TAX INVOICE</h2>
                    <p className="text-sm text-gray-500">Invoice # {order.order_number}</p>
                  </div>
                  <div className="mt-3 text-sm text-gray-600 space-y-0.5">
                    <p className="flex items-center justify-end gap-2">
                      <Calendar className="w-4 h-4" />
                      Date: {new Date(order.created_at).toLocaleDateString('en-ZA', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="flex items-center justify-end gap-2">
                      <Clock className="w-4 h-4" />
                      Time: {new Date(order.created_at).toLocaleTimeString('en-ZA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="flex items-center justify-end gap-2">
                      <FileText className="w-4 h-4" />
                      Order Status: <span className="font-semibold capitalize">{order.status}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill To & Ship To */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
                <p className="font-semibold text-gray-800">{order.first_name} {order.last_name}</p>
                <p className="text-sm text-gray-600">{order.address}</p>
                <p className="text-sm text-gray-600">{order.city}, {order.province}</p>
                <p className="text-sm text-gray-600">{order.postal_code}</p>
                <p className="text-sm text-gray-600 mt-1">Email: {order.email}</p>
                <p className="text-sm text-gray-600">Phone: {order.phone}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Ship To</h3>
                <p className="font-semibold text-gray-800">{order.first_name} {order.last_name}</p>
                <p className="text-sm text-gray-600">{order.address}</p>
                <p className="text-sm text-gray-600">{order.city}, {order.province}</p>
                <p className="text-sm text-gray-600">{order.postal_code}</p>
                {trackingNumber && (
                  <p className="text-sm text-blue-600 mt-1">Tracking: {trackingNumber}</p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse mb-6">
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
                  <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Subtotal
                  </td>
                  <td className="px-4 py-2 text-right text-sm font-medium text-gray-800">
                    R {order.subtotal.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    VAT (15%)
                  </td>
                  <td className="px-4 py-2 text-right text-sm font-medium text-gray-800">
                    R {order.vat.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Delivery Fee
                  </td>
                  <td className="px-4 py-2 text-right text-sm font-medium text-gray-800">
                    R {order.delivery_fee.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-t-2 border-gray-800">
                  <td colSpan={3} className="px-4 py-3 text-right text-lg font-bold text-gray-800">
                    TOTAL
                  </td>
                  <td className="px-4 py-3 text-right text-lg font-bold text-blue-600">
                    R {order.total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Payment & Status */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium text-gray-800 capitalize">{order.payment_method}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Payment Status</p>
                <p className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.payment_status.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-800 pt-4 mt-6 text-center">
              <p className="text-sm font-medium text-gray-700">Thank you for your business!</p>
              <p className="text-xs text-gray-400 mt-1">This is a computer-generated invoice. No signature required.</p>
              <p className="text-xs text-gray-400 mt-1">All amounts are in South African Rand (ZAR)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Admin Content - Hidden when printing */}
      <div className="print:hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/orders" className="text-gray-500 hover:text-gray-700 transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.order_number}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  <StatusIcon className="w-3 h-3" />
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-gray-500">{totalItems} items</span>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <Printer className="w-4 h-4" />
              Print Invoice
            </button>
            <button
              onClick={loadOrder}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Status Update Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-sm text-gray-500">Current Status</p>
              <div className="flex items-center gap-3 mt-1">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  <StatusIcon className="w-4 h-4" />
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
                {order.payment_status === 'paid' && (
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">Paid</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {order.status === 'pending' && (
                <button
                  onClick={() => updateStatus('processing')}
                  disabled={updating}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  Process Order
                </button>
              )}
              {order.status === 'processing' && (
                <button
                  onClick={() => updateStatus('shipped')}
                  disabled={updating}
                  className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50"
                >
                  Mark as Shipped
                </button>
              )}
              {order.status === 'shipped' && (
                <button
                  onClick={() => updateStatus('delivered')}
                  disabled={updating}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                >
                  Mark as Delivered
                </button>
              )}
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <button
                  onClick={() => {
                    if (confirm('Cancel this order?')) updateStatus('cancelled')
                  }}
                  disabled={updating}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tracking Number */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tracking Number</p>
              <p className="text-sm font-medium text-gray-800">
                {order.tracking_number || 'Not assigned yet'}
              </p>
            </div>
            <button
              onClick={() => setShowTracking(!showTracking)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showTracking ? 'Cancel' : 'Add Tracking'}
            </button>
          </div>
          {showTracking && (
            <div className="mt-4 flex gap-3">
              <input
                type="text"
                placeholder="Enter tracking number..."
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={updateTracking}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* 3 Column Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-800">Customer</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-800">{order.first_name} {order.last_name}</p>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {order.email}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                {order.phone}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-gray-800">Delivery</h3>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-gray-800 font-medium">{order.first_name} {order.last_name}</p>
              <p className="text-gray-600">{order.address}</p>
              <p className="text-gray-600">{order.city}, {order.province}</p>
              <p className="text-gray-600">{order.postal_code}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-gray-800">Payment</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-800 capitalize">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.payment_status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-blue-600">R{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Order Items</h3>
            <span className="text-sm text-gray-500">{totalItems} items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Product</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Qty</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">Unit Price</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className={index !== items.length - 1 ? 'border-b border-gray-100' : ''}>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">R{item.unit_price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-800">R{item.total_price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t">
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    Subtotal
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    R{order.subtotal.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    VAT (15%)
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    R{order.vat.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    Delivery
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    R{order.delivery_fee.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-t-2 border-gray-300">
                  <td colSpan={3} className="px-6 py-4 text-right text-lg font-bold text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-4 text-right text-lg font-bold text-blue-600">
                    R{order.total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-sm text-gray-400 border-t border-gray-100 pt-4">
          <span>Order ID: {order.id}</span>
          <span>Last updated: {new Date(order.updated_at).toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}