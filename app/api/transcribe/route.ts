import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { transcribe } from '@/lib/deepgram'

const Schema = z.object({ videoUrl: z.string().url() })

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  try {
    const transcript = await transcribe(parsed.data.videoUrl)
    return NextResponse.json({ transcript })
  } catch (err) {
    console.error('transcribe error', err)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
