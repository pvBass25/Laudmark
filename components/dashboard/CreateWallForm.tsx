'use client'
import { useActionState } from 'react'
import { createWall } from '@/app/app/walls/actions'
import { LayoutPicker } from './LayoutPicker'

export function CreateWallForm() {
  const [error, action, pending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await createWall(formData)
        return null
      } catch (e) {
        return (e as Error).message
      }
    },
    null
  )

  return (
    <form action={action} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <h2 className="font-semibold text-gray-900">New wall</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Wall name</label>
        <input name="name" required placeholder="Wall of Love"
          className="w-full rounded-xl border border-gray-200 bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Layout</label>
        <LayoutPicker name="layout" defaultValue="grid" />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button type="submit" disabled={pending}
        className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-xl hover:bg-brand-strong disabled:opacity-50 transition-colors">
        {pending ? 'Creating…' : 'Create wall'}
      </button>
    </form>
  )
}
