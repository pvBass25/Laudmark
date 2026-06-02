import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { getPresignedUploadUrl } from '@/lib/r2'
import { hit, clientIp } from '@/lib/rate-limit'
import { randomUUID } from 'crypto'

const Schema = z.object({
  slug: z.string().min(1),
  contentType: z.string().min(1),
})

const EXT: Record<string, string> = {
  'video/webm': 'webm',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export async function POST(req: NextRequest) {
  // Rate limit: 20 presign requests / minute / IP (one submission may need a
  // video + a photo URL, so leave generous headroom while blocking abuse).
  const rl = hit(`upload-url:${clientIp(req)}`, 20, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { slug, contentType } = parsed.data
  const supabase = createServiceClient()

  const { data: page } = await supabase
    .from('collection_pages')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

  const ext = EXT[contentType] ?? contentType.split('/')[1] ?? 'bin'
  const key = `uploads/${page.id}/${randomUUID()}.${ext}`

  try {
    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(key, contentType)
    return NextResponse.json({ uploadUrl, publicUrl })
  } catch {
    return NextResponse.json({ error: 'Could not generate upload URL' }, { status: 500 })
  }
}
