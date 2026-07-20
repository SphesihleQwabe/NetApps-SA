'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    // Validate email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      // ✅ Send password reset email via API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          name: 'Customer',
          type: 'reset'
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage('✅ Password reset link has been sent to your email address.')
      } else {
        setError('❌ Failed to send email. Please try again later.')
      }
    } catch (error) {
      setError('❌ Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  return (
    <>
      <Header />
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              N
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Forgot Password</h1>
            <p className="text-gray-500 mt-2">We'll send you a reset link</p>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-semibold">Check Your Email!</p>
                <p className="text-sm">{message}</p>
                <p className="text-xs text-gray-500 mt-1">Sent to: <strong>{email}</strong></p>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="youremail@domain.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:scale-[1.02]'
              }`}
            >
              {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/login" className="text-sm text-blue-600 hover:underline">
              ← Back to Sign In
            </Link>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-700 text-center">
              📧 Check your spam/junk folder if you don't see the email in your inbox.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}