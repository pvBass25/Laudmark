import { NextResponse } from 'next/server'

// Raw body parsing required — disable Next.js body parsing for this route.
export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json({ error: 'Not implemented — coming in M5.' }, { status: 501 })
}
