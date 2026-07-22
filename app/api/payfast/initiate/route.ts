import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, item_name, email_address, order_id } = body

    // Use environment variables
    const merchantId = process.env.PAYFAST_MERCHANT_ID || '10051164'
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY || 'nxajl98ah5404'
    const passphrase = process.env.PAYFAST_PASSPHRASE || ''
    const environment = process.env.PAYFAST_ENVIRONMENT || 'sandbox'
    
    const baseUrl = environment === 'sandbox' 
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process'
    
    const returnUrl = process.env.PAYFAST_RETURN_URL || `http://localhost:3000/checkout/success`
    const cancelUrl = process.env.PAYFAST_CANCEL_URL || `http://localhost:3000/checkout/cancel`
    const notifyUrl = process.env.PAYFAST_NOTIFY_URL || `http://localhost:3000/api/payfast/notify`
    
    const paymentData = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      amount: amount.toString(),
      item_name: item_name || 'TechStore SA Order',
      m_payment_id: order_id || `ORDER_${Date.now()}`,
      email_address: email_address || 'customer@example.com'
    }

    // Generate signature
    const sortedKeys = Object.keys(paymentData).sort()
    let signatureString = ''
    
    sortedKeys.forEach(key => {
      const value = paymentData[key as keyof typeof paymentData]
      if (value) {
        signatureString += `${key}=${encodeURIComponent(value).replace(/%20/g, '+')}&`
      }
    })
    
    signatureString = signatureString.slice(0, -1)
    
    if (passphrase) {
      signatureString += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
    }

    const signature = crypto.createHash('md5').update(signatureString).digest('hex')

    return NextResponse.json({
      paymentData: {
        ...paymentData,
        signature
      },
      payfastUrl: baseUrl
    })

  } catch (error) {
    console.error('PayFast error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    )
  }
}