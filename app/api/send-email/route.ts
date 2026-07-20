import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient } from '@/lib/supabase/client'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const { email, name, type } = await request.json()
    const supabase = createClient()
    const otpCode = generateOTP()

    // ✅ SAVE OTP TO DATABASE
    const { error: dbError } = await supabase
      .from('users')
      .update({
        otp_code: otpCode,
        otp_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        otp_attempts: 0,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to save OTP' 
      }, { status: 500 })
    }

    const subject = '🔐 Your OTP Verification Code - NetApps Development'
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            background: #f0f2f5; 
            padding: 40px 20px; 
          }
          .container { 
            max-width: 520px; 
            margin: 0 auto; 
            background: #ffffff; 
            border-radius: 20px; 
            overflow: hidden; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.08); 
          }
          .header { 
            background: linear-gradient(135deg, #1a56db 0%, #059669 100%); 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 { 
            color: #ffffff; 
            font-size: 28px; 
            font-weight: 700; 
          }
          .header p { 
            color: rgba(255,255,255,0.85); 
            font-size: 15px; 
            margin-top: 6px; 
          }
          .content { 
            padding: 40px 35px; 
            text-align: center; 
          }
          .greeting { 
            font-size: 20px; 
            color: #1a202c; 
            font-weight: 600; 
            margin-bottom: 10px; 
          }
          .greeting span { 
            color: #059669; 
          }
          .message { 
            color: #4a5568; 
            font-size: 16px; 
            line-height: 1.7; 
            margin-bottom: 25px; 
          }
          .otp-box { 
            background: #f8fafc; 
            border: 2px dashed #d1d5db; 
            border-radius: 16px; 
            padding: 25px; 
            margin: 25px 0; 
          }
          .otp-label { 
            font-size: 12px; 
            color: #9ca3af; 
            text-transform: uppercase; 
            letter-spacing: 2px; 
            font-weight: 600; 
          }
          .otp-code { 
            font-size: 48px; 
            font-weight: 800; 
            letter-spacing: 16px; 
            color: #1a56db; 
            font-family: 'Courier New', monospace; 
            margin-top: 5px; 
          }
          .expiry { 
            color: #6b7280; 
            font-size: 14px; 
            margin-top: 15px; 
          }
          .expiry strong { 
            color: #dc2626; 
          }
          .divider { 
            border-top: 1px solid #e5e7eb; 
            margin: 30px 0 20px; 
          }
          .footer-text { 
            color: #9ca3af; 
            font-size: 14px; 
            line-height: 1.6; 
          }
          .company { 
            margin-top: 20px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
          }
          .company p { 
            color: #9ca3af; 
            font-size: 13px; 
            margin: 3px 0; 
          }
          .company strong { 
            color: #4b5563; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 NetApps Development</h1>
            <p>A Better Digital Experience</p>
          </div>
          <div class="content">
            <p class="greeting">Hello <span>${name}</span>,</p>
            <p class="message">Use the 6-digit OTP below to verify your email.</p>
            <div class="otp-box">
              <div class="otp-label">Your One-Time Password</div>
              <div class="otp-code">${otpCode}</div>
            </div>
            <div class="expiry">
              ⏰ This code expires in <strong>5 minutes</strong>
            </div>
            <div class="divider"></div>
            <p class="footer-text">
              If you didn't request this, please ignore this email.<br>
              For security, do not share this code with anyone.
            </p>
            <div class="company">
              <p><strong>NetApps Development</strong></p>
              <p>📧 info@netappsdevelopment.com &nbsp;•&nbsp; 📞 071 175 3994</p>
              <p style="font-size: 12px; color: #d1d5db;">© 2026 NetApps Development. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    await transporter.sendMail({
      from: `"NetApps Development" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      otp: otpCode
    })

  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to send email' 
    }, { status: 500 })
  }
}