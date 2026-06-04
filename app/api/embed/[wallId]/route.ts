import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { buildJsonLd } from '@/lib/schema-ld'
import { PLANS, type Plan } from '@/lib/plans'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ wallId: string }> }
) {
  const { wallId } = await params
  const supabase = createServiceClient()

  const { data: wall } = await supabase
    .from('walls')
    .select('id, name, layout, testimonial_ids, user_id')
    .eq('id', wallId)
    .single()

  if (!wall) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, brand_name')
    .eq('id', wall.user_id)
    .single()

  const plan = (profile?.plan ?? 'free') as Plan
  const { brandingFooter, seoEmbed } = PLANS[plan]
  const brandName = profile?.brand_name ?? 'Trustwall'

  // Fetch testimonials in wall order, consented + approved only
  let testimonials: Testimonial[] = []
  if (wall.testimonial_ids?.length > 0) {
    const { data } = await supabase
      .from('testimonials')
      .select('id, author_name, author_title, author_photo_url, rating, clean_text, raw_text, consent')
      .in('id', wall.testimonial_ids)
      .eq('status', 'approved')
      .eq('consent', true)

    if (data) {
      const map = new Map(data.map(t => [t.id, t]))
      testimonials = wall.testimonial_ids
        .map((id: string) => map.get(id))
        .filter(Boolean) as Testimonial[]
    }
  }

  const html = buildEmbedHtml(testimonials, wall.layout, brandingFooter)
  const jsonLd = seoEmbed ? buildJsonLd(brandName, testimonials) : null

  return NextResponse.json({ html, jsonLd }, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

// ── Types ────────────────────────────────────────────────────────────────────

interface Testimonial {
  id: string
  author_name: string
  author_title?: string | null
  author_photo_url?: string | null
  rating?: number | null
  clean_text?: string | null
  raw_text?: string | null
  consent?: boolean
}

// ── HTML builder ─────────────────────────────────────────────────────────────

function buildEmbedHtml(items: Testimonial[], layout: string, brandingFooter: boolean): string {
  const wrapStyle =
    layout === 'grid'
      ? 'display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;'
      : layout === 'carousel'
      ? 'display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px;'
      : 'display:flex;flex-direction:column;gap:16px;'

  const cards = items.map(t => buildCard(t, layout)).join('\n')

  const footer = brandingFooter
    ? `<p style="text-align:center;margin:16px 0 0;font-size:12px;color:#5F635D;font-family:system-ui,sans-serif;">
        Powered by <a href="https://trustwall.app" target="_blank" rel="noopener noreferrer"
          style="color:#3C5A54;text-decoration:none;font-weight:500;">Trustwall</a>
       </p>`
    : ''

  return `<div class="tw-wall" style="font-family:system-ui,-apple-system,sans-serif;box-sizing:border-box;${wrapStyle}">\n${cards}\n${footer}</div>`
}

function buildCard(t: Testimonial, layout: string): string {
  const text = t.clean_text ?? t.raw_text ?? ''
  if (!text && !t.author_name) return ''

  const cardStyle = [
    'background:#fff',
    'border-radius:16px',
    'padding:20px',
    'box-shadow:0 1px 2px rgba(28,32,31,.05), 0 4px 12px rgba(28,32,31,.06)',
    'box-sizing:border-box',
    layout === 'carousel' ? 'min-width:280px;flex-shrink:0;scroll-snap-align:start' : '',
  ].filter(Boolean).join(';')

  const stars = t.rating
    ? `<div style="color:#FBBF24;font-size:15px;letter-spacing:1px;margin-bottom:10px;" aria-label="${t.rating} out of 5 stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>`
    : ''

  const avatar = t.author_photo_url
    ? `<img src="${esc(t.author_photo_url)}" alt="${esc(t.author_name)}" width="36" height="36"
         style="width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0;" />`
    : `<div aria-hidden="true" style="width:36px;height:36px;border-radius:50%;background:#C9D5CF;color:#3C5A54;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;">${initials(t.author_name)}</div>`

  const title = t.author_title
    ? `<span style="display:block;font-size:12px;color:#5F635D;margin-top:1px;">${esc(t.author_title)}</span>`
    : ''

  return `<div style="${cardStyle}" itemscope itemtype="https://schema.org/Review">
  ${stars}
  <blockquote itemprop="reviewBody" style="margin:0 0 16px;padding:0;font-size:15px;line-height:1.65;color:#565B56;">${esc(text)}</blockquote>
  <div style="display:flex;align-items:center;gap:10px;" itemprop="author" itemscope itemtype="https://schema.org/Person">
    ${avatar}
    <div>
      <strong itemprop="name" style="font-size:14px;color:#1C201F;display:block;">${esc(t.author_name)}</strong>
      ${title}
    </div>
  </div>
</div>`
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}
