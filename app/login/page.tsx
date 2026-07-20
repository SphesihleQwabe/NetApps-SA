'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const supabase = createClient()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      }
    }
    checkUser()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // Check if email is confirmed
        if (!data.user.email_confirmed_at) {
          setError('Please verify your email first. Check your inbox.')
          setLoading(false)
          return
        }

        // ✅ Redirect to HOME page (not dashboard)
        router.push('/')
      }
    } catch (error) {
      setError('Login failed. Please try again.')
    }

    setLoading(false)
  }

  // Handle forgot password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setResetSent(true)
        setError('')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  if (resetSent) {
    return (
      <>
        <Header />
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4 p-8 text-center">
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h1>
            <p className="text-gray-500">We've sent a password reset link to <strong>{resetEmail}</strong></p>
            <Link href="/login" className="inline-block mt-6 text-blue-600 hover:underline">Back to Login</Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] flex items-center justify-center pointer-events-none">
          <img 
            src="/images/products/logo.jpg"
            alt="NetApps Development"
            className="object-contain w-[70%] h-[70%] max-w-5xl mx-auto"
          />
        </div>
        
        <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl max-w-md w-full mx-4 p-8 border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              <img 
                src="/images/products/logo.jpg"
                alt="NetApps Development"
                className="object-contain w-14 h-14 rounded-xl"
              />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50/50"
                placeholder="youremail@domain.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(form.email || '')
                    document.getElementById('reset-form')?.classList.toggle('hidden')
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50/50 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02]'
              }`}
            >
              {loading ? '⏳ Signing in...' : '🚀 Sign In'}
            </button>
          </form>

          {/* Reset Password Form */}
          <div id="reset-form" className="hidden mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Reset Password</h3>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('reset-form')?.classList.add('hidden')}
                className="w-full text-sm text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </form>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100/50">
            <p className="text-xs text-gray-500 text-center">🔒 Secure login. Your data is protected.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}