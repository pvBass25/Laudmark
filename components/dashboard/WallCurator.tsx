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

  // Testimonials currently picked for this wall, in the approved-list order — drives the live preview.
  const previewItems = approved.filter(t => selectedIds.has(t.id))

  const widgetCode = `<script async src="${appUrl}/widget.js" data-wall="${wall.id}"></script>`

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="space-y-4">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-muted mb-2">Layout</label>
          <LayoutPicker value={layout} onChange={v => { setLayout(v); setSaved(false) }} />
        </div>

        <LayoutPreview items={previewItems} layout={layout} />

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={pending}
            className="px-4 py-1.5 bg-brand text-on-brand text-sm font-medium rounded-lg hover:bg-brand-strong disabled:opacity-50 transition-colors"
          >
            {pending ? 'Saving…' : saved ? '✓ Saved' : 'Save wall'}
          </button>
          <span className="text-sm text-muted">{selectedIds.size} selected</span>
        </div>
      </div>

      {/* Testimonial picker */}
      {approved.length === 0 ? (
        <div className="bg-surface rounded-2xl p-12 text-center text-muted text-sm">
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
                className={`text-left p-4 rounded-2xl transition-colors ${
                  checked
                    ? 'bg-accent-soft'
                    : 'bg-surface hover:bg-subtle'
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
                    <div className="text-sm font-medium text-ink">{t.author_name}</div>
                    {t.author_title && <div className="text-xs text-tertiary">{t.author_title}</div>}
                  </div>
                  <div className={`ml-auto w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${checked ? 'bg-brand' : 'bg-grey10'}`}>
                    {checked && <span className="text-on-brand text-xs">✓</span>}
                  </div>
                </div>
                {t.rating && (
                  <div className="flex gap-0.5 mb-1">
                    {[1,2,3,4,5].map(n => <span key={n} className={`text-xs ${n <= t.rating! ? 'text-amber-400' : 'text-gray-200'}`}>★</span>)}
                  </div>
                )}
                {text && <p className="text-xs text-muted line-clamp-3 leading-relaxed">{text}</p>}
              </button>
            )
          })}
        </div>
      )}

      {/* Embed code */}
      <div className="bg-surface rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-ink">Get embed code</h2>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            &ldquo;Embedding&rdquo; means showing this wall of testimonials on your own website. Pick one of
            the two options below, copy it, and paste it onto your site where you want the reviews to
            appear — no coding needed. Most site builders (Webflow, WordPress, Squarespace, Kajabi…)
            have a &ldquo;code&rdquo; or &ldquo;embed&rdquo; block you can paste into.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-ink">
                Option 1 · Live widget <span className="text-xs text-tertiary font-normal">(recommended)</span>
              </p>
              <CopyButton text={widgetCode} label="Copy" />
            </div>
            <p className="text-xs text-muted mb-2 leading-relaxed">
              Paste this single line into your site once. Your testimonials appear automatically and
              stay up to date on their own — when you approve a new one here, it shows up on your site
              too.
            </p>
            <pre className="bg-grey10 rounded-xl p-3 text-xs text-muted overflow-x-auto">{widgetCode}</pre>
          </div>

          <div>
            <p className="text-sm font-medium text-ink mb-1">Option 2 · Hosted wall page</p>
            <p className="text-xs text-muted mb-2 leading-relaxed">
              No website yet, or just want a link to share? This is a ready-made page we host for you
              showing the same wall — drop it in an email, a social bio, or a &ldquo;Reviews&rdquo; link in
              your menu. Use <span className="font-medium">Preview</span> to see how it looks.
            </p>
            <div className="flex items-center gap-2">
              <code className="text-xs text-muted bg-grey10 rounded-lg px-3 py-2 flex-1 truncate">
                {appUrl}/wall/{wall.id}
              </code>
              <CopyButton text={`${appUrl}/wall/${wall.id}`} label="Copy" />
              <a
                href={`/wall/${wall.id}`}
                target="_blank"
                className="text-xs px-3 py-1.5 rounded-lg bg-subtle text-ink hover:bg-tertiary-soft transition-colors"
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

// ── Live layout preview ──────────────────────────────────────────────────────
// Shows the picked testimonials arranged in the chosen layout, on a canvas-like
// panel so it reads as "this is how it'll look on your page". Falls back to
// skeleton cards when nothing's selected yet, so the layout shape is still clear.
function LayoutPreview({ items, layout }: { items: Testimonial[]; layout: WallLayout }) {
  const shown = items.slice(0, 6)
  const hasItems = shown.length > 0

  const wrapClass =
    layout === 'grid'
      ? 'grid grid-cols-2 sm:grid-cols-3 gap-3'
      : layout === 'carousel'
      ? 'flex gap-3 overflow-x-auto pb-1'
      : 'flex flex-col gap-3'

  const itemClass = layout === 'carousel' ? 'w-44 shrink-0' : ''

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-muted">Preview</label>
        <span className="text-xs text-tertiary capitalize">{layout} layout</span>
      </div>
      <div className="bg-subtle rounded-2xl p-4">
        <div className={wrapClass}>
          {hasItems
            ? shown.map(t => <MiniCard key={t.id} t={t} className={itemClass} />)
            : Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} className={itemClass} />)}
        </div>
      </div>
      <p className="text-xs text-tertiary mt-2">
        {hasItems
          ? `Showing ${shown.length} of ${items.length} selected — this is roughly how visitors will see your wall.`
          : 'Select testimonials below and they’ll appear here in your chosen layout.'}
      </p>
    </div>
  )
}

function MiniCard({ t, className = '' }: { t: Testimonial; className?: string }) {
  const text = t.clean_text ?? t.raw_text ?? ''
  const initials = t.author_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className={`bg-surface rounded-lg p-3 ${className}`}>
      {t.rating && (
        <div className="flex gap-0.5 mb-1.5">
          {[1, 2, 3, 4, 5].map(n => (
            <span key={n} className={`text-[11px] ${n <= t.rating! ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
          ))}
        </div>
      )}
      {text && <p className="text-[11px] text-muted leading-relaxed line-clamp-3">&ldquo;{text}&rdquo;</p>}
      <div className="flex items-center gap-2 mt-2">
        {t.author_photo_url ? (
          <img src={t.author_photo_url} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-accent-soft text-brand flex items-center justify-center text-[9px] font-bold shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-ink truncate">{t.author_name}</div>
          {t.author_title && <div className="text-[10px] text-tertiary truncate">{t.author_title}</div>}
        </div>
      </div>
    </div>
  )
}

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-surface rounded-lg p-3 space-y-2 ${className}`}>
      <div className="h-2 w-12 bg-grey10 rounded" />
      <div className="h-2 w-full bg-grey10 rounded" />
      <div className="h-2 w-5/6 bg-grey10 rounded" />
      <div className="flex items-center gap-2 pt-1">
        <div className="w-6 h-6 rounded-full bg-grey10 shrink-0" />
        <div className="h-2 w-14 bg-grey10 rounded" />
      </div>
    </div>
  )
}
