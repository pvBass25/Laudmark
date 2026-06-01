import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/app'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      // Auto-create profile on first login
      const service = createServiceClient()
      await service.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email ?? '',
        plan: 'free',
      }, { onConflict: 'id', ignoreDuplicates: true })

      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth', request.url))
}
