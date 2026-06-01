import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ error: 'Not implemented — coming in M5.' }, { status: 501 })
}
