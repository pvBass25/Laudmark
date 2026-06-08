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
        <h1 className="text-2xl font-bold text-gray-900 leading-[48px]">Overview</h1>
        <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 transition-colors">
            <div className="text-3xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700">Your walls</h2>
          <Link href="/app/walls" className="text-sm text-brand hover:underline">View all</Link>
        </div>
        {!walls?.length ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
            No walls yet.{' '}
            <Link href="/app/walls" className="text-brand hover:underline">Create one</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {walls.map(w => (
              <Link key={w.id} href={`/app/walls/${w.id}`} className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-gray-200 transition-colors">
                <span className="text-sm font-medium text-gray-700">{w.name}</span>
                <span className="text-xs text-gray-400">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
