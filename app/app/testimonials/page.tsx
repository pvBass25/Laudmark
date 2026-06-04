import { createClient } from '@/lib/supabase/server'
import { TestimonialCard } from '@/components/dashboard/TestimonialCard'

const TABS = ['all', 'pending', 'approved', 'hidden'] as const

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('testimonials')
    .select('id, author_name, author_title, author_photo_url, rating, raw_text, clean_text, pull_quote, themes, sentiment, status, created_at, type, video_url')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const activeTab = TABS.includes(status as typeof TABS[number]) ? status as typeof TABS[number] : 'all'
  if (activeTab !== 'all') query = query.eq('status', activeTab)

  const { data: testimonials } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Testimonials</h1>
          <p className="text-sm text-muted mt-1">Review, approve, edit, and hide what you collect.</p>
        </div>
        <span className="text-sm text-tertiary">{testimonials?.length ?? 0} shown</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-subtle p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <a
            key={tab}
            href={tab === 'all' ? '/app/testimonials' : `/app/testimonials?status=${tab}`}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-surface shadow-card text-ink'
                : 'text-muted hover:text-ink'
            }`}
          >
            {tab}
          </a>
        ))}
      </div>

      {!testimonials?.length && (
        <div className="bg-surface rounded-2xl shadow-card p-16 text-center text-tertiary">
          No testimonials{activeTab !== 'all' ? ` with status "${activeTab}"` : ''} yet.
        </div>
      )}

      <div className="space-y-4">
        {testimonials?.map(t => (
          <TestimonialCard key={t.id} testimonial={t} />
        ))}
      </div>
    </div>
  )
}
