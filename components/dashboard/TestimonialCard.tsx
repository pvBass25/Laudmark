'use client'
import { useTransition } from 'react'
import { setTestimonialStatus } from '@/app/app/testimonials/actions'

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
  const text = t.clean_text ?? t.raw_text ?? ''
  const initials = t.author_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  function handleStatus(status: 'approved' | 'hidden' | 'pending') {
    startTransition(() => setTestimonialStatus(t.id, status))
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 space-y-4 transition-opacity ${pending ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        {/* Author */}
        <div className="flex items-center gap-3 min-w-0">
          {t.author_photo_url ? (
            <img src={t.author_photo_url} alt={t.author_name} className="w-10 h-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
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
            <span className="text-xs bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-full">🎥 video</span>
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

      {/* Text */}
      {text && <p className="text-sm text-gray-700 leading-relaxed">{text}</p>}

      {/* Pull quote */}
      {t.pull_quote && t.pull_quote !== text && (
        <p className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-3">&ldquo;{t.pull_quote}&rdquo;</p>
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
        </div>
        <span className="text-xs text-gray-300">{new Date(t.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
