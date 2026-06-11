'use client'
import { useState, useTransition } from 'react'
import { setCollectionPageRating } from '@/app/app/pages/actions'

// Per-page toggle for whether the public collection page shows a star-rating picker.
// State is carried by fill color (no borders), per the style guide.
export function RatingToggle({ pageId, initial }: { pageId: string; initial: boolean }) {
  const [on, setOn] = useState(initial)
  const [pending, startTransition] = useTransition()

  function toggle() {
    const next = !on
    setOn(next)
    startTransition(() => setCollectionPageRating(pageId, next))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={on}
      title={on ? 'Star rating shown on this page' : 'Star rating hidden on this page'}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
        on ? 'bg-accent-soft text-brand-strong' : 'bg-subtle text-muted hover:text-ink'
      }`}
    >
      ★ Rating {on ? 'on' : 'off'}
    </button>
  )
}
