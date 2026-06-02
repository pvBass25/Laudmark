'use client'
import { useState, useTransition } from 'react'
import { updateWall } from '@/app/app/walls/actions'
import { CopyButton } from './CopyButton'
import { LayoutPicker, type WallLayout } from './LayoutPicker'

interface Testimonial {
  id: string
  author_name: string
  author_title: string | null
  clean_text: string | null
  raw_text: string | null
  rating: number | null
  author_photo_url: string | null
}

interface Wall {
  id: string
  name: string
  layout: string
  testimonial_ids: string[]
}

interface Props {
  wall: Wall
  approved: Testimonial[]
  appUrl: string
}

export function WallCurator({ wall, approved, appUrl }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(wall.testimonial_ids))
  const [layout, setLayout] = useState<WallLayout>(wall.layout as WallLayout)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  function toggle(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setSaved(false)
  }

  function handleSave() {
    startTransition(async () => {
      await updateWall(wall.id, [...selectedIds], layout)
      setSaved(true)
    })
  }

  const widgetCode = `<script async src="${appUrl}/widget.js" data-wall="${wall.id}"></script>`

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="space-y-4">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
          <LayoutPicker value={layout} onChange={v => { setLayout(v); setSaved(false) }} />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={pending}
            className="px-4 py-1.5 bg-brand text-white text-sm font-medium rounded-xl hover:bg-brand-strong disabled:opacity-50 transition-colors"
          >
            {pending ? 'Saving…' : saved ? '✓ Saved' : 'Save wall'}
          </button>
          <span className="text-sm text-gray-400">{selectedIds.size} selected</span>
        </div>
      </div>

      {/* Testimonial picker */}
      {approved.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          No approved testimonials yet. Approve some from the{' '}
          <a href="/app/testimonials" className="text-brand hover:underline">Testimonials</a> page.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {approved.map(t => {
            const checked = selectedIds.has(t.id)
            const text = t.clean_text ?? t.raw_text ?? ''
            const initials = t.author_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            return (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                className={`text-left p-4 rounded-2xl border-2 transition-all ${
                  checked
                    ? 'border-brand bg-accent-soft'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {t.author_photo_url ? (
                    <img src={t.author_photo_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent-soft text-brand flex items-center justify-center text-xs font-bold shrink-0">
                      {initials}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900">{t.author_name}</div>
                    {t.author_title && <div className="text-xs text-gray-400">{t.author_title}</div>}
                  </div>
                  <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${checked ? 'border-brand bg-brand' : 'border-gray-300'}`}>
                    {checked && <span className="text-white text-xs">✓</span>}
                  </div>
                </div>
                {t.rating && (
                  <div className="flex gap-0.5 mb-1">
                    {[1,2,3,4,5].map(n => <span key={n} className={`text-xs ${n <= t.rating! ? 'text-amber-400' : 'text-gray-200'}`}>★</span>)}
                  </div>
                )}
                {text && <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{text}</p>}
              </button>
            )
          })}
        </div>
      )}

      {/* Embed code */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Get embed code</h2>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium text-gray-700">Live widget <span className="text-xs text-gray-400 font-normal">(auto-updates)</span></p>
              <CopyButton text={widgetCode} label="Copy" />
            </div>
            <pre className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 overflow-x-auto">{widgetCode}</pre>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">Hosted wall page</p>
            <div className="flex items-center gap-2">
              <code className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 flex-1 truncate">
                {appUrl}/wall/{wall.id}
              </code>
              <CopyButton text={`${appUrl}/wall/${wall.id}`} label="Copy" />
              <a
                href={`/wall/${wall.id}`}
                target="_blank"
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Preview ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
