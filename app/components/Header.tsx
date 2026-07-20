'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import { useCart } from '../context/CartContext'
import Image from 'next/image'

export default function Header() {
  const router = useRouter()
  const supabase = createClient()
  const { totalItems } = useCart()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('first_name, last_name, role')
          .eq('email', session.user.email)
          .maybeSingle()
        
        if (userData) {
          setUser({
            email: session.user.email,
            name: `${userData.first_name} ${userData.last_name}`,
            role: userData.role
          })
          setIsAdmin(userData.role === 'admin')
        } else {
          setUser({
            email: session.user.email,
            name: session.user.user_metadata?.first_name || 'User',
            role: 'user'
          })
        }
      } else {
        setUser(null)
        setIsAdmin(false)
      }
    }

    checkUser()

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser()
    })

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    window.location.href = '/'
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200' 
        : 'bg-white border-b border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 lg:w-12 lg:h-12">
              <Image
                src="/images/products/logo.jpg"
                alt="NetApps Development"
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 40px, 48px"
                priority
              />
            </div>
            <div>
              <span className="text-xl lg:text-2xl font-bold tracking-tight">
                <span className="text-gray-800">Net</span>
                <span className="text-green-500">Apps</span>
              </span>
              <p className="text-[10px] text-gray-400 -mt-0.5 tracking-wider hidden sm:block">Development</p>
            </div>
          </Link>

          {/* Navigation - Added Contact */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
              Home
            </Link>
            <Link href="/products" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
              Products
            </Link>
            <Link href="/orders" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
              Orders
            </Link>
            {user && (
              <Link href={isAdmin ? "/admin" : "/dashboard"} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                Account
              </Link>
            )}
            <Link href="/contact" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
              Message
            </Link>
            {isAdmin && (
              <span className="ml-1 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2.5 py-0.5 rounded-full font-medium">
                Admin
              </span>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart */}
            <Link href="/cart" className="relative p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group">
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.5 6.5M17 13l2.5 6.5M9 21a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-[10px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 shadow-md">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2 transition-all">
                  <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-blue-600 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user.name?.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <button className="px-4 py-2 lg:px-5 lg:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-[1.02]">
                    Sign In
                  </button>
                </Link>
                <Link href="/register">
                  <button className="hidden sm:block px-4 py-2 lg:px-5 lg:py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-[1.02]">
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}