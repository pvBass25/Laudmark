'use client'
import { useTransition } from 'react'
import { setWallStatus } from '@/app/app/walls/actions'

export function WallPublishToggle({ id, status }: { id: string; status: 'draft' | 'published' }) {
  const [pending, startTransition] = useTransition()
  const published = status === 'published'
  const next = published ? 'draft' : 'published'

  return (
    <div className="flex items-center gap-3">
      <span
        className={
          published
            ? 'inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700'
            : 'inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700'
        }
      >
        {published ? 'Published' : 'Draft'}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => setWallStatus(id, next))}
        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        {pending ? '…' : published ? 'Unpublish' : 'Publish'}
      </button>
    </div>
  )
}
