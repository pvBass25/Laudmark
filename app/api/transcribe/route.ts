import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Not implemented — coming in M2.' }, { status: 501 })
}
