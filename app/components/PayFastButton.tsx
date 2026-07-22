'use client'

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import { createClient } from '../../lib/supabase/client'

interface PayFastButtonProps {
  amount: number
  email: string
  itemName: string
  buttonText?: string
  className?: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  subtotal: number
  vat: number
  deliveryFee: number
  total: number
  items: any[]
}

export default function PayFastButton({
  amount,
  email,
  itemName,
  buttonText = 'Pay Now with PayFast',
  className = '',
  firstName,
  lastName,
  phone,
  address,
  city,
  province,
  postalCode,
  subtotal,
  vat,
  deliveryFee,
  total,
  items
}: PayFastButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handlePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      // STEP 1: Create order
      const orderNumber = 'NA-' + Date.now().toString().slice(-8)

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: userData?.id || null,
          email: email,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          address: address,
          city: city,
          province: province,
          postal_code: postalCode,
          subtotal: subtotal,
          vat: vat,
          delivery_fee: deliveryFee,
          total: total,
          status: 'pending',
          payment_method: 'payfast',
          payment_status: 'pending'
        })
        .select()
        .single()

      if (orderError) {
        throw new Error('Failed to create order')
      }

      // Save order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.image_url,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }))

      await supabase
        .from('order_items')
        .insert(orderItems)

      // 🔥 SAVE ORDER ID TO localStorage BEFORE REDIRECT
      localStorage.setItem('pending_order_id', orderData.id)
      console.log('💾 Saved order ID to localStorage:', orderData.id)

      // STEP 2: Initiate PayFast payment
      const response = await fetch('/api/payfast/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          item_name: itemName,
          email_address: email,
          order_id: orderData.id
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment')
      }

      // STEP 3: Redirect to PayFast
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = data.payfastUrl

      Object.entries(data.paymentData).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value as string
        form.appendChild(input)
      })

      document.body.appendChild(form)
      form.submit()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-3 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating order...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            {buttonText}
          </>
        )}
      </button>
    </div>
  )
}