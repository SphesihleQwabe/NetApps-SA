'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../lib/supabase/client'
import Header from '../components/Header'
import Footer from '../components/Footer'

function VerifyOTPContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const supabase = createClient()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setResendDisabled(false)
    }
  }, [countdown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)

    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.')
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendDisabled(true)
    setCountdown(60)
    setError('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      })

      if (error) throw error

      alert('OTP resent successfully! Check your email.')

    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP')
      setResendDisabled(false)
      setCountdown(0)
    }
  }

  if (success) {
    return (
      <>
        <Header />
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4 p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h1>
            <p className="text-gray-500">Your email has been successfully verified.</p>
            <p className="text-gray-400 text-sm mt-2">Redirecting to login...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Verify Your Email</h1>
            <p className="text-gray-500 mt-2">Enter the 6-digit code sent to <strong>{email}</strong></p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all ${
                loading || otp.length < 6
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={handleResend}
              disabled={resendDisabled}
              className={`text-sm ${
                resendDisabled ? 'text-gray-400' : 'text-blue-600 hover:underline'
              }`}
            >
              {resendDisabled ? `Resend in ${countdown}s` : 'Resend OTP'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  )
}