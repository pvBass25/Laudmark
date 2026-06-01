import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  polishTestimonial,
  extractAssets,
  generateRequest,
  tagTestimonial,
  suggestFollowup,
  translate,
  generateQuestions,
} from '@/lib/claude'

const TASKS = ['polish', 'assets', 'request', 'tag', 'followup', 'translate', 'questions'] as const
type Task = (typeof TASKS)[number]

export async function POST(req: NextRequest, { params }: { params: Promise<{ task: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { task } = await params
  if (!TASKS.includes(task as Task)) {
    return NextResponse.json({ error: 'Unknown task' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  try {
    switch (task as Task) {
      case 'polish': {
        const { text } = z.object({ text: z.string().min(1) }).parse(body)
        return NextResponse.json(await polishTestimonial(text))
      }
      case 'assets': {
        const { text } = z.object({ text: z.string().min(1) }).parse(body)
        return NextResponse.json(await extractAssets(text))
      }
      case 'request': {
        const data = z.object({
          niche: z.string().min(1),
          tone: z.string().min(1),
          channel: z.string().min(1),
          link: z.string().url(),
          name: z.string().min(1),
        }).parse(body)
        return NextResponse.json(await generateRequest(data))
      }
      case 'tag': {
        const { text } = z.object({ text: z.string().min(1) }).parse(body)
        return NextResponse.json(await tagTestimonial(text))
      }
      case 'followup': {
        const { text } = z.object({ text: z.string().min(1) }).parse(body)
        return NextResponse.json(await suggestFollowup(text))
      }
      case 'translate': {
        const { text, lang } = z.object({ text: z.string().min(1), lang: z.string().min(1) }).parse(body)
        return NextResponse.json(await translate(text, lang))
      }
      case 'questions': {
        const { niche } = z.object({ niche: z.string().min(1) }).parse(body)
        return NextResponse.json(await generateQuestions(niche))
      }
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    console.error(`ai/${task} error`, err)
    return NextResponse.json({ error: 'AI call failed' }, { status: 500 })
  }
}
