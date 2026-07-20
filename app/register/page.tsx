'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    // Validation
    const nameRegex = /^[A-Za-z\s\-]+$/
    if (!nameRegex.test(form.firstName)) {
      setError('First name can only contain letters')
      return
    }
    if (!nameRegex.test(form.lastName)) {
      setError('Last name can only contain letters')
      return
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address')
      return
    }

    const phoneRegex = /^0[0-9]{9}$/
    if (!phoneRegex.test(form.phone)) {
      setError('Please enter a valid 10-digit phone number starting with 0')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      // 1. Register with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            phone: form.phone,
          }
        }
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Failed to create user. Please try again.')
        setLoading(false)
        return
      }

      // 2. Check if user already exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', form.email)
        .maybeSingle()

      let profileError = null

      if (existingUser) {
        // Update existing user
        const { error: updateError } = await supabase
          .from('users')
          .update({
            password: form.password,
            first_name: form.firstName,
            last_name: form.lastName,
            phone: form.phone,
            is_verified: true,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)
        profileError = updateError
      } else {
        // Insert new user
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: form.email,
            password: form.password,
            first_name: form.firstName,
            last_name: form.lastName,
            phone: form.phone,
            is_verified: true,
            is_active: true,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        profileError = insertError
      }

      if (profileError) {
        console.error('Profile error:', profileError)
        setError('Failed to save profile: ' + profileError.message)
        setLoading(false)
        return
      }

      // 3. Send welcome email
      try {
        await fetch('/api/send-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email,
            name: `${form.firstName} ${form.lastName}`
          })
        })
      } catch (emailError) {
        console.error('Welcome email error:', emailError)
      }

      // 4. Auto-login the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      })

      if (signInError) {
        console.error('Auto-login error:', signInError)
        // Still redirect to home even if auto-login fails
        router.push('/')
        return
      }

      // 5. ✅ Redirect to HOME page (not dashboard)
      setMessage('✅ Registration successful! Welcome to NetApps Development! 🎉')
      
      // Force redirect to home page
      setTimeout(() => {
        router.push('/')
      }, 1500)

    } catch (error) {
      setError('Registration failed. Please try again.')
      console.error('Registration error:', error)
    }

    setLoading(false)
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
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              <img 
                src="/images/products/logo.jpg"
                alt="NetApps Development"
                className="object-contain w-14 h-14 rounded-xl"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
            <p className="text-gray-500 mt-2">Join NetApps Development</p>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
              <span className="text-xl">🎉</span>
              <div>
                <p className="font-semibold">Welcome!</p>
                <p className="text-sm">{message}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
              <span className="text-xl">❌</span>
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <input
                type="email"
                required
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <input
                type="tel"
                required
                placeholder="Phone Number (e.g., 0821234567)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-green-500 hover:shadow-lg hover:scale-[1.02]'
              }`}
            >
              {loading ? '⏳ Creating account...' : '🚀 Create Account'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
            <p className="text-xs text-gray-500 text-center">
              🔒 Your account is secure and protected.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}