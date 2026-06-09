import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ count: total }, { count: pending }, { count: approved }, { data: walls }] = await Promise.all([
    supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('user_id', user!.id).eq('status', 'pending'),
    supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('user_id', user!.id).eq('status', 'approved'),
    supabase.from('walls').select('id, name').eq('user_id', user!.id).limit(5),
  ])

  const stats = [
    { label: 'Total testimonials', value: total ?? 0, href: '/app/testimonials' },
    { label: 'Pending review', value: pending ?? 0, href: '/app/testimonials?status=pending' },
    { label: 'Approved', value: approved ?? 0, href: '/app/testimonials?status=approved' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Overview</h1>
        <p className="text-sm text-muted mt-1">A quick read on what&rsquo;s coming in and what&rsquo;s live — how many testimonials you&rsquo;ve collected, what&rsquo;s waiting for your review, and your most recent walls.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="bg-surface rounded-2xl p-6">
            <div className="text-3xl font-bold text-ink">{s.value}</div>
            <div className="text-sm text-muted mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-ink">Your walls</h2>
          <Link href="/app/testimonials" className="text-sm text-brand hover:underline">View all</Link>
        </div>
        {!walls?.length ? (
          <div className="bg-surface rounded-2xl p-8 text-center text-tertiary text-sm">
            No walls yet.{' '}
            <Link href="/app/walls" className="text-brand hover:underline">Create one</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {walls.map(w => (
              <Link key={w.id} href={`/app/walls/${w.id}`} className="flex items-center justify-between bg-surface rounded-xl px-4 py-3">
                <span className="text-sm font-medium text-ink">{w.name}</span>
                <span className="text-xs text-tertiary">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
