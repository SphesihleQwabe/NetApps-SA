'use client'

import { Suspense } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

function VerifyResetOTPContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email') || ''
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [timer, setTimer] = useState(300)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) return
    const interval = setInterval(() => {
      setTimer(prev => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [timer])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (!/^[0-9]$/.test(value) && value !== '') return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const verifyOTP = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      })

      const result = await response.json()

      if (result.success) {
        setMessage('✅ OTP verified! Now set your new password.')
        setShowNewPassword(true)
      } else {
        setError(result.message || 'Invalid OTP. Please try again.')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  const resetPassword = async () => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          newPassword: newPassword
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage('✅ Password reset successfully! Redirecting to login...')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(result.message || 'Failed to reset password')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  const handleResend = async () => {
    if (timer > 270) {
      setError('Please wait before requesting a new OTP')
      return
    }

    setResendLoading(true)
    setError('')
    setMessage('')

    try {
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
        setMessage('✅ New OTP sent to your email!')
        setTimer(300)
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      } else {
        setError('Failed to send OTP. Please try again.')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    }

    setResendLoading(false)
  }

  if (!email) {
    return (
      <>
        <Header />
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800">Invalid Request</h1>
            <p className="text-gray-500 mt-2">No email provided.</p>
            <Link href="/forgot-password" className="inline-block mt-6 text-blue-600 hover:underline">
              ← Back to Forgot Password
            </Link>
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
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              N
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              {showNewPassword ? 'Set New Password' : 'Reset Password'}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {showNewPassword 
                ? 'Enter your new password below' 
                : `Enter the 6-digit code sent to ${email}`}
            </p>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {!showNewPassword ? (
            <>
              <div className="flex justify-center gap-3 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-gray-500">
                  Time remaining: <span className="font-semibold text-blue-600">{formatTime(timer)}</span>
                </p>
              </div>

              <button
                onClick={verifyOTP}
                disabled={loading || timer <= 0}
                className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                  loading || timer <= 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? '⏳ Verifying...' : timer <= 0 ? '⏰ OTP Expired' : '🔐 Verify OTP'}
              </button>

              <div className="text-center mt-4">
                <button
                  onClick={handleResend}
                  disabled={resendLoading || timer > 270}
                  className={`text-sm ${
                    resendLoading || timer > 270
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:underline'
                  }`}
                >
                  {resendLoading ? '⏳ Sending...' : timer > 270 ? `Wait ${formatTime(270 - timer)}s` : '📧 Resend OTP'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm your new password"
                  />
                </div>

                <button
                  onClick={resetPassword}
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {loading ? '⏳ Resetting...' : '🔑 Reset Password'}
                </button>
              </div>
            </>
          )}

          <div className="text-center mt-6">
            <Link href="/login" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default function VerifyResetOTPPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyResetOTPContent />
    </Suspense>
  )
}