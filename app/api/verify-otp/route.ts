import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({
        success: false,
        message: 'Email and OTP are required'
      }, { status: 400 })
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({
        success: false,
        message: 'Please enter a valid 6-digit OTP'
      }, { status: 400 })
    }

    const supabase = createClient()

    // Get user from users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        message: 'User not found. Please register first.'
      }, { status: 404 })
    }

    if (!user.otp_code) {
      return NextResponse.json({
        success: false,
        message: 'No OTP found. Request a new one.'
      }, { status: 400 })
    }

    if (new Date(user.otp_expires_at) < new Date()) {
      return NextResponse.json({
        success: false,
        message: 'OTP has expired. Request a new one.'
      }, { status: 400 })
    }

    if (user.otp_attempts >= user.otp_max_attempts) {
      return NextResponse.json({
        success: false,
        message: 'Too many failed attempts. Request a new OTP.'
      }, { status: 400 })
    }

    if (user.otp_code !== otp) {
      await supabase
        .from('users')
        .update({
          otp_attempts: user.otp_attempts + 1
        })
        .eq('email', email)

      const remaining = user.otp_max_attempts - (user.otp_attempts + 1)
      return NextResponse.json({
        success: false,
        message: `Invalid OTP. ${remaining} attempts remaining.`
      }, { status: 400 })
    }

    // ✅ OTP verified
    await supabase
      .from('users')
      .update({
        is_verified: true,
        email_verified_at: new Date().toISOString(),
        otp_code: null,
        otp_expires_at: null,
        otp_attempts: 0
      })
      .eq('email', email)

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!'
    })

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({
      success: false,
      message: 'Something went wrong. Please try again.'
    }, { status: 500 })
  }
}