import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /auth/signout — clears the Supabase session and returns to the login page.
// 303 converts the POST into a GET on the redirect target.
export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/login', request.url), { status: 303 })
}
