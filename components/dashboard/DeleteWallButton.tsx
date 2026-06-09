'use client'
import { useEffect, useState, useTransition } from 'react'
import { deleteWall } from '@/app/app/walls/actions'

// Destructive action uses the red SEMANTIC family (STYLEGUIDE §8 — state, not
// brand). Modal is borderless + shadowless on an ink/40 backdrop, per the
// retired-shadow rule. deleteWall() redirects to /app/walls on success.
export function DeleteWallButton({ wallId, wallName }: { wallId: string; wallName: string }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  // Close on Escape (ignored mid-delete).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !pending) setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, pending])

  function confirmDelete() {
    startTransition(async () => { await deleteWall(wallId) })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-1.5 text-sm font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
      >
        Delete wall
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-wall-title"
          onClick={() => { if (!pending) setOpen(false) }}
        >
          <div
            className="bg-surface rounded-2xl p-6 w-full max-w-sm space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 id="delete-wall-title" className="font-semibold text-ink">Delete this wall?</h2>
            <p className="text-sm text-muted leading-relaxed">
              <span className="text-ink font-medium">{wallName}</span> will be permanently deleted,
              along with its embed code. Your testimonials stay safe — only this wall is removed.
              This can&rsquo;t be undone.
            </p>
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setOpen(false)}
                disabled={pending}
                className="px-4 py-2 text-sm rounded-lg bg-subtle text-ink hover:bg-tertiary-soft disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={pending}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {pending ? 'Deleting…' : 'Delete wall'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
