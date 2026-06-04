import { createClient } from '@/lib/supabase/server'
import { CreatePageForm } from '@/components/dashboard/CreatePageForm'
import { CopyButton } from '@/components/dashboard/CopyButton'
import Link from 'next/link'

export default async function CollectionPagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: pages } = await supabase
    .from('collection_pages')
    .select('id, slug, title, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Collection pages</h1>
        <p className="text-sm text-muted mt-1">Create and share links where clients leave testimonials.</p>
      </div>

      {pages?.length ? (
        <div className="space-y-3">
          {pages.map(p => (
            <div key={p.id} className="bg-surface rounded-2xl shadow-card px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-ink text-sm">{p.title}</div>
                <div className="text-xs text-tertiary mt-0.5">/c/{p.slug}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <CopyButton text={`${appUrl}/c/${p.slug}`} />
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
        <div className="bg-surface rounded-2xl shadow-card p-12 text-center text-tertiary text-sm">
          No collection pages yet. Create your first one below.
        </div>
      )}

      <CreatePageForm appUrl={appUrl} />
    </div>
  )
}
