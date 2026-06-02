'use client'
import { useState, useTransition } from 'react'
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

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  hidden: 'bg-gray-100 text-gray-500 border-gray-200',
}

export function TestimonialCard({ testimonial: t }: { testimonial: Testimonial }) {
  const [pending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [draftText, setDraftText] = useState(t.clean_text ?? t.raw_text ?? '')
  const [draftQuote, setDraftQuote] = useState(t.pull_quote ?? '')
  const text = t.clean_text ?? t.raw_text ?? ''
  const initials = t.author_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  function handleStatus(status: 'approved' | 'hidden' | 'pending') {
    startTransition(() => setTestimonialStatus(t.id, status))
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
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 space-y-4 transition-opacity ${pending ? 'opacity-50' : ''}`}>
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
            <div className="font-medium text-gray-900 text-sm">{t.author_name}</div>
            {t.author_title && <div className="text-xs text-gray-400 truncate">{t.author_title}</div>}
          </div>
        </div>

        {/* Status + type */}
        <div className="flex items-center gap-2 shrink-0">
          {t.type === 'video' && (
            <span className="text-xs bg-accent-soft text-brand-strong border border-line px-2 py-0.5 rounded-full">🎥 video</span>
          )}
          <span className={`text-xs border px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[t.status] ?? ''}`}>
            {t.status}
          </span>
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
          <label className="block text-xs font-medium text-gray-500">Testimonial text</label>
          <textarea
            value={draftText}
            onChange={e => setDraftText(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-gray-200 bg-grey10 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <label className="block text-xs font-medium text-gray-500">Pull quote <span className="font-normal text-gray-400">(short highlight)</span></label>
          <input
            value={draftQuote}
            onChange={e => setDraftQuote(e.target.value)}
            placeholder="A punchy one-liner from the testimonial"
            className="w-full rounded-xl border border-gray-200 bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={pending}
              className="text-xs px-3 py-1.5 rounded-lg bg-brand text-on-brand font-medium hover:bg-brand-strong disabled:opacity-50 transition-colors">
              {pending ? 'Saving…' : 'Save'}
            </button>
            <button onClick={handleCancel} disabled={pending}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {text && <p className="text-sm text-gray-700 leading-relaxed">{text}</p>}
          {t.pull_quote && t.pull_quote !== text && (
            <p className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-3">&ldquo;{t.pull_quote}&rdquo;</p>
          )}
        </>
      )}

      {/* Themes */}
      {t.themes?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {t.themes.map(theme => (
            <span key={theme} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{theme}</span>
          ))}
        </div>
      )}

      {/* Actions + date */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <div className="flex gap-2">
          {!editing && (
            <>
              {t.status !== 'approved' && (
                <button onClick={() => handleStatus('approved')} disabled={pending}
                  className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors">
                  Approve
                </button>
              )}
              {t.status !== 'hidden' && (
                <button onClick={() => handleStatus('hidden')} disabled={pending}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition-colors">
                  Hide
                </button>
              )}
              {t.status !== 'pending' && (
                <button onClick={() => handleStatus('pending')} disabled={pending}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium transition-colors">
                  Reset
                </button>
              )}
              <button onClick={() => setEditing(true)} disabled={pending}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                ✏️ Edit
              </button>
            </>
          )}
        </div>
        <span className="text-xs text-gray-300">{new Date(t.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
