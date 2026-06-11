'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutPicker, type WallLayout } from './LayoutPicker'
import { setWallLayout } from '@/app/app/walls/actions'

// Owner-only bar on the public wall preview page: switch the layout and it
// auto-saves (no Save button), then refreshes so the wall re-renders in the new
// layout. The change persists to the DB and shows in the dashboard too.
export function WallLayoutEditor({ wallId, layout }: { wallId: string; layout: WallLayout }) {
  const router = useRouter()
  const [current, setCurrent] = useState<WallLayout>(layout)
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function change(next: WallLayout) {
    if (next === current) return
    setCurrent(next)
    setSaved(false)
    startTransition(async () => {
      await setWallLayout(wallId, next)
      setSaved(true)
      router.refresh()
    })
  }

  return (
    <div className="max-w-5xl mx-auto mb-8">
      <div className="bg-surface rounded-2xl p-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-ink shrink-0">Layout</span>
          <LayoutPicker value={current} onChange={change} />
        </div>
        <span className="text-xs text-tertiary">
          {pending ? 'Saving…' : saved ? 'Saved ✓' : "You're the owner — changes save automatically."}
        </span>
      </div>
    </div>
  )
}
