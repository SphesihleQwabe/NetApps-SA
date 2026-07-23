'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '../../../lib/supabase/client'
import Link from 'next/link'
import { 
  Search, Eye, Truck, CheckCircle, XCircle, Clock, 
  Printer, Download, RefreshCw,
  Package, User, Mail, MapPin,
  Edit, Save, X, CreditCard
} from 'lucide-react'
import OrderTimeline from '../../components/OrderTimeline'

interface Order {
  id: string
  order_number: string
  customer_name: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postal_code: string
  total: number
  status: string
  payment_status: string
  created_at: string
  tracking_number?: string
  notes?: string
}

export default function AdminOrders() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [editingTracking, setEditingTracking] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [updating, setUpdating] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])

  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

  const loadOrders = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setOrders(data || [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadOrders() }, [loadOrders])

  const loadOrderItems = async (orderId: string) => {
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
    setOrderItems(data || [])
  }

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order)
    setTrackingNumber(order.tracking_number || '')
    setEditingTracking(false)
    await loadOrderItems(order.id)
    setShowDetails(true)
  }

  // 🔥 UPDATED: Auto-generate tracking AND log status changes
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true)
    
    // Get current order for old status
    const currentOrder = orders.find(o => o.id === orderId)
    const oldStatus = currentOrder?.status || 'pending'
    
    let trackingNumber = null
    if ((newStatus === 'processing' || newStatus === 'shipped') && !currentOrder?.tracking_number) {
      const timestamp = Date.now().toString().slice(-6)
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      trackingNumber = `TC-${timestamp}${random}`
    }
    
    const updateData: any = { status: newStatus }
    if (trackingNumber) {
      updateData.tracking_number = trackingNumber
    }
    
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (!error) {
      // ✅ Log status change
      await supabase
        .from('order_activities')
        .insert({
          order_id: orderId,
          action: 'status_update',
          description: `Order status changed from ${oldStatus} to ${newStatus}`,
          status_from: oldStatus,
          status_to: newStatus,
          metadata: trackingNumber ? { tracking_number: trackingNumber } : null
        })

      setToast({ 
        message: trackingNumber 
          ? `✅ Tracking: ${trackingNumber}` 
          : `Order status updated to ${newStatus}`, 
        type: 'success' 
      })
      loadOrders()
      if (selectedOrder) {
        setSelectedOrder({ 
          ...selectedOrder, 
          status: newStatus, 
          tracking_number: trackingNumber || selectedOrder.tracking_number 
        })
      }
    } else {
      setToast({ message: 'Failed to update order status', type: 'error' })
    }
    setUpdating(false)
  }

  // Update Payment Status
  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true)
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: newStatus })
      .eq('id', orderId)

    if (!error) {
      // ✅ Log payment status change
      await supabase
        .from('order_activities')
        .insert({
          order_id: orderId,
          action: 'payment_updated',
          description: `Payment status changed to ${newStatus}`,
          status_to: newStatus
        })

      setToast({ message: `Payment status updated to ${newStatus}`, type: 'success' })
      loadOrders()
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, payment_status: newStatus })
      }
    } else {
      setToast({ message: 'Failed to update payment status', type: 'error' })
    }
    setUpdating(false)
  }

  const updateTrackingNumber = async () => {
    if (!selectedOrder) return
    setUpdating(true)
    const { error } = await supabase
      .from('orders')
      .update({ tracking_number: trackingNumber })
      .eq('id', selectedOrder.id)

    if (!error) {
      // ✅ Log tracking number update
      await supabase
        .from('order_activities')
        .insert({
          order_id: selectedOrder.id,
          action: 'tracking_updated',
          description: `Tracking number updated to ${trackingNumber}`,
          metadata: { tracking_number: trackingNumber }
        })

      setToast({ message: 'Tracking number updated', type: 'success' })
      setEditingTracking(false)
      loadOrders()
      setSelectedOrder({ ...selectedOrder, tracking_number: trackingNumber })
    } else {
      setToast({ message: 'Failed to update tracking', type: 'error' })
    }
    setUpdating(false)
  }

  const getStatusConfig = (status: string) => {
    const map: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-gray-100 text-gray-600', icon: <Clock className="w-4 h-4" /> },
      processing: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4" /> },
      shipped: { color: 'bg-blue-100 text-blue-700', icon: <Truck className="w-4 h-4" /> },
      delivered: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
      cancelled: { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> },
    }
    return map[status] || map.pending
  }

  const filteredOrders = orders.filter(order => {
    const matchSearch = order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       order.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter ? order.status === statusFilter : true
    return matchSearch && matchStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-blue-600" size={24} />
            Order Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {orders.length} total orders
            {' | '}
            <span className="text-yellow-600">{orders.filter(o => o.status === 'pending').length}</span> pending
            {' | '}
            <span className="text-blue-600">{orders.filter(o => o.status === 'shipped').length}</span> shipped
            {' | '}
            <span className="text-green-600">{orders.filter(o => o.status === 'delivered').length}</span> delivered
          </p>
        </div>
        <button onClick={loadOrders} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 min-w-[160px]"
        >
          <option value="">All Status</option>
          {statusOptions.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Order</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Total</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Payment</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No orders found</td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const status = getStatusConfig(order.status)
                  return (
                    <tr key={order.id} className="border-b hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-800">#{order.order_number?.slice(0, 8)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{order.customer_name}</p>
                          <p className="text-sm text-gray-500">{order.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                        R{order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${status.color}`}>
                          {status.icon}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.payment_status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {order.payment_status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleViewOrder(order)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="text-blue-600" size={20} />
                Order #{selectedOrder.order_number}
              </h2>
              <button onClick={() => setShowDetails(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={24} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-4 items-center">
                {/* Order Status */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    disabled={updating}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {/* Payment Status Update */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Payment:</span>
                  <select
                    value={selectedOrder.payment_status || 'pending'}
                    onChange={(e) => updatePaymentStatus(selectedOrder.id, e.target.value)}
                    disabled={updating}
                    className={`px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${
                      selectedOrder.payment_status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                {/* Tracking Display */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Tracking:</span>
                  {selectedOrder.tracking_number ? (
                    <span className="text-sm font-semibold text-blue-600">{selectedOrder.tracking_number}</span>
                  ) : (
                    <span className="text-sm text-gray-400">Will be generated when order is processed or shipped</span>
                  )}
                  <button onClick={() => setEditingTracking(true)} className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit size={16} />
                  </button>
                </div>
              </div>

              {/* Edit Tracking Modal */}
              {editingTracking && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={updateTrackingNumber} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                      <Save size={18} />
                    </button>
                    <button onClick={() => setEditingTracking(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 text-sm mb-2 flex items-center gap-2">
                    <User size={16} /> Customer
                  </h3>
                  <p className="text-gray-800">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><Mail size={14} /> {selectedOrder.email}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 text-sm mb-2 flex items-center gap-2">
                    <MapPin size={16} /> Delivery Address
                  </h3>
                  <p className="text-gray-800">{selectedOrder.address}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.city}, {selectedOrder.province}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.postal_code}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 text-sm mb-3">Order Items</h3>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        {item.product_image ? (
                          <img src={item.product_image} alt={item.product_name} className="w-12 h-12 object-contain" />
                        ) : (
                          <Package size={24} className="text-gray-300" />
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

              <div className="border-t border-gray-100 pt-4 flex justify-end">
                <div className="w-64 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>R{selectedOrder.total.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span>R0.00</span></div>
                  <div className="flex justify-between font-bold text-lg border-t pt-1">
                    <span>Total</span>
                    <span className="text-blue-600">R{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* ✅ ORDER TIMELINE */}
              <div className="border-t border-gray-100 pt-4">
                <OrderTimeline orderId={selectedOrder.id} />
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                <Link href={`/invoice/${selectedOrder.id}`} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                  <Eye size={16} /> View Invoice
                </Link>
                <Link href={`/invoice/${selectedOrder.id}`} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm">
                  <Printer size={16} /> Print
                </Link>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm">
                  <Download size={16} /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}