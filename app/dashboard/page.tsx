'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import { 
  ShoppingBag, 
  Package, 
  Heart, 
  User, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  Clock, 
  ChevronRight, 
  Eye,
  TrendingUp,
  Zap,
  RefreshCw
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDate, setCurrentDate] = useState<string>('')
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    wishlistCount: 0,
    pendingOrders: 0
  })

  // Update live time every second - 24 HOUR FORMAT
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-ZA', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
      }))
      setCurrentDate(now.toLocaleDateString('en-ZA', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }))
    }
    
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function loadDashboard() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (userData) setUser({ ...userData, email: session.user.email })

      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('email', session.user.email)
        .eq('status', 'unread')
      setUnreadMessages(msgCount || 0)

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('email', session.user.email)
        .order('created_at', { ascending: false })

      if (ordersData) {
        setOrders(ordersData)
        const totalSpent = ordersData.reduce((sum, order) => sum + order.total, 0)
        setStats({
          totalOrders: ordersData.length,
          totalSpent: totalSpent,
          wishlistCount: 3,
          pendingOrders: ordersData.filter(o => o.status === 'pending').length
        })
      }

      setLoading(false)
    }

    loadDashboard()
  }, [router, supabase])

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-[70vh] flex items-center justify-center bg-[#f8fafc]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f8fafc] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Premium Welcome Banner with Live Time */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-green-600 p-8 mb-8 shadow-2xl">
            <div className="absolute right-0 top-0 -mt-20 -mr-20 opacity-10">
              <svg className="w-80 h-80" fill="white" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50" />
              </svg>
            </div>
            <div className="absolute left-0 bottom-0 -mb-20 -ml-20 opacity-5">
              <svg className="w-64 h-64" fill="white" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50" />
              </svg>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-white/90 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Welcome
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-white/90 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Auto-refresh
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                  Welcome back, {user?.first_name || 'Customer'}! 👋
                </h1>
                <p className="text-blue-50/90 text-sm md:text-base">Here's what's happening with your account today.</p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <Calendar className="w-4 h-4 text-white/80" />
                  <span className="text-sm text-white/90">{currentDate}</span>
                  <span className="text-sm font-semibold text-white">{currentTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
              { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'blue' },
              { label: 'Total Spent', value: `R${stats.totalSpent.toFixed(2)}`, icon: DollarSign, color: 'green' },
              { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'yellow' },
              { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).getFullYear() : '2026', icon: Calendar, color: 'purple' },
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{item.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500">+12.5%</span>
                      <span className="text-xs text-gray-400">vs last month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 bg-${item.color}-50 rounded-xl flex items-center justify-center`}>
                    <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { href: '/orders', icon: Package, label: 'My Orders', desc: 'Track your orders', color: 'blue' },
              { href: '/wishlist', icon: Heart, label: 'Wishlist', desc: 'Saved items', color: 'pink' },
              { href: '/messages', icon: MessageSquare, label: 'Messages', desc: 'Your inbox', color: 'yellow' },
              { href: '/profile', icon: User, label: 'Profile', desc: 'Manage account', color: 'green' },
            ].map((item, index) => (
              <Link key={index} href={item.href} className="group relative bg-white rounded-xl p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 text-center overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full bg-${item.color}-500 transition-all group-hover:w-full group-hover:opacity-5`}></div>
                <div className={`w-14 h-14 bg-${item.color}-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-7 h-7 text-${item.color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{item.label}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                {item.href === '/messages' && unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-lg">
                    {unreadMessages}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="font-semibold text-gray-900 text-lg">Recent Orders</h2>
                <p className="text-xs text-gray-400">Your latest order activity</p>
              </div>
              <Link href="/orders" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 group">
                View all 
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            {orders.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No orders yet</p>
                <Link href="/" className="text-sm text-blue-600 hover:underline mt-2 inline-block">Start shopping →</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">#{order.order_number}</p>
                        <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 sm:mt-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {order.status || 'Pending'}
                      </span>
                      <span className="font-semibold text-blue-600 text-sm">R{order.total}</span>
                      <Link href={`/invoice/${order.id}`} className="text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}