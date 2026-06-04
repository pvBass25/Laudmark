import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { buildJsonLd } from '@/lib/schema-ld'
import { PLANS, type Plan } from '@/lib/plans'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ wallId: string }>
}

async function getData(wallId: string) {
  const supabase = createServiceClient()

  const { data: wall } = await supabase
    .from('walls')
    .select('id, name, layout, testimonial_ids, user_id')
    .eq('id', wallId)
    .single()

  if (!wall) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, brand_name, brand_logo_url, brand_color')
    .eq('id', wall.user_id)
    .single()

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

  const plan = (profile?.plan ?? 'free') as Plan
  return { wall, profile, testimonials, planConfig: PLANS[plan] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { wallId } = await params
  const data = await getData(wallId)
  if (!data) return {}
  const brand = data.profile?.brand_name ?? 'Testimonials'
  return {
    title: `${data.wall.name} — ${brand}`,
    description: `Real testimonials from ${brand} customers.`,
  }
}

export default async function WallPage({ params }: Props) {
  const { wallId } = await params
  const data = await getData(wallId)
  if (!data) notFound()

  const { wall, profile, testimonials, planConfig } = data
  const brandName = profile?.brand_name ?? 'Trustwall'
  const brandColor = profile?.brand_color ?? '#111111'
  const jsonLd = planConfig.seoEmbed ? buildJsonLd(brandName, testimonials) : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="min-h-screen bg-canvas py-12 px-4">
        {/* Brand header */}
        <div className="max-w-5xl mx-auto mb-10 text-center">
          {profile?.brand_logo_url ? (
            <img src={profile.brand_logo_url} alt={brandName} className="h-10 mx-auto mb-3 object-contain" />
          ) : (
            <span className="text-2xl font-bold" style={{ color: brandColor }}>{brandName}</span>
          )}
          <h1 className="text-3xl font-bold text-ink mt-2">{wall.name}</h1>
          {testimonials.length > 0 && (
            <p className="text-muted mt-2 text-sm">{testimonials.length} verified {testimonials.length === 1 ? 'review' : 'reviews'}</p>
          )}
        </div>

        {/* Testimonials grid */}
        <div className="max-w-5xl mx-auto">
          {testimonials.length === 0 ? (
            <p className="text-center text-tertiary">No testimonials yet.</p>
          ) : wall.layout === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map(t => <Card key={t.id} t={t} />)}
            </div>
          ) : wall.layout === 'carousel' ? (
            <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory">
              {testimonials.map(t => (
                <div key={t.id} className="snap-start shrink-0 w-80">
                  <Card t={t} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5 max-w-2xl mx-auto">
              {testimonials.map(t => <Card key={t.id} t={t} />)}
            </div>
          )}
        </div>

        {/* Powered by footer — Free plan only */}
        {planConfig.brandingFooter && (
          <div className="text-center mt-10 text-xs text-tertiary">
            Powered by{' '}
            <a href="https://trustwall.app" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
              Trustwall
            </a>
          </div>
        )}
      </div>
    </>
  )
}

interface Testimonial {
  id: string
  author_name: string
  author_title?: string | null
  author_photo_url?: string | null
  rating?: number | null
  clean_text?: string | null
  raw_text?: string | null
}

function Card({ t }: { t: Testimonial }) {
  const text = t.clean_text ?? t.raw_text ?? ''
  const initials = t.author_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <article
      className="bg-surface rounded-2xl p-6 shadow-card"
      itemScope
      itemType="https://schema.org/Review"
    >
      {t.rating && (
        <div className="flex gap-0.5 mb-3" aria-label={`${t.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map(n => (
            <span key={n} className={`text-base ${n <= t.rating! ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
          ))}
        </div>
      )}

      {text && (
        <blockquote
          itemProp="reviewBody"
          className="text-muted text-sm leading-relaxed mb-5 m-0 p-0"
        >
          {text}
        </blockquote>
      )}

      <div className="flex items-center gap-3" itemProp="author" itemScope itemType="https://schema.org/Person">
        {t.author_photo_url ? (
          <img
            src={t.author_photo_url}
            alt={t.author_name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-accent-soft text-brand flex items-center justify-center text-sm font-bold shrink-0" aria-hidden>
            {initials}
          </div>
        )}
        <div>
          <strong itemProp="name" className="text-sm font-semibold text-ink block">{t.author_name}</strong>
          {t.author_title && <span className="text-xs text-tertiary">{t.author_title}</span>}
        </div>
      </div>
    </article>
  )
}
