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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
        <span className="text-sm text-gray-400">{testimonials?.length ?? 0} shown</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <a
            key={tab}
            href={tab === 'all' ? '/app/testimonials' : `/app/testimonials?status=${tab}`}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </a>
        ))}
      </div>

      {!testimonials?.length && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
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
