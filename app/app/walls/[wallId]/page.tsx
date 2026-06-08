import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { WallCurator } from '@/components/dashboard/WallCurator'
import { WallPublishToggle } from '@/components/dashboard/WallPublishToggle'
import Link from 'next/link'

export default async function WallDetailPage({ params }: { params: Promise<{ wallId: string }> }) {
  const { wallId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: wall }, { data: approved }] = await Promise.all([
    supabase.from('walls').select('id, name, layout, testimonial_ids, status, created_at').eq('id', wallId).eq('user_id', user!.id).single(),
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
      <div className="flex items-center gap-3">
        <Link href="/app/walls" className="text-sm text-gray-400 hover:text-gray-600">← Walls</Link>
        <h1 className="text-2xl font-bold text-gray-900 leading-[48px]">{wall.name}</h1>
        <div className="ml-auto">
          <WallPublishToggle id={wall.id} status={wall.status} />
        </div>
      </div>
      {wall.status !== 'published' && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          This wall is a draft — its hosted page and embed are not publicly visible until you publish it.
        </p>
      )}

      <WallCurator
        wall={wall}
        approved={approved ?? []}
        appUrl={appUrl}
      />
    </div>
  )
}
