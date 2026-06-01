import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/app'

  const supabase = await createClient()
  let userId: string | undefined
  let userEmail: string | undefined

  // PKCE flow (?code=) — used by the normal in-browser magic link
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      userId = data.user.id
      userEmail = data.user.email ?? undefined
    }
  }
  // OTP token-hash flow (?token_hash=&type=) — works without the PKCE cookie
  else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (!error && data.user) {
      userId = data.user.id
      userEmail = data.user.email ?? undefined
    }
  }

  if (userId) {
    // Auto-create profile on first login
    const service = createServiceClient()
    await service.from('profiles').upsert(
      { id: userId, email: userEmail ?? '', plan: 'free' },
      { onConflict: 'id', ignoreDuplicates: true }
    )
    return NextResponse.redirect(new URL(next, request.url))
  }

  return NextResponse.redirect(new URL('/login?error=auth', request.url))
}
