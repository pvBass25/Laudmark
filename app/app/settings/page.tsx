import { createClient } from '@/lib/supabase/server'
import { updateBrandSettings } from './actions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('brand_name, brand_color, niche, plan')
    .eq('id', user!.id)
    .single()

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Plan: <span className="capitalize font-medium text-gray-600">{profile?.plan ?? 'free'}</span></p>
      </div>

      <form action={updateBrandSettings} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">Brand</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand name</label>
          <input
            name="brand_name"
            defaultValue={profile?.brand_name ?? ''}
            placeholder="Acme Coaching"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand colour</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="brand_color"
              defaultValue={profile?.brand_color ?? '#111111'}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
            />
            <span className="text-sm text-gray-400">Shown on your collection page header</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Niche</label>
          <input
            name="niche"
            defaultValue={profile?.niche ?? 'coach'}
            placeholder="coach, course creator, consultant…"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <p className="text-xs text-gray-400 mt-1">Used by AI to generate better prompt questions and request emails</p>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Save settings
        </button>
      </form>
    </div>
  )
}
