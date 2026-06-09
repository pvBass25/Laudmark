'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TestimonialCard } from './TestimonialCard'
import { CopyButton } from './CopyButton'
import { updateWall, createWallNamed } from '@/app/app/walls/actions'

// Matches the shape TestimonialCard needs.
interface Testimonial {
  id: string
  author_name: string
  author_title: string | null
  author_photo_url: string | null
  rating: number | null
  raw_text: string | null
  clean_text: string | null
  pull_quote: string | null
  themes: string[]
  sentiment: string | null
  status: string
  created_at: string
  type: string
  video_url: string | null
}

interface Wall {
  id: string
  name: string
  layout: string
  testimonial_ids: string[]
}

const STATUS_TABS = ['all', 'pending', 'approved', 'hidden'] as const
type StatusTab = (typeof STATUS_TABS)[number]

export function TestimonialsWorkbench({
  testimonials,
  walls,
  appUrl,
  initialStatus,
}: {
  testimonials: Testimonial[]
  walls: Wall[]
  appUrl: string
  initialStatus: StatusTab
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [statusFilter, setStatusFilter] = useState<StatusTab>(initialStatus)
  const [activeWallId, setActiveWallId] = useState<string | null>(walls[0]?.id ?? null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [savingNew, setSavingNew] = useState(false)

  // Local membership so add/remove feels instant; persisted to the server in the background.
  const [membership, setMembership] = useState<Record<string, Set<string>>>(() =>
    Object.fromEntries(walls.map(w => [w.id, new Set(w.testimonial_ids)]))
  )

  const activeWall = walls.find(w => w.id === activeWallId) ?? null
  const activeSet = activeWallId ? membership[activeWallId] : undefined

  function toggleMembership(testimonialId: string) {
    if (!activeWallId) return
    setMembership(prev => {
      const next = { ...prev }
      const set = new Set(next[activeWallId] ?? [])
      if (set.has(testimonialId)) set.delete(testimonialId)
      else set.add(testimonialId)
      next[activeWallId] = set
      const layout = walls.find(w => w.id === activeWallId)?.layout ?? 'grid'
      startTransition(() => updateWall(activeWallId, [...set], layout))
      return next
    })
  }

  async function handleCreate() {
    const name = newName.trim()
    if (!name || savingNew) return
    setSavingNew(true)
    try {
      const id = await createWallNamed(name, 'grid')
      setMembership(prev => ({ ...prev, [id]: new Set() }))
      setActiveWallId(id)
      setNewName('')
      setCreating(false)
      router.refresh()
    } finally {
      setSavingNew(false)
    }
  }

  const filtered = statusFilter === 'all' ? testimonials : testimonials.filter(t => t.status === statusFilter)
  const widgetCode = activeWall ? `<script async src="${appUrl}/widget.js" data-wall="${activeWall.id}"></script>` : ''

  return (
    <div className="space-y-10">
      {/* ── WALLS ───────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink">Walls</h2>
          <button
            onClick={() => setCreating(c => !c)}
            className="text-xs px-3 py-1.5 rounded-lg bg-subtle text-ink hover:bg-tertiary-soft font-medium transition-colors"
          >
            {creating ? 'Cancel' : '+ New wall'}
          </button>
        </div>

        {creating && (
          <div className="bg-surface rounded-2xl p-4 flex items-center gap-2">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
              placeholder="Wall name (e.g. Homepage)"
              className="flex-1 rounded-lg bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            <button
              onClick={handleCreate}
              disabled={savingNew || !newName.trim()}
              className="px-4 py-2 bg-brand text-on-brand text-sm font-medium rounded-lg hover:bg-brand-strong disabled:opacity-50 transition-colors"
            >
              {savingNew ? 'Creating…' : 'Create'}
            </button>
          </div>
        )}

        {walls.length === 0 ? (
          !creating && (
            <div className="bg-surface rounded-2xl p-8 text-center text-tertiary text-sm">
              No walls yet. Create one to start grouping approved testimonials into a wall you can embed.
            </div>
          )
        ) : (
          <>
            {/* Wall selector — segmented control, matching the Testimonials status tabs */}
            <div className="flex gap-1 bg-subtle p-1 rounded-lg w-fit max-w-full overflow-x-auto">
              {walls.map(w => {
                const active = w.id === activeWallId
                const count = membership[w.id]?.size ?? 0
                return (
                  <button
                    key={w.id}
                    onClick={() => setActiveWallId(w.id)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                      active ? 'bg-surface text-ink' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {w.name} <span className="opacity-60 font-normal">· {count}</span>
                  </button>
                )
              })}
            </div>

            {/* Active wall panel */}
            {activeWall && (
              <div className="bg-surface rounded-2xl p-6 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-ink">{activeWall.name}</p>
                    <p className="text-sm text-muted mt-0.5">
                      {activeSet?.size ?? 0} testimonials added — tick approved ones below to add more.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <CopyButton text={widgetCode} label="Copy embed" />
                    <a
                      href={`/wall/${activeWall.id}`}
                      target="_blank"
                      className="text-xs px-3 py-1.5 rounded-lg bg-subtle text-ink hover:bg-tertiary-soft transition-colors"
                    >
                      Preview ↗
                    </a>
                    <Link
                      href={`/app/walls/${activeWall.id}`}
                      className="text-xs px-3 py-1.5 rounded-lg bg-subtle text-ink hover:bg-tertiary-soft transition-colors"
                    >
                      Open wall →
                    </Link>
                  </div>
                </div>
                <p className="text-xs text-tertiary">
                  Only approved testimonials show in the live embed. Use <span className="font-medium">Open wall</span> to
                  set the layout, see the full embed options, or delete the wall.
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink">Testimonials</h2>
          <span className="text-sm text-tertiary">{filtered.length} shown</span>
        </div>

        {/* Status filter */}
        <div className="flex gap-1 bg-subtle p-1 rounded-lg w-fit">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                statusFilter === tab ? 'bg-surface text-ink' : 'text-muted hover:text-ink'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-surface rounded-2xl p-16 text-center text-tertiary">
            No testimonials{statusFilter !== 'all' ? ` with status “${statusFilter}”` : ''} yet.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(t => (
              <TestimonialCard
                key={t.id}
                testimonial={t}
                wallToggle={
                  activeWall && t.status === 'approved'
                    ? {
                        inWall: !!activeSet?.has(t.id),
                        wallName: activeWall.name,
                        onToggle: () => toggleMembership(t.id),
                      }
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
