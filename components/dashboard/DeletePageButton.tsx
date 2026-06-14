'use client'
import { useState, useTransition } from 'react'
import { deleteCollectionPage } from '@/app/app/pages/actions'

// Deleting a collection page cascades to its testimonials (FK on delete
// cascade), so the confirm step spells that out with the live count.
export function DeletePageButton({ pageId, testimonialCount }: { pageId: string; testimonialCount: number }) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      try {
        setError(null)
        await deleteCollectionPage(pageId)
        // On success the revalidated page list re-renders without this row.
      } catch (e) {
        setError((e as Error).message || 'Delete failed — please try again.')
      }
    })
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:opacity-90 transition-opacity"
      >
        Delete
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      <span className="text-xs text-red-700">
        {error ??
          (testimonialCount > 0
            ? `Also deletes its ${testimonialCount} testimonial${testimonialCount === 1 ? '' : 's'} — can't be undone.`
            : "Can't be undone.")}
      </span>
      <button
        onClick={handleDelete}
        disabled={pending}
        className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {pending ? 'Deleting…' : 'Confirm delete'}
      </button>
      <button
        onClick={() => setConfirming(false)}
        disabled={pending}
        className="text-xs px-3 py-1.5 rounded-lg bg-subtle text-ink hover:bg-tertiary-soft disabled:opacity-50 transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}
