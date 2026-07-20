'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import { 
  Package, Eye, Calendar, CreditCard, Truck, 
  CheckCircle, XCircle, Clock,
  Printer, RotateCcw, Star,
  ChevronDown, ChevronUp, ShoppingBag
} from 'lucide-react'

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  created_at: string
  payment_status: string
  delivery_address: string
  tracking_number?: string
  items?: OrderItem[]
}

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  product_image?: string
}

export default function OrdersPage() {
  const router = useRouter()
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({})
  const [user, setUser] = useState<any>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusConfig = (status: string) => {
    const statusMap: Record<string, { color: string; icon: any; label: string }> = {
      pending: { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: <Clock className="w-4 h-4" />, label: 'Pending' },
      processing: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock className="w-4 h-4" />, label: 'Processing' },
      shipped: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Truck className="w-4 h-4" />, label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle className="w-4 h-4" />, label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="w-4 h-4" />, label: 'Cancelled' },
    }
    return statusMap[status] || statusMap.pending
  }

  const loadOrders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login?redirect=orders')
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('email', session.user.email)
      .single()
    if (userData) setUser(userData)

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('email', session.user.email)
      .order('created_at', { ascending: false })

    if (ordersData) {
      setOrders(ordersData)
      for (const order of ordersData) {
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id)
        setOrderItems(prev => ({ ...prev, [order.id]: items || [] }))
      }
    }
    setLoading(false)
  }, [supabase, router])

  useEffect(() => { loadOrders() }, [loadOrders])

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
    if (!error) {
      setToast({ message: 'Order cancelled successfully', type: 'success' })
      loadOrders()
    } else {
      setToast({ message: 'Failed to cancel order', type: 'error' })
    }
  }

  const handleReorder = (order: Order) => {
    const items = orderItems[order.id] || []
    items.forEach(item => {
      console.log('Adding to cart:', item)
    })
    setToast({ message: 'Items added to cart', type: 'success' })
  }

  const statusTimeline = ['pending', 'processing', 'shipped', 'delivered']

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-10 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] flex items-center justify-center pointer-events-none">
          <img src="/images/products/logo.jpg" alt="NetApps" className="object-contain w-[70%] h-[70%] max-w-5xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          {toast && (
            <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
              {toast.message}
            </div>
          )}

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                  <ShoppingBag className="text-blue-600" size={28} />
                  My Orders
                </h1>
                <p className="text-gray-500 mt-1">{orders.length} orders total</p>
              </div>
              <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
                Continue Shopping
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📦</div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">No Orders Yet</h2>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">You haven't placed any orders yet. Start shopping!</p>
                <Link href="/" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all inline-block font-medium">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const statusConfig = getStatusConfig(order.status)
                  const items = orderItems[order.id] || []
                  const isExpanded = expandedOrder === order.id
                  
                  return (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
                      <div 
                        className="p-6 cursor-pointer hover:bg-gray-50/50 transition"
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                              #{order.order_number?.slice(-6)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">Order #{order.order_number}</p>
                              <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusConfig.color}`}>
                              {statusConfig.icon}
                              {statusConfig.label}
                            </span>
                            <span className="text-lg font-bold text-blue-600">R{order.total.toFixed(2)}</span>
                            {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-gray-100">
                          <div className="py-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Order Status</h4>
                            <div className="flex items-center gap-2">
                              {statusTimeline.map((step, index) => {
                                const currentIndex = statusTimeline.indexOf(order.status)
                                const isCompleted = currentIndex >= index
                                return (
                                  <div key={step} className="flex items-center">
                                    <div className={`flex items-center gap-2 ${!isCompleted ? 'opacity-50' : ''}`}>
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                        isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                      }`}>
                                        {index + 1}
                                      </div>
                                      <span className={`text-xs font-medium ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {step.charAt(0).toUpperCase() + step.slice(1)}
                                      </span>
                                    </div>
                                    {index < statusTimeline.length - 1 && (
                                      <div className={`w-8 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          <div className="space-y-3">
                            {items.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
                                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                                  {item.product_image ? (
                                    <img src={item.product_image} alt={item.product_name} className="w-12 h-12 object-contain" />
                                  ) : (
                                    <Package size={24} className="text-gray-300" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800">{item.product_name}</p>
                                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-800">R{item.total_price.toFixed(2)}</p>
                                  <p className="text-sm text-gray-500">R{item.unit_price.toFixed(2)} each</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                            <Link href={`/invoice/${order.id}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                              <Eye size={16} /> View Invoice
                            </Link>
                            <Link href={`/invoice/${order.id}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                              <Printer size={16} /> Print
                            </Link>
                            {order.status === 'pending' && (
                              <button onClick={() => handleCancelOrder(order.id)} className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium">
                                <XCircle size={16} /> Cancel Order
                              </button>
                            )}
                            {order.status === 'delivered' && (
                              <Link href={`/product/${order.id}/review`} className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 text-sm font-medium">
                                <Star size={16} /> Write Review
                              </Link>
                            )}
                            <button onClick={() => handleReorder(order)} className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium">
                              <RotateCcw size={16} /> Reorder
                            </button>
                          </div>

                          {order.tracking_number && (
                            <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-100">
                              <p className="text-sm text-blue-700 flex items-center gap-2">
                                <Truck size={16} />
                                Tracking: <span className="font-medium">{order.tracking_number}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}