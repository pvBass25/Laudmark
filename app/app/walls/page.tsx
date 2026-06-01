import { createClient } from '@/lib/supabase/server'
import { CreateWallForm } from '@/components/dashboard/CreateWallForm'
import Link from 'next/link'

export default async function WallsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: walls } = await supabase
    .from('walls')
    .select('id, name, layout, testimonial_ids, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Walls</h1>

      {walls?.length ? (
        <div className="space-y-3">
          {walls.map(w => (
            <Link
              key={w.id}
              href={`/app/walls/${w.id}`}
              className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-5 py-4 hover:border-gray-200 transition-colors"
            >
              <div>
                <div className="font-medium text-gray-900 text-sm">{w.name}</div>
                <div className="text-xs text-gray-400 mt-0.5 capitalize">
                  {w.layout} · {w.testimonial_ids?.length ?? 0} testimonial{w.testimonial_ids?.length !== 1 ? 's' : ''}
                </div>
              </div>
              <span className="text-gray-300 text-sm">→</span>
            </Link>
          ))}
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
