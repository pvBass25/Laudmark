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
      <div>
        <h1 className="text-2xl font-bold text-ink">Walls</h1>
        <p className="text-sm text-muted mt-1">Curate testimonials into a wall and grab the embed code.</p>
      </div>

      {walls?.length ? (
        <div className="space-y-3">
          {walls.map(w => (
            <Link
              key={w.id}
              href={`/app/walls/${w.id}`}
              className="flex items-center justify-between bg-surface rounded-2xl shadow-card px-5 py-4 hover:shadow-card-lg transition-shadow"
            >
              <div>
                <div className="font-medium text-ink text-sm">{w.name}</div>
                <div className="text-xs text-tertiary mt-0.5 capitalize">
                  {w.layout} · {w.testimonial_ids?.length ?? 0} testimonial{w.testimonial_ids?.length !== 1 ? 's' : ''}
                </div>
              </div>
              <span className="text-tertiary text-sm">→</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-surface rounded-2xl shadow-card p-12 text-center text-tertiary text-sm">
          No walls yet. Create one below.
        </div>
      )}

      <CreateWallForm />
    </div>
  )
}
