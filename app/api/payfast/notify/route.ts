import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const data: Record<string, string> = {}
    
    formData.forEach((value, key) => {
      data[key] = value.toString()
    })

    console.log('PayFast ITN received:', data)

    // Only process completed payments
    if (data.payment_status !== 'COMPLETE') {
      return NextResponse.json({ message: 'Payment not complete' })
    }

    const orderId = data.m_payment_id
    const supabase = createClient()

    // Update order status
    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        transaction_id: data.pf_payment_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    // Get order items to update stock
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)

    // Update stock for each product
    for (const item of orderItems || []) {
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity, total_sold, total_revenue')
        .eq('id', item.product_id)
        .single()

      if (product) {
        const newStock = (product.stock_quantity || 0) - (item.quantity || 0)
        const newTotalSold = (product.total_sold || 0) + (item.quantity || 0)
        const newTotalRevenue = (product.total_revenue || 0) + ((item.unit_price || 0) * (item.quantity || 0))

        await supabase
          .from('products')
          .update({
            stock_quantity: newStock >= 0 ? newStock : 0,
            total_sold: newTotalSold,
            total_revenue: newTotalRevenue
          })
          .eq('id', item.product_id)
      }
    }

    return NextResponse.json({ message: 'ITN processed' })

  } catch (error) {
    console.error('ITN error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}