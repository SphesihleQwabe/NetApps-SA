import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Get reviews with product names
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        products (
          name
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Format the data to include product_name
    const formattedData = data?.map(review => ({
      ...review,
      product_name: review.products?.name || 'N/A'
    })) || []
    
    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}