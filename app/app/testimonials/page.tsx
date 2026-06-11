import { createClient } from '@/lib/supabase/server'
import { TestimonialsWorkbench } from '@/components/dashboard/TestimonialsWorkbench'

const STATUS_TABS = ['all', 'pending', 'approved', 'hidden'] as const

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: testimonials }, { data: walls }] = await Promise.all([
    supabase
      .from('testimonials')
      .select('id, author_name, author_title, author_photo_url, rating, raw_text, clean_text, pull_quote, themes, sentiment, status, created_at, type, video_url')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('walls')
      .select('id, name, layout, testimonial_ids')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
  ])

  const initialStatus = STATUS_TABS.includes(status as typeof STATUS_TABS[number])
    ? (status as typeof STATUS_TABS[number])
    : 'all'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Walls &amp; Testimonials</h1>
        <p className="text-sm text-muted mt-1">
          Review what clients submit, then group the approved ones into walls you can embed — all in one place.
        </p>
      </div>

      <TestimonialsWorkbench
        testimonials={testimonials ?? []}
        walls={walls ?? []}
        appUrl={appUrl}
        initialStatus={initialStatus}
        allowAddWall
        showStats
      />
    </div>
  )
}
