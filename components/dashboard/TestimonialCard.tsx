'use client'
import { useState, useTransition, useRef, useEffect } from 'react'
import { setTestimonialStatus, updateTestimonial } from '@/app/app/testimonials/actions'

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

// Status lives as a single menu in the card's top-right (a best-practice status
// selector, like Linear/Notion/GitHub): the pill shows the current status; click
// it to change. The popover is dark (bg-ink) so it reads as elevated without a
// shadow or border, per the style guide.
type Status = 'approved' | 'hidden' | 'pending'
const STATUS_META: Record<string, { label: string; pill: string; dot: string }> = {
  approved: { label: 'Approved', pill: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
  hidden: { label: 'Disapproved', pill: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
  pending: { label: 'Needs review', pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
}
const STATUS_ORDER: Status[] = ['approved', 'hidden', 'pending']

// One shared size for every action button in a card, so the row stays uniform.
// Colour + weight are added per-button; approve/disapprove still stand out via fill.
const ACTION_BTN = 'text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50'

// When a wall is in context (single-wall view), approving a testimonial auto-adds
// it to that wall via onApprove — no separate "add to wall" step needed.
export function TestimonialCard({ testimonial: t, onApprove, wallMemberships }: { testimonial: Testimonial; onApprove?: () => void; wallMemberships?: string[] }) {
  const [pending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [draftText, setDraftText] = useState(t.clean_text ?? t.raw_text ?? '')
  const [draftQuote, setDraftQuote] = useState(t.pull_quote ?? '')
  const text = t.clean_text ?? t.raw_text ?? ''
  const initials = t.author_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  function handleStatus(status: 'approved' | 'hidden' | 'pending') {
    startTransition(() => setTestimonialStatus(t.id, status))
    // Approving ensures the testimonial is on the active wall (idempotent — a no-op
    // if it's already there). Also lets re-approving recover already-approved ones.
    if (status === 'approved') onApprove?.()
  }

  function handleSave() {
    startTransition(async () => {
      await updateTestimonial(t.id, { clean_text: draftText, pull_quote: draftQuote })
      setEditing(false)
    })
  }

  function handleCancel() {
    setDraftText(t.clean_text ?? t.raw_text ?? '')
    setDraftQuote(t.pull_quote ?? '')
    setEditing(false)
  }

  return (
    <div className={`bg-surface rounded-2xl p-5 space-y-4 transition-opacity ${pending ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        {/* Author */}
        <div className="flex items-center gap-3 min-w-0">
          {t.author_photo_url ? (
            <img src={t.author_photo_url} alt={t.author_name} className="w-10 h-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-accent-soft text-brand flex items-center justify-center text-sm font-bold shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-medium text-ink text-sm">{t.author_name}</div>
            {t.author_title && <div className="text-xs text-tertiary truncate">{t.author_title}</div>}
          </div>
        </div>

        {/* Status menu + type */}
        <div className="flex items-center gap-2 shrink-0">
          {t.type === 'video' && (
            <span className="text-xs bg-accent-soft text-brand-strong px-2 py-0.5 rounded-full">🎥 video</span>
          )}
          <StatusMenu status={t.status} disabled={pending} onChange={handleStatus} />
        </div>
      </div>

      {/* Rating */}
      {t.rating && (
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(n => (
            <span key={n} className={`text-base ${n <= t.rating! ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
          ))}
        </div>
      )}

      {/* Text — editable */}
      {editing ? (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-muted">Testimonial text</label>
          <textarea
            value={draftText}
            onChange={e => setDraftText(e.target.value)}
            rows={4}
            className="w-full rounded-lg bg-grey10 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <label className="block text-xs font-medium text-muted">Pull quote <span className="font-normal text-tertiary">(short highlight)</span></label>
          <input
            value={draftQuote}
            onChange={e => setDraftQuote(e.target.value)}
            placeholder="A punchy one-liner from the testimonial"
            className="w-full rounded-lg bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={pending}
              className={`${ACTION_BTN} font-medium bg-brand text-on-brand hover:bg-brand-strong`}>
              {pending ? 'Saving…' : 'Save'}
            </button>
            <button onClick={handleCancel} disabled={pending}
              className={`${ACTION_BTN} font-medium bg-subtle text-ink hover:bg-tertiary-soft`}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {text && <p className="text-sm text-muted leading-relaxed">{text}</p>}
          {t.pull_quote && t.pull_quote !== text && (
            <p className="bg-grey10 rounded-xl px-3 py-2 text-sm text-muted italic">&ldquo;{t.pull_quote}&rdquo;</p>
          )}
        </>
      )}

      {/* Themes */}
      {t.themes?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {t.themes.map(theme => (
            <span key={theme} className="text-xs bg-grey10 text-muted px-2 py-0.5 rounded-full">{theme}</span>
          ))}
        </div>
      )}

      {/* Wall memberships */}
      {wallMemberships && wallMemberships.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {wallMemberships.map(name => (
            <span key={name} className="text-xs bg-accent-soft text-brand-strong px-2 py-0.5 rounded-full font-medium">
              ✓ {name}
            </span>
          ))}
        </div>
      )}

      {/* Actions + date */}
      <div className="flex items-center justify-between pt-3">
        <div className="flex flex-wrap gap-2">
          {!editing && (
            <>
              <button onClick={() => setEditing(true)} disabled={pending}
                className={`${ACTION_BTN} font-medium bg-subtle text-ink hover:bg-tertiary-soft`}>
                ✏️ Edit
              </button>
            </>
          )}
        </div>
        <span className="text-xs text-tertiary">{new Date(t.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  )
}

// Single status control in the card's top-right. The pill shows the current
// status; clicking opens a menu to change it (approve / disapprove / needs
// review). Replaces the old two-button approve/disapprove row.
function StatusMenu({
  status,
  disabled,
  onChange,
}: {
  status: string
  disabled?: boolean
  onChange: (s: Status) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const meta = STATUS_META[status] ?? STATUS_META.pending

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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Status: ${meta.label}. Change status`}
        className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full disabled:opacity-50 ${meta.pill}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} aria-hidden />
        <span className="leading-none">{meta.label}</span>
        <svg width="9" height="9" viewBox="0 0 10 10" className="opacity-60 shrink-0" aria-hidden>
          <path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-1.5 z-20 min-w-[180px] bg-ink rounded-lg p-1">
          {STATUS_ORDER.map(s => {
            const active = s === status
            return (
              <button
                key={s}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => { onChange(s); setOpen(false) }}
                className={`w-full flex items-center gap-2.5 text-left text-sm px-2.5 py-1.5 rounded-md transition-colors ${
                  active ? 'bg-white/15 text-white' : 'text-on-brand-soft hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_META[s].dot}`} aria-hidden />
                <span className="flex-1">{STATUS_META[s].label}</span>
                {active && <span className="text-xs" aria-hidden>✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
