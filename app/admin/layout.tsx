'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../lib/supabase/client'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // Notification counts
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [pendingReviews, setPendingReviews] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)

  // Load notification counts
  const loadNotificationCounts = async () => {
    try {
      // Count unread messages
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread')
      
      setUnreadMessages(msgCount || 0)

      // Count pending reviews
      const { count: reviewCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      
      setPendingReviews(reviewCount || 0)

      // Count pending orders
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      
      setPendingOrders(orderCount || 0)
    } catch (error) {
      console.error('Error loading notification counts:', error)
    }
  }

  // Listen for badge updates from child pages
  useEffect(() => {
    const handleBadgeUpdate = (event: CustomEvent) => {
      if (event.detail.unread !== undefined) {
        setUnreadMessages(event.detail.unread)
      }
      if (event.detail.pending !== undefined) {
        setPendingReviews(event.detail.pending)
      }
      if (event.detail.orders !== undefined) {
        setPendingOrders(event.detail.orders)
      }
    }
    
    window.addEventListener('badgeUpdate', handleBadgeUpdate as EventListener)
    
    return () => {
      window.removeEventListener('badgeUpdate', handleBadgeUpdate as EventListener)
    }
  }, [])

  useEffect(() => {
    const checkAdmin = async () => {
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

      if (userData?.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setUser(userData)
      
      // Load notification counts
      await loadNotificationCounts()
      
      setLoading(false)
    }

    checkAdmin()
    
    // Refresh counts every 30 seconds
    const interval = setInterval(() => {
      if (user?.role === 'admin') {
        loadNotificationCounts()
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalNotifications = unreadMessages + pendingReviews + pendingOrders

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', badge: 0 },
    { icon: Package, label: 'Products', href: '/admin/products', badge: 0 },
    { icon: ShoppingCart, label: 'Orders', href: '/admin/orders', badge: pendingOrders },
    { icon: Users, label: 'Customers', href: '/admin/customers', badge: 0 },
    { icon: MessageSquare, label: 'Messages', href: '/admin/messages', badge: unreadMessages },
    { icon: Star, label: 'Reviews', href: '/admin/reviews', badge: pendingReviews },
    { icon: Settings, label: 'Settings', href: '/admin/settings', badge: 0 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex relative overflow-hidden">
      {/* Background Logo */}
      <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none">
        <img 
          src="/images/products/logo.jpg"
          alt="NetApps Development"
          className="object-contain w-[70%] h-[70%] max-w-5xl mx-auto"
        />
      </div>
      
      {/* Decorative Circles */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400 rounded-full opacity-5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-green-400 rounded-full opacity-5 blur-3xl pointer-events-none"></div>

      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } bg-white/90 backdrop-blur-sm border-r border-gray-200 transition-all duration-300 fixed h-full z-50`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className={`flex items-center gap-2 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center text-white font-bold">
              N
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold">
                <span className="text-gray-800">Net</span>
                <span className="text-green-500">Apps</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation with Badges */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all ${
                item.href === '/admin' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              } ${!sidebarOpen && 'justify-center'}`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </div>
              {sidebarOpen && item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 w-full transition-all ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 relative z-10`}>
        {/* Header */}
        <header className="h-16 bg-white/90 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell with Count */}
            <div className="relative">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell size={20} />
                {totalNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                    {totalNotifications}
                  </span>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.first_name?.charAt(0) || 'A'}
              </div>
              {sidebarOpen && (
                <div className="text-sm">
                  <p className="font-medium text-gray-700">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 relative">
          {children}
        </main>
      </div>
    </div>
  )
}