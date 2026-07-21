import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/client'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const url = new URL(request.url)
  const id = url.pathname.split('/').pop()
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const supabase = createClient()
  const url = new URL(request.url)
  const id = url.pathname.split('/').pop()
  const body = await request.json()

  const { data, error } = await supabase
    .from('reviews')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient()
  const url = new URL(request.url)
  const id = url.pathname.split('/').pop()

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}