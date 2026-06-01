import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { captureConsent } from '@/lib/consent'

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

  return NextResponse.json({ id: data.id }, { status: 201 })
}
