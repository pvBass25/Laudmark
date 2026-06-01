'use client'
import { useActionState } from 'react'
import { createWall } from '@/app/app/walls/actions'

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
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
        <select name="layout" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="grid">Grid</option>
          <option value="list">List</option>
          <option value="carousel">Carousel</option>
        </select>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button type="submit" disabled={pending}
        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
        {pending ? 'Creating…' : 'Create wall'}
      </button>
    </form>
  )
}
