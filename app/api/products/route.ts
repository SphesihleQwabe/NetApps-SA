import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/client'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Get all products
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('✅ Products found:', data?.length || 0)
    return NextResponse.json(data || [])
    
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}