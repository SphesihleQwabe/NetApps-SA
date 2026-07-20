import nodemailer from 'nodemailer'

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Send Registration/Verification Email
export async function sendVerificationEmail(email: string, name: string) {
  const verificationLink = `http://localhost:3000/verify-email?email=${encodeURIComponent(email)}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
        .header { background: linear-gradient(135deg, #2563EB, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #2563EB; color: white; text-decoration: none; border-radius: 8px; }
        .footer { text-align: center; color: #94a3b8; font-size: 14px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">NetApps Development</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">A Better Digital Experience</p>
        </div>
        <div class="content">
          <h2>Welcome ${name}! 🎉</h2>
          <p>Thank you for registering with NetApps Development.</p>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" class="button">Verify Email</a>
          </div>
          <p style="font-size: 14px; color: #64748b;">If you didn't create this account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 NetApps Development. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"NetApps Development" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - NetApps Development',
      html
    })
    console.log('✅ Registration email sent to:', email)
    return true
  } catch (error) {
    console.error('❌ Email error:', error)
    return false
  }
}

// Send Password Reset Email
export async function sendPasswordResetEmail(email: string, name: string) {
  const resetLink = `http://localhost:3000/reset-password?email=${encodeURIComponent(email)}&token=${Date.now()}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
        .header { background: linear-gradient(135deg, #2563EB, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #2563EB; color: white; text-decoration: none; border-radius: 8px; }
        .footer { text-align: center; color: #94a3b8; font-size: 14px; margin-top: 20px; }
        .warning { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">NetApps Development</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">A Better Digital Experience</p>
        </div>
        <div class="content">
          <h2>Password Reset Request 🔐</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>We received a request to reset your password for your NetApps Development account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          <div class="warning">
            <p><strong>⚠️ This link will expire in 1 hour.</strong></p>
          </div>
          <p style="font-size: 14px; color: #64748b;">If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 NetApps Development. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"NetApps Development" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - NetApps Development',
      html
    })
    console.log('✅ Password reset email sent to:', email)
    return true
  } catch (error) {
    console.error('❌ Password reset email error:', error)
    return false
  }
}