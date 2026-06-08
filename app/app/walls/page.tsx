import { createClient } from '@/lib/supabase/server'
import { CreateWallForm } from '@/components/dashboard/CreateWallForm'
import Link from 'next/link'

export default async function WallsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: walls } = await supabase
    .from('walls')
    .select('id, name, layout, testimonial_ids, created_at, status')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 leading-[48px]">Walls</h1>

      {walls?.length ? (
        <div className="space-y-3">
          {walls.map(w => {
            const published = w.status === 'published'
            const count = w.testimonial_ids?.length ?? 0
            return (
              <Link
                key={w.id}
                href={`/app/walls/${w.id}`}
                className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-5 py-4 hover:border-gray-200 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{w.name}</span>
                    <span
                      className={
                        published
                          ? 'inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700'
                          : 'inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700'
                      }
                    >
                      {published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 capitalize">
                    {w.layout} · {count} testimonial{count !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 normal-case">
                    Created {fmtDate(w.created_at)} · by {user!.email}
                  </div>
                </div>
                <span className="text-gray-300 text-sm">→</span>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          No walls yet. Create one below.
        </div>
      )}

      <CreateWallForm />
    </div>
  )
}
