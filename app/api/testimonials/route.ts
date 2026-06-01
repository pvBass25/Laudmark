import { after } from 'next/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { captureConsent } from '@/lib/consent'
import { transcribe } from '@/lib/deepgram'
import { polishTestimonial, extractAssets, tagTestimonial } from '@/lib/claude'

const SubmitSchema = z.object({
  slug: z.string().min(1),
  type: z.enum(['video', 'text']),
  authorName: z.string().min(1).max(120),
  authorTitle: z.string().max(160).optional(),
  authorPhotoUrl: z.string().url().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  text: z.string().max(5000).optional(),
  videoUrl: z.string().url().optional(),
  consent: z.literal(true),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = SubmitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { slug, type, authorName, authorTitle, authorPhotoUrl, rating, text, videoUrl } = parsed.data

  if (type === 'text' && !text?.trim()) {
    return NextResponse.json({ error: 'text is required for text testimonials' }, { status: 400 })
  }
  if (type === 'video' && !videoUrl) {
    return NextResponse.json({ error: 'videoUrl is required for video testimonials' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: page } = await supabase
    .from('collection_pages')
    .select('id, user_id')
    .eq('slug', slug)
    .single()

  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

  const consentData = captureConsent(req)

  const { data, error } = await supabase
    .from('testimonials')
    .insert({
      page_id: page.id,
      user_id: page.user_id,
      type,
      author_name: authorName,
      author_title: authorTitle ?? null,
      author_photo_url: authorPhotoUrl ?? null,
      rating: rating ?? null,
      raw_text: text ?? null,
      video_url: videoUrl ?? null,
      status: 'pending',
      ...consentData,
    })
    .select('id')
    .single()

  if (error) {
    console.error('testimonials insert error', error)
    return NextResponse.json({ error: 'Failed to save testimonial' }, { status: 500 })
  }

  // Run AI/STT enrichment after the response is sent — never blocks the thank-you screen
  after(async () => {
    try {
      await enrich(data.id, type, videoUrl ?? null, text ?? null)
    } catch {
      // silently swallow — enrichment is best-effort
    }
  })

  return NextResponse.json({ id: data.id }, { status: 201 })
}

async function enrich(
  id: string,
  type: 'video' | 'text',
  videoUrl: string | null,
  rawText: string | null,
) {
  const supabase = createServiceClient()
  let text = rawText

  // Step 1: Transcribe video → raw_text
  if (type === 'video' && videoUrl) {
    try {
      text = await transcribe(videoUrl)
      if (text) {
        await supabase.from('testimonials').update({ raw_text: text }).eq('id', id)
      }
    } catch (err) {
      console.error('transcribe failed for', id, err)
      return // can't enrich without a transcript
    }
  }

  if (!text) return

  // Steps 2–4: polish + extract assets + tag — run in parallel
  const [polished, assets, tags] = await Promise.all([
    polishTestimonial(text),
    extractAssets(text),
    tagTestimonial(text),
  ])

  const update: Record<string, unknown> = {}

  if (polished.cleaned) update.clean_text = polished.cleaned
  if (polished.pull_quote) update.pull_quote = polished.pull_quote

  if (assets) {
    if (type === 'video' && assets.captions_vtt) update.captions_vtt = assets.captions_vtt
  }

  if (tags) {
    if (tags.sentiment) update.sentiment = tags.sentiment
    const themes = [
      ...(assets?.themes ?? []),
      ...(tags.themes ?? []),
    ]
    const unique = [...new Set(themes)]
    if (unique.length > 0) update.themes = unique
  }

  if (Object.keys(update).length > 0) {
    const { error } = await supabase.from('testimonials').update(update).eq('id', id)
    if (error) console.error('enrich update failed for', id, error)
  }
}
