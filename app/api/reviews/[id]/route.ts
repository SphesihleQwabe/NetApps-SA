import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()
    const supabase = createClient()
    
    const { error } = await supabase
      .from('reviews')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', params.id)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', params.id)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}