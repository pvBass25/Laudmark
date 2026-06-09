import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { WallCurator } from '@/components/dashboard/WallCurator'
import { DeleteWallButton } from '@/components/dashboard/DeleteWallButton'
import Link from 'next/link'

export default async function WallDetailPage({ params }: { params: Promise<{ wallId: string }> }) {
  const { wallId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: wall }, { data: approved }] = await Promise.all([
    supabase.from('walls').select('id, name, layout, testimonial_ids').eq('id', wallId).eq('user_id', user!.id).single(),
    supabase.from('testimonials')
      .select('id, author_name, author_title, author_photo_url, rating, clean_text, raw_text')
      .eq('user_id', user!.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false }),
  ])

  if (!wall) notFound()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return (
    <div className="space-y-6">
      <div>
        <Link href="/app/testimonials" className="text-sm text-muted hover:text-ink mb-2 inline-block">← Testimonials &amp; Walls</Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink">{wall.name}</h1>
            <p className="text-sm text-muted mt-1">Choose which approved testimonials appear in this wall, set the layout, then copy the embed code to drop it onto your site.</p>
          </div>
          <DeleteWallButton wallId={wall.id} wallName={wall.name} />
        </div>
      </div>

      <WallCurator
        wall={wall}
        approved={approved ?? []}
        appUrl={appUrl}
      />
    </div>
  )
}
