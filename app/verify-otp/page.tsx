'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function VerifyOTPPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email') || ''
  
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })

      const result = await response.json()

      if (result.success) {
        setMessage('✅ Email verified! Redirecting...')
        setTimeout(() => router.push('/login'), 2000)
      } else {
        setError(result.message || 'Invalid OTP')
      }
    } catch (error) {
      setError('Something went wrong')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-2">Verify Email</h1>
        <p className="text-gray-600 text-center mb-6">
          Enter the 6-digit code sent to <br />
          <span className="font-semibold text-blue-600">{email}</span>
        </p>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '')
            if (val.length <= 6) setOtp(val)
          }}
          placeholder="Enter 6-digit OTP"
          className="w-full px-4 py-3 text-center text-2xl tracking-[1em] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <button
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
          className={`w-full mt-4 py-3 rounded-lg font-semibold text-white ${
            loading || otp.length !== 6
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>

        <div className="text-center mt-4">
          <a href="/login" className="text-sm text-gray-500 hover:text-blue-600">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  )
}