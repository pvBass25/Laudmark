import { createClient } from '@/lib/supabase/server'
import { CreatePageForm } from '@/components/dashboard/CreatePageForm'
import { CopyButton } from '@/components/dashboard/CopyButton'
import { RatingToggle } from '@/components/dashboard/RatingToggle'
import Link from 'next/link'

interface PageRow {
  id: string
  slug: string
  title: string
  created_at: string
  collect_rating: boolean
}

export default async function CollectionPagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Include collect_rating, falling back if migration 0004 isn't applied yet.
  let pages: PageRow[] | null = null
  const withRating = await supabase
    .from('collection_pages')
    .select('id, slug, title, created_at, collect_rating')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  if (withRating.error) {
    const base = await supabase
      .from('collection_pages')
      .select('id, slug, title, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    pages = base.data?.map(p => ({ ...p, collect_rating: true })) ?? null
  } else {
    pages = withRating.data
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Collection Pages</h1>
        <p className="text-sm text-muted mt-1">Each page is a shareable link where clients record a video or write a testimonial — no account needed on their end. Create one per brand, offer, or campaign.</p>
      </div>

      {pages?.length ? (
        <div className="space-y-3">
          {pages.map(p => (
            <div key={p.id} className="bg-surface rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-ink text-sm">{p.title}</div>
                <div className="text-xs text-tertiary mt-0.5">/c/{p.slug}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <RatingToggle pageId={p.id} initial={p.collect_rating} />
                <CopyButton path={`/c/${p.slug}`} />
                <Link
                  href={`/c/${p.slug}`}
                  target="_blank"
                  className="text-xs px-3 py-1.5 rounded-lg bg-subtle text-ink hover:bg-tertiary-soft transition-colors"
                >
                  Preview ↗
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface rounded-2xl p-12 text-center text-tertiary text-sm">
          No collection pages yet. Create your first one below.
        </div>
      )}

      <CreatePageForm appUrl={appUrl} />
    </div>
  )
}
