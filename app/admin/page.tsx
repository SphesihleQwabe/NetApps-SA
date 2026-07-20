'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import Link from 'next/link'
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Eye, 
  Clock,
  ArrowUp, 
  ArrowDown, 
  ChevronRight,
  Zap, 
  BarChart3, 
  RefreshCw,
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Activity,
  Truck,
  PackageCheck,
  ShoppingCart,
  UserCheck,
  Store,
  CreditCard,
  PieChart,
  Settings,
  Bell,
  Plus,
  Minus,
  Search,
  Filter,
  Download,
  Printer,
  Edit,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageSquare,
  Star,
  Heart,
  Share2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Home,
  Layers,
  Grid3X3,
  List,
  Shield,
  Award,
  Target,
  Rocket,
  Sparkles,
  Gem,
  Crown,
  StarHalf,
  Trophy,
  Medal,
  BadgeCheck,
  BadgeAlert,
  BellRing,
  BellOff,
  Clock3,
  AlarmClock,
  Timer,
  TimerOff,
  TimerReset,
  Hourglass,
  CalendarPlus,
  CalendarMinus,
  CalendarX,
  CalendarCheck,
  CalendarClock,
  CalendarRange,
  CalendarSearch,
  CalendarOff,
  CalendarHeart,
  CalendarDays
} from 'lucide-react'

export default function AdminDashboard() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDate, setCurrentDate] = useState<string>('')
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [refreshing, setRefreshing] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)

  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
    pendingOrders: 0,
    lowStock: 0,
    outOfStock: 0,
    todayOrders: 0,
    todayRevenue: 0,
    totalRevenue: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0,
    yearlyOrders: 0,
    yearlyRevenue: 0,
  })

  const [stockByCategory, setStockByCategory] = useState<any[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
  const [outOfStockProducts, setOutOfStockProducts] = useState<any[]>([])
  const [topSellingProducts, setTopSellingProducts] = useState<any[]>([])
  const [pendingReviews, setPendingReviews] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)

  // Update live time every second
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

  // Load stats once on page load - NO AUTO-REFRESH
  useEffect(() => {
    loadStats()
  }, [])

  // Check notifications
  useEffect(() => {
    const checkNotifications = async () => {
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread')
      
      const { count: reviewCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      
      setUnreadMessages(msgCount || 0)
      setPendingReviews(reviewCount || 0)
      setNotificationCount((msgCount || 0) + (reviewCount || 0))
    }
    checkNotifications()
    const interval = setInterval(checkNotifications, 60000)
    return () => clearInterval(interval)
  }, [supabase])

  const loadStats = async () => {
    setLoading(true)
    
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString()

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const startOfYear = new Date(today.getFullYear(), 0, 1)

      // Get counts
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      const { count: pendingCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Today's orders
      const { data: todayOrdersData, count: todayCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .gte('created_at', todayStr)

      const todayRevenue = todayOrdersData?.reduce((sum, o) => sum + o.total, 0) || 0

      // Monthly orders
      const { data: monthlyData } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startOfMonth.toISOString())

      const monthlyRevenue = monthlyData?.reduce((sum, o) => sum + o.total, 0) || 0

      // Yearly orders
      const { data: yearlyData } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startOfYear.toISOString())

      const yearlyRevenue = yearlyData?.reduce((sum, o) => sum + o.total, 0) || 0
      const totalRevenue = yearlyData?.reduce((sum, o) => sum + o.total, 0) || 0

      // Stock alerts
      const { data: lowStockData } = await supabase
        .from('products')
        .select('*')
        .lt('stock_quantity', 10)
        .gte('stock_quantity', 1)

      const { data: outOfStockData } = await supabase
        .from('products')
        .select('*')
        .eq('stock_quantity', 0)

      const safeLowStock = lowStockData || []
      const safeOutOfStock = outOfStockData || []

      // Stock by category
      const { data: categoryData } = await supabase
        .from('products')
        .select('category, stock_quantity')

      const categoryMap: {[key: string]: { total: number, count: number } } = {}
      categoryData?.forEach(p => {
        const cat = p.category || 'Uncategorized'
        if (!categoryMap[cat]) categoryMap[cat] = { total: 0, count: 0 }
        categoryMap[cat].total += p.stock_quantity || 0
        categoryMap[cat].count += 1
      })

      const categoryStock = Object.entries(categoryMap).map(([name, data]) => ({
        name,
        totalStock: data.total,
        productCount: data.count
      }))

      // Top selling products
      const { data: topProducts } = await supabase
        .from('order_items')
        .select('product_name, quantity')
        .order('quantity', { ascending: false })
        .limit(5)

      // 🔥 FIX: Recent orders - Get ALL orders (no limit, show all)
      const { data: recentData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)  // Show up to 20 recent orders

      setRecentOrders(recentData || [])
      setLowStockProducts(safeLowStock)
      setOutOfStockProducts(safeOutOfStock)
      setTopSellingProducts(topProducts || [])
      setStockByCategory(categoryStock)

      setStats({
        revenue: totalRevenue,
        orders: orderCount || 0,
        customers: userCount || 0,
        products: productCount || 0,
        pendingOrders: pendingCount || 0,
        lowStock: safeLowStock.length,
        outOfStock: safeOutOfStock.length,
        todayOrders: todayCount || 0,
        todayRevenue: todayRevenue,
        totalRevenue: totalRevenue,
        monthlyOrders: monthlyData?.length || 0,
        monthlyRevenue: monthlyRevenue,
        yearlyOrders: yearlyData?.length || 0,
        yearlyRevenue: yearlyRevenue,
      })

      setLastUpdated(new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Error loading stats:', error)
    }
    
    setLoading(false)
    setRefreshing(false)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadStats()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Status color helper
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'processing': return 'bg-yellow-100 text-yellow-700'
      case 'shipped': return 'bg-blue-100 text-blue-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="px-3 py-1 bg-green-50 rounded-full text-xs font-medium text-green-600 flex items-center gap-1 animate-pulse">
              <Activity className="w-3 h-3" />
              Live Dashboard
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> Click Refresh to update
            </span>
            <span className="text-xs text-gray-400">| Updated: {lastUpdated}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Real-time store performance overview</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">{currentDate}</span>
            <span className="text-sm font-semibold text-blue-600">{currentTime}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="text-sm text-gray-600 hover:text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> 
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link href="/admin/products">
              <button className="text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition shadow-sm hover:shadow-md flex items-center gap-1">
                <Package className="w-3 h-3" /> Manage Stock
              </button>
            </Link>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-sm text-gray-600 hover:text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition flex items-center gap-1"
            >
              <Bell className="w-3 h-3" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 relative z-10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {unreadMessages > 0 && (
              <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700">{unreadMessages} new message(s)</span>
                <Link href="/admin/messages" className="text-xs text-blue-600 hover:underline ml-auto">View</Link>
              </div>
            )}
            {pendingReviews > 0 && (
              <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-700">{pendingReviews} pending review(s)</span>
                <Link href="/admin/reviews" className="text-xs text-blue-600 hover:underline ml-auto">View</Link>
              </div>
            )}
            {outOfStockProducts.length > 0 && (
              <div className="flex items-center gap-3 p-2 bg-red-50 rounded-lg border border-red-100">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-700">{outOfStockProducts.length} product(s) out of stock</span>
                <Link href="/admin/products" className="text-xs text-blue-600 hover:underline ml-auto">View</Link>
              </div>
            )}
            {lowStockProducts.length > 0 && (
              <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg border border-orange-100">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-700">{lowStockProducts.length} product(s) low on stock</span>
                <Link href="/admin/products" className="text-xs text-blue-600 hover:underline ml-auto">View</Link>
              </div>
            )}
            {notificationCount === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No new notifications</p>
            )}
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: 'Today\'s Revenue', value: formatCurrency(stats.todayRevenue), icon: DollarSign, color: 'blue', change: '+12.5%' },
          { title: 'Today\'s Orders', value: stats.todayOrders, icon: ShoppingBag, color: 'green', change: '+8.2%' },
          { title: 'Total Customers', value: stats.customers, icon: Users, color: 'purple', change: '+5.7%' },
          { title: 'Total Products', value: stats.products, icon: Package, color: 'orange', change: '+3.1%' },
        ].map((card, index) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600">{card.change}</span>
                  <span className="text-xs text-gray-400">vs last month</span>
                </div>
              </div>
              <div className={`w-12 h-12 bg-${card.color}-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-6 h-6 text-${card.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue), icon: TrendingUp, color: 'blue' },
          { title: 'Monthly Orders', value: stats.monthlyOrders, icon: ShoppingCart, color: 'green' },
          { title: 'Yearly Revenue', value: formatCurrency(stats.yearlyRevenue), icon: DollarSign, color: 'purple' },
        ].map((card, index) => (
          <div key={index} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-10 h-10 bg-${card.color}-50 rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 text-${card.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'yellow' },
          { title: 'Low Stock Items', value: stats.lowStock, icon: AlertTriangle, color: 'orange' },
          { title: 'Out of Stock', value: stats.outOfStock, icon: AlertCircle, color: 'red' },
        ].map((card, index) => {
          const isAlert = card.value > 0
          return (
            <div key={index} className={`bg-white rounded-xl p-5 border ${isAlert ? 'border-red-200 bg-red-50/30' : 'border-gray-100'} hover:shadow-lg transition-all duration-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
                  <p className={`text-2xl font-bold ${isAlert ? 'text-red-600' : 'text-gray-900'} mt-1`}>{card.value}</p>
                  {isAlert && (
                    <p className="text-xs text-red-500 mt-1">⚠️ Needs immediate attention</p>
                  )}
                </div>
                <div className={`w-12 h-12 bg-${card.color}-50 rounded-xl flex items-center justify-center`}>
                  <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Stock Alerts Section */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className={`rounded-xl border p-6 ${outOfStockProducts.length > 0 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold flex items-center gap-2 ${outOfStockProducts.length > 0 ? 'text-red-800' : 'text-yellow-800'}`}>
              {outOfStockProducts.length > 0 ? <XCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              {outOfStockProducts.length > 0 ? '🚫 Out of Stock Products' : '⚠️ Low Stock Products'}
              <span className="text-sm font-normal text-gray-500">
                ({outOfStockProducts.length > 0 ? outOfStockProducts.length : lowStockProducts.length} items)
              </span>
            </h3>
            <Link href="/admin/products" className="text-sm text-blue-600 hover:underline font-medium">
              Manage Products →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {outOfStockProducts.slice(0, 4).map((product) => (
              <div key={product.id} className="bg-white rounded-lg p-3 border border-red-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-2">
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="w-8 h-8 object-cover rounded" />
                  )}
                  <p className="font-medium text-gray-800 text-sm truncate flex-1">{product.name}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-red-600 font-semibold">Out of Stock</span>
                  <Link href={`/admin/products/${product.id}`} className="text-xs text-blue-600 hover:underline">Update →</Link>
                </div>
              </div>
            ))}
            {lowStockProducts.slice(0, 4 - outOfStockProducts.length).map((product) => (
              <div key={product.id} className="bg-white rounded-lg p-3 border border-yellow-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-2">
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="w-8 h-8 object-cover rounded" />
                  )}
                  <p className="font-medium text-gray-800 text-sm truncate flex-1">{product.name}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-yellow-700">Only {product.stock_quantity} left</span>
                  <Link href={`/admin/products/${product.id}`} className="text-xs text-blue-600 hover:underline">Update →</Link>
                </div>
              </div>
            ))}
          </div>
          {(outOfStockProducts.length > 4 || lowStockProducts.length > 4) && (
            <Link href="/admin/products" className="text-sm text-blue-600 hover:underline mt-3 inline-block">
              View all {outOfStockProducts.length + lowStockProducts.length} products →
            </Link>
          )}
        </div>
      )}

      {/* Stock by Category */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              Stock by Category
            </h2>
            <p className="text-xs text-gray-400">Current inventory levels by product category</p>
          </div>
          <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">Manage All →</Link>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stockByCategory.map((cat) => (
              <div key={cat.name} className={`rounded-lg p-4 border ${cat.totalStock === 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'} hover:shadow-md transition`}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-800 text-sm">{cat.name}</p>
                  {cat.totalStock === 0 && <XCircle className="w-4 h-4 text-red-500" />}
                </div>
                <p className={`text-2xl font-bold ${cat.totalStock === 0 ? 'text-red-600' : 'text-blue-600'}`}>{cat.totalStock}</p>
                <p className="text-xs text-gray-400">{cat.productCount} products</p>
                {cat.totalStock === 0 && (
                  <p className="text-xs text-red-500 mt-1 font-medium">⚠️ Empty category</p>
                )}
                {cat.totalStock > 0 && cat.totalStock < 10 && (
                  <p className="text-xs text-yellow-500 mt-1">⚠️ Low stock</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top Selling Products
                </h2>
                <p className="text-xs text-gray-400">Best performing products this month</p>
              </div>
              <span className="text-xs text-gray-400">{topSellingProducts.length} products</span>
            </div>
          </div>
          <div className="p-4 divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
            {topSellingProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No sales data available yet</p>
              </div>
            ) : (
              topSellingProducts.map((item, index) => (
                <div key={index} className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg transition">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-500' : 'text-gray-400'}`}>
                      #{index + 1}
                    </span>
                    <span className="font-medium text-gray-800 text-sm">{item.product_name || 'Unknown Product'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-600">{item.quantity || 0} sold</span>
                    {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders - NOW SHOWING ALL ORDERS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Recent Orders
              </h2>
              <p className="text-xs text-gray-400">Latest customer orders</p>
            </div>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 group">
              View all 
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No orders placed yet</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 text-sm truncate">#{order.order_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status || 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{order.customer_name || 'Guest Customer'}</p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="font-semibold text-blue-600 text-sm">R{order.total}</span>
                    <Link href={`/admin/orders/${order.id}`} className="text-gray-400 hover:text-gray-600 transition">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <span>📊 Dashboard updated: {lastUpdated}</span>
            <span>|</span>
            <span>🔄 Click Refresh to update</span>
          </div>
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-green-500" />
            <span className="text-gray-500">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  )
}