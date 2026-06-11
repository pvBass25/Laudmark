import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { TestimonialsWorkbench } from '@/components/dashboard/TestimonialsWorkbench'
import { DeleteWallButton } from '@/components/dashboard/DeleteWallButton'
import Link from 'next/link'

export default async function WallDetailPage({ params }: { params: Promise<{ wallId: string }> }) {
  const { wallId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: wall }, { data: testimonials }] = await Promise.all([
    supabase
      .from('walls')
      .select('id, name, layout, testimonial_ids')
      .eq('id', wallId)
      .eq('user_id', user!.id)
      .single(),
    supabase
      .from('testimonials')
      .select('id, author_name, author_title, author_photo_url, rating, raw_text, clean_text, pull_quote, themes, sentiment, status, created_at, type, video_url')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
  ])

  if (!wall) notFound()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return (
    <div className="space-y-6">
      <div>
        <Link href="/app/testimonials" className="text-sm text-muted hover:text-ink mb-2 inline-flex items-center gap-1.5">
          <svg width="9" height="9" viewBox="0 0 10 10" className="shrink-0" aria-hidden>
            <path d="M6.5 2 L3.5 5 L6.5 8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Walls &amp; Testimonials
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink">{wall.name}</h1>
            <p className="text-sm text-muted mt-1">
              Approve testimonials, add them to this wall, then grab the embed code.
            </p>
          </div>
          <DeleteWallButton wallId={wall.id} wallName={wall.name} />
        </div>
      </div>

      <TestimonialsWorkbench
        testimonials={testimonials ?? []}
        walls={[wall]}
        appUrl={appUrl}
        initialStatus="all"
      />
    </div>
  )
}
