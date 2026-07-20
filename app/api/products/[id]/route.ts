import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ IMPORTANT: Await the params Promise
    const { id } = await params
    console.log('🔍 Product ID received:', id)
    
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('❌ Product not found:', error)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    console.log('✅ Product found:', data?.name)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}