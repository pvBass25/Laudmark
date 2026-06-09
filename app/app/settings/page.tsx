import { createClient } from '@/lib/supabase/server'
import { updateBrandSettings } from './actions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('brand_name, brand_color, niche')
    .eq('id', user!.id)
    .single()

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="text-sm text-muted mt-1">Control how your collection pages and walls look to clients — your brand name, accent colour, and niche. These shape the AI prompts and the pages clients see.</p>
      </div>

      {/* Brand */}
      <form action={updateBrandSettings} className="bg-surface rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-ink">Brand</h2>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Brand name</label>
          <input
            name="brand_name"
            defaultValue={profile?.brand_name ?? ''}
            placeholder="Acme Coaching"
            className="w-full rounded-lg bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Brand colour</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="brand_color"
              defaultValue={profile?.brand_color ?? '#111111'}
              className="w-10 h-10 rounded-lg cursor-pointer"
            />
            <span className="text-sm text-tertiary">Shown on your collection page header</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Niche</label>
          <input
            name="niche"
            defaultValue={profile?.niche ?? 'coach'}
            placeholder="coach, course creator, consultant…"
            className="w-full rounded-lg bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <p className="text-xs text-tertiary mt-1">Used by AI to generate better prompt questions and request emails</p>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-brand text-on-brand text-sm font-medium rounded-lg hover:bg-brand-strong transition-colors"
        >
          Save brand
        </button>
      </form>
    </div>
  )
}
