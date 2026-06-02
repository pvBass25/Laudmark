'use client'
import { useActionState } from 'react'
import { createCollectionPage } from '@/app/app/pages/actions'

export function CreatePageForm() {
  const [error, action, pending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await createCollectionPage(formData)
        return null
      } catch (e) {
        return (e as Error).message
      }
    },
    null
  )

  return (
    <form action={action} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <h2 className="font-semibold text-gray-900">New collection page</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug <span className="text-gray-400 font-normal">(used in the URL)</span></label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">/c/</span>
          <input name="slug" required placeholder="my-coaching" pattern="[a-z0-9-]+"
            className="flex-1 rounded-xl border border-gray-200 bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
        </div>
        <p className="text-xs text-gray-400 mt-1">Lowercase letters, numbers, hyphens only</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Page title</label>
        <input name="title" required defaultValue="Share your experience"
          className="w-full rounded-xl border border-gray-200 bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Prompt question</label>
        <input name="prompt" required placeholder="How has working with us changed things for you?"
          className="w-full rounded-xl border border-gray-200 bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button type="submit" disabled={pending}
        className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-xl hover:bg-brand-strong disabled:opacity-50 transition-colors">
        {pending ? 'Creating…' : 'Create page'}
      </button>
    </form>
  )
}
