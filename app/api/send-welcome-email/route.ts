import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to NetApps Development</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            background: #f4f6f9; 
            padding: 40px 20px; 
          }
          .container { 
            max-width: 600px; 
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
            position: relative;
          }
          .header::after {
            content: '';
            position: absolute;
            bottom: -20px;
            left: 0;
            right: 0;
            height: 40px;
            background: white;
            border-radius: 50% 50% 0 0 / 100% 100% 0 0;
          }
          .logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 10px;
          }
          .logo-icon {
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: 800;
            color: #1a56db;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          }
          .logo-text {
            color: white;
            text-align: left;
          }
          .logo-text h1 {
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin: 0;
          }
          .logo-text h1 .blue {
            color: #93c5fd;
          }
          .logo-text h1 .green {
            color: #6ee7b7;
          }
          .logo-text p {
            font-size: 14px;
            opacity: 0.85;
            margin-top: 2px;
            letter-spacing: 1px;
          }
          .content { 
            padding: 40px 35px 30px; 
          }
          .content h2 { 
            color: #1a202c; 
            font-size: 24px; 
            font-weight: 600; 
            margin-bottom: 15px; 
          }
          .content h2 span {
            color: #059669;
          }
          .content p { 
            color: #4a5568; 
            font-size: 16px; 
            line-height: 1.8; 
            margin-bottom: 15px; 
          }
          .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #1a56db, #059669); 
            color: #ffffff !important; 
            padding: 14px 40px; 
            border-radius: 8px; 
            text-decoration: none; 
            font-weight: 600; 
            font-size: 16px; 
            box-shadow: 0 4px 15px rgba(26,86,219,0.3); 
          }
          .features { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 12px; 
            margin: 25px 0; 
          }
          .feature { 
            background: #f7fafc; 
            padding: 15px; 
            border-radius: 12px; 
            text-align: center; 
            border: 1px solid #e2e8f0;
          }
          .feature .icon { 
            font-size: 28px; 
            display: block; 
            margin-bottom: 6px; 
          }
          .feature .label { 
            font-size: 13px; 
            color: #4a5568; 
            font-weight: 500; 
          }
          .divider { 
            border-top: 2px solid #e2e8f0; 
            margin: 25px 0; 
          }
          .footer { 
            text-align: center; 
            color: #a0aec0; 
            font-size: 14px; 
            padding: 20px 30px; 
            background: #f7fafc; 
            border-top: 1px solid #e2e8f0; 
          }
          .footer p { margin: 5px 0; }
          .footer .company-name {
            color: #1a202c;
            font-weight: 600;
          }
          .badge {
            display: inline-block;
            background: #ebf8ff;
            color: #2b6cb0;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          @media (max-width: 480px) {
            .features {
              grid-template-columns: 1fr 1fr;
            }
            .logo-container {
              flex-direction: column;
              text-align: center;
            }
            .logo-text {
              text-align: center;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header with Logo (SVG) -->
          <div class="header">
            <div class="logo-container">
              <div class="logo-icon">N</div>
              <div class="logo-text">
                <h1>
                  <span class="blue">Net</span><span class="green">Apps</span>
                </h1>
                <p>Development</p>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="content">
            <h2>Welcome to <span>NetApps Development</span>, ${name}! 🎉</h2>
            <p>Thank you for creating an account with us. We're thrilled to have you join our community of tech enthusiasts!</p>
            
            <div class="features">
              <div class="feature">
                <span class="icon">🛍️</span>
                <span class="label">Premium Products</span>
              </div>
              <div class="feature">
                <span class="icon">🚚</span>
                <span class="label">Fast Delivery</span>
              </div>
              <div class="feature">
                <span class="icon">🔒</span>
                <span class="label">Secure Payments</span>
              </div>
              <div class="feature">
                <span class="icon">⭐</span>
                <span class="label">Quality Guarantee</span>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="button">🚀 Start Shopping Now</a>
            </div>

            <div style="text-align: center; margin: 15px 0;">
              <span class="badge">✅ Account Verified</span>
              <span style="margin: 0 5px; color: #e2e8f0;">|</span>
              <span class="badge">🔐 Secure</span>
            </div>

            <div class="divider"></div>
            
            <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 15px 20px; border-radius: 8px; margin: 15px 0;">
              <p style="font-size: 14px; color: #065f46; margin: 0;">
                💡 <strong>Tip:</strong> Explore our latest products and exclusive deals!
              </p>
            </div>

            <p style="font-size: 14px; color: #718096; text-align: center; margin-top: 10px;">
              You're receiving this email because you registered on NetApps Development.
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p><strong class="company-name">NetApps Development</strong></p>
            <p>125 Florence Nzama Street, North Beach, Durban, 4001</p>
            <p>📧 info@netappsdevelopment.com &nbsp;•&nbsp; 📞 071 175 3994</p>
            <p style="font-size: 12px; margin-top: 10px; color: #cbd5e0;">
              © 2026 NetApps Development. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    await transporter.sendMail({
      from: `"NetApps Development" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Welcome to NetApps Development!',
      html
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Welcome email error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}