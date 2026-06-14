'use client'
import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TestimonialCard } from './TestimonialCard'
import { CopyButton } from './CopyButton'
import { LayoutPicker, type WallLayout } from './LayoutPicker'
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

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'hidden', label: 'Hidden' },
]

type PageTab = 'walls' | 'testimonials'

export function TestimonialsWorkbench({
  testimonials,
  walls,
  appUrl,
  initialStatus,
  allowAddWall = false,
  showStats = false,
}: {
  testimonials: Testimonial[]
  walls: Wall[]
  appUrl: string
  initialStatus: StatusTab
  // The main "Walls & Testimonials" overview page passes true so the user can
  // create walls and (with 2+ walls) gets the Walls/Testimonials tab split.
  // The single-wall detail page leaves this false: no add-wall, no tabs.
  allowAddWall?: boolean
  // Overview stat cards above the tabs — only the top-level overview page.
  showStats?: boolean
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  // Dedicated transition + flag so the layout picker can show its own autosave status.
  const [layoutPending, startLayoutTransition] = useTransition()
  const [layoutSaved, setLayoutSaved] = useState(false)
  const [pageTab, setPageTab] = useState<PageTab>('walls')
  // Filters are multi-select: an empty set means "all". Status seeds from the URL.
  const [statusSet, setStatusSet] = useState<Set<string>>(
    () => new Set(initialStatus !== 'all' ? [initialStatus] : []),
  )
  const [wallSet, setWallSet] = useState<Set<string>>(() => new Set())
  const [activeWallId] = useState<string | null>(walls[0]?.id ?? null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [savingNew, setSavingNew] = useState(false)

  // Local membership + layout so changes feel instant; persisted to the server in the background.
  const [membership, setMembership] = useState<Record<string, Set<string>>>(() =>
    Object.fromEntries(walls.map(w => [w.id, new Set(w.testimonial_ids)]))
  )
  const [layouts, setLayouts] = useState<Record<string, WallLayout>>(() =>
    Object.fromEntries(walls.map(w => [w.id, w.layout as WallLayout]))
  )

  // When 2+ walls, the page splits into Walls / Testimonials tabs. With 0–1 walls
  // there are no tabs — the single wall (if any) shows with its testimonials beneath.
  const showTabs = walls.length > 1

  const activeWall = walls.find(w => w.id === activeWallId) ?? null
  const activeSet = activeWallId ? membership[activeWallId] : undefined
  const activeLayout: WallLayout = (activeWallId ? layouts[activeWallId] : undefined) ?? 'grid'

  // Approving a testimonial auto-adds it to the active wall (single-wall view).
  // Add-only and idempotent — re-approving an already-added one is a no-op.
  function addToActiveWall(testimonialId: string) {
    if (!activeWallId) return
    const wallId = activeWallId
    if (membership[wallId]?.has(testimonialId)) return
    const set = new Set(membership[wallId] ?? [])
    set.add(testimonialId)
    setMembership(prev => ({ ...prev, [wallId]: set }))
    startTransition(() => updateWall(wallId, [...set], layouts[wallId] ?? 'grid'))
  }

  function changeLayout(next: WallLayout) {
    if (!activeWallId) return
    const wallId = activeWallId
    setLayouts(prev => ({ ...prev, [wallId]: next }))
    setLayoutSaved(false)
    const ids = [...(membership[wallId] ?? [])]
    startLayoutTransition(async () => {
      await updateWall(wallId, ids, next)
      setLayoutSaved(true)
    })
  }

  function toggleInSet(setter: typeof setStatusSet, value: string) {
    setter(prev => {
      const next = new Set(prev)
      next.has(value) ? next.delete(value) : next.add(value)
      return next
    })
  }

  async function handleCreate() {
    const name = newName.trim()
    if (!name || savingNew) return
    setSavingNew(true)
    try {
      const id = await createWallNamed(name, 'grid')
      setNewName('')
      setCreating(false)
      // Land on the new wall's detail page so the user can curate it right away.
      router.push(`/app/walls/${id}`)
    } finally {
      setSavingNew(false)
    }
  }

  function closeCreate() {
    if (savingNew) return
    setCreating(false)
    setNewName('')
  }

  // Close the New-wall modal on Escape (mirrors the dropdown/menu behaviour).
  useEffect(() => {
    if (!creating) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !savingNew) { setCreating(false); setNewName('') }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [creating, savingNew])

  const widgetFor = (id: string) => `<script async src="${appUrl}/widget.js" data-wall="${id}"></script>`
  const wallMembershipsFor = (t: Testimonial) =>
    walls.filter(w => membership[w.id]?.has(t.id)).map(w => w.name)

  const byStatus = statusSet.size === 0 ? testimonials : testimonials.filter(t => statusSet.has(t.status))
  const filtersActive = statusSet.size > 0 || wallSet.size > 0
  const pendingCount = testimonials.filter(t => t.status === 'pending').length

  // Jump to the testimonials list filtered to a given status. With tabs it switches
  // to the Testimonials tab; in the single-wall view the list is always visible.
  function focusTestimonials(status?: 'pending') {
    setPageTab('testimonials')
    setStatusSet(status ? new Set([status]) : new Set())
  }

  // ── Reusable bits ──────────────────────────────────────────────────────────
  const statCards = showStats && (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => focusTestimonials()}
        className="bg-surface rounded-2xl p-6 text-left transition-colors hover:bg-subtle"
      >
        <div className="text-3xl font-bold text-ink">{testimonials.length}</div>
        <div className="text-sm text-muted mt-1">Total testimonials</div>
      </button>

      <button
        type="button"
        onClick={() => focusTestimonials('pending')}
        className="bg-surface rounded-2xl p-6 text-left transition-colors hover:bg-subtle"
      >
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-ink">{pendingCount}</span>
          {pendingCount > 0 && (
            <span className="text-amber-600" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
          )}
        </div>
        <div className="text-sm text-muted mt-1">Pending review</div>
        {pendingCount > 0 && (
          <div className="text-xs font-medium text-amber-700 mt-2">
            {pendingCount} {pendingCount === 1 ? 'testimonial needs' : 'testimonials need'} your review →
          </div>
        )}
      </button>
    </div>
  )

  // New-wall creation lives in a modal: a scrim over the page with a centered
  // surface card. Backdrop click and Escape close it; clicks inside don't.
  const createModal = creating && (
    <div
      className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-wall-title"
      onClick={closeCreate}
    >
      <div
        className="bg-surface rounded-2xl p-6 w-full max-w-md space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div>
          <h2 id="new-wall-title" className="font-semibold text-ink">New wall</h2>
          <p className="text-sm text-muted mt-1">Group approved testimonials into a wall you can embed.</p>
        </div>
        <input
          autoFocus
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
          placeholder="Wall name (e.g. Homepage)"
          className="w-full rounded-lg bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreate}
            disabled={savingNew || !newName.trim()}
            className="px-4 py-2 bg-brand text-on-brand text-sm font-medium rounded-lg hover:bg-brand-strong disabled:opacity-50 transition-colors"
          >
            {savingNew ? 'Creating…' : 'Create wall'}
          </button>
          <button
            onClick={closeCreate}
            disabled={savingNew}
            className="px-4 py-2 rounded-lg bg-subtle text-ink text-sm hover:bg-tertiary-soft disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )

  const addWallButton = allowAddWall && (
    <button
      onClick={() => setCreating(true)}
      className="text-xs px-3 py-1.5 rounded-lg bg-subtle text-ink hover:bg-tertiary-soft font-medium transition-colors"
    >
      + New wall
    </button>
  )

  const statusDropdown = (
    <FilterDropdown
      label="Status"
      allLabel="All statuses"
      options={STATUS_OPTIONS}
      selected={statusSet}
      onToggle={v => toggleInSet(setStatusSet, v)}
      onClear={() => setStatusSet(new Set())}
    />
  )

  function testimonialList(items: Testimonial[], withToggle: boolean) {
    if (items.length === 0) {
      return (
        <div className="bg-surface rounded-2xl p-16 text-center text-tertiary">
          No testimonials{filtersActive ? ' match these filters' : ' yet'}.
        </div>
      )
    }
    return (
      <div className="space-y-4">
        {items.map(t => (
          <TestimonialCard
            key={t.id}
            testimonial={t}
            wallMemberships={wallMembershipsFor(t)}
            onApprove={withToggle && activeWall ? () => addToActiveWall(t.id) : undefined}
          />
        ))}
      </div>
    )
  }

  // Single-wall panel: the wall's details + inline layout + embed, with the
  // testimonial list (below) wired to add/remove from this wall.
  const singleWallPanel = activeWall && (
    <div className="bg-surface rounded-2xl p-6 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-ink">{activeWall.name}</p>
          <p className="text-sm text-muted mt-0.5">
            {activeSet?.size ?? 0} testimonials added — tick approved ones below to add more.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CopyButton text={widgetFor(activeWall.id)} label="Copy embed" />
          <a
            href={`/wall/${activeWall.id}`}
            target="_blank"
            className="text-xs px-3 py-1.5 rounded-lg bg-subtle text-ink hover:bg-tertiary-soft transition-colors"
          >
            Preview ↗
          </a>
          {addWallButton}
        </div>
      </div>

      <div className="max-w-md">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-muted">Layout</label>
          <span className="text-xs text-tertiary">
            {layoutPending ? 'Saving…' : layoutSaved ? 'Saved ✓' : 'Saves automatically'}
          </span>
        </div>
        <LayoutPicker value={activeLayout} onChange={changeLayout} />
      </div>

      <p className="text-xs text-tertiary">Only approved testimonials show in the live embed.</p>
    </div>
  )

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {createModal}

      {/* Overview stat cards — above the tabs */}
      {statCards}

      {/* Top-level tabs (left) + testimonial filters (right) — only with 2+ walls */}
      {showTabs && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1 bg-subtle p-1 rounded-lg w-fit">
            {(['walls', 'testimonials'] as const).map(tab => {
              const count = tab === 'walls' ? walls.length : testimonials.length
              return (
                <button
                  key={tab}
                  onClick={() => setPageTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    pageTab === tab ? 'bg-surface text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  <span className="capitalize">{tab}</span>{' '}
                  <span className="opacity-60 font-normal">· {count}</span>
                </button>
              )
            })}
          </div>
          {pageTab === 'testimonials' ? (
            <div className="flex items-center gap-2">
              <FilterDropdown
                label="Walls"
                allLabel="All walls"
                options={walls.map(w => ({ value: w.id, label: w.name }))}
                selected={wallSet}
                onToggle={v => toggleInSet(setWallSet, v)}
                onClear={() => setWallSet(new Set())}
              />
              {statusDropdown}
            </div>
          ) : (
            addWallButton
          )}
        </div>
      )}

      {/* ═══ MULTI-WALL · WALLS TAB — list of walls, no testimonials ═══ */}
      {showTabs && pageTab === 'walls' && (
        <section className="space-y-4">
          <div className="space-y-3">
            {walls.map(w => {
              const count = membership[w.id]?.size ?? 0
              const layout = layouts[w.id] ?? 'grid'
              return (
                <div key={w.id} className="bg-surface rounded-2xl p-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-ink">{w.name}</p>
                    <p className="text-sm text-muted mt-0.5 capitalize">{count} testimonials · {layout} layout</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <CopyButton text={widgetFor(w.id)} label="Copy embed" />
                    <a
                      href={`/wall/${w.id}`}
                      target="_blank"
                      className="text-xs px-3 py-1.5 rounded-lg bg-subtle text-ink hover:bg-tertiary-soft transition-colors"
                    >
                      Preview ↗
                    </a>
                    <Link
                      href={`/app/walls/${w.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-brand text-on-brand hover:bg-brand-strong transition-colors"
                    >
                      Open wall
                      <svg width="9" height="9" viewBox="0 0 10 10" className="shrink-0" aria-hidden>
                        <path d="M3.5 2 L6.5 5 L3.5 8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ═══ MULTI-WALL · TESTIMONIALS TAB — all testimonials, filterable by wall ═══ */}
      {showTabs && pageTab === 'testimonials' && (
        <section className="space-y-4">
          {testimonialList(
            wallSet.size === 0
              ? byStatus
              : byStatus.filter(t => [...wallSet].some(wid => membership[wid]?.has(t.id))),
            false,
          )}
        </section>
      )}

      {/* ═══ 0–1 WALL — no tabs: the single wall + its testimonials beneath ═══ */}
      {!showTabs && (
        <>
          <section className="space-y-4">
            {/* Zero walls: the add-wall button needs its own header row (no card to sit in). */}
            {walls.length === 0 && allowAddWall && (
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-ink">Walls</h2>
                {addWallButton}
              </div>
            )}
            {/* Single wall: the add-wall button lives in the card's action row (see singleWallPanel). */}
            {walls.length === 0 ? (
              <div className="bg-surface rounded-2xl p-8 text-center text-tertiary text-sm">
                No walls yet. Create one to start grouping approved testimonials into a wall you can embed.
              </div>
            ) : (
              singleWallPanel
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-ink">Testimonials</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-tertiary">{byStatus.length} shown</span>
                {statusDropdown}
              </div>
            </div>
            {testimonialList(byStatus, true)}
          </section>
        </>
      )}
    </div>
  )
}

// Right-aligned multi-select filter. Closed state shows a compact summary; the
// dark popover (bg-ink, matching the card status menu) lists toggleable options.
function FilterDropdown({
  label,
  allLabel,
  options,
  selected,
  onToggle,
  onClear,
}: {
  label: string
  allLabel: string
  options: { value: string; label: string }[]
  selected: Set<string>
  onToggle: (value: string) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const summary =
    selected.size === 0
      ? allLabel
      : selected.size === 1
      ? options.find(o => selected.has(o.value))?.label ?? '1 selected'
      : `${selected.size} selected`

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-subtle text-ink hover:bg-tertiary-soft transition-colors"
      >
        <span className="text-tertiary font-normal">{label}:</span>
        <span>{summary}</span>
        <svg width="9" height="9" viewBox="0 0 10 10" className="opacity-60 shrink-0" aria-hidden>
          <path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-1.5 z-20 min-w-[200px] bg-ink rounded-lg p-1">
          {options.map(o => {
            const active = selected.has(o.value)
            return (
              <button
                key={o.value}
                type="button"
                role="menuitemcheckbox"
                aria-checked={active}
                onClick={() => onToggle(o.value)}
                className={`w-full flex items-center gap-2.5 text-left text-sm px-2.5 py-1.5 rounded-md transition-colors ${
                  active ? 'bg-white/15 text-white' : 'text-on-brand-soft hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 text-[10px] ${active ? 'bg-white/25 text-white' : 'bg-white/10'}`} aria-hidden>
                  {active && '✓'}
                </span>
                <span className="flex-1">{o.label}</span>
              </button>
            )
          })}
          {selected.size > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="w-full text-left text-xs px-2.5 py-1.5 mt-0.5 rounded-md text-on-brand-soft hover:bg-white/10 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}
