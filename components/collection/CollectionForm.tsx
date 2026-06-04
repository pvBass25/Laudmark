'use client'

import { useRef, useState } from 'react'
import { VideoRecorder } from './VideoRecorder'

type Step = 'choose' | 'record' | 'write' | 'details' | 'done'

interface PageData {
  id: string
  slug: string
  title: string
  prompt_questions: string[]
}

interface BrandData {
  brand_name: string | null
  brand_logo_url: string | null
  brand_color: string
}

export function CollectionForm({ page, brand }: { page: PageData; brand: BrandData }) {
  const [step, setStep] = useState<Step>('choose')
  const [testimonialType, setTestimonialType] = useState<'video' | 'text'>('text')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [authorTitle, setAuthorTitle] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [authorPhotoUrl, setAuthorPhotoUrl] = useState<string | null>(null)
  const [rating, setRating] = useState<number | null>(null)
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const brandColor = brand.brand_color || '#111111'
  const prompt = page.prompt_questions[0] || 'How has this helped you?'

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    try {
      const res = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: page.slug, contentType: file.type }),
      })
      if (!res.ok) throw new Error()
      const { uploadUrl, publicUrl } = await res.json() as { uploadUrl: string; publicUrl: string }
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
      setAuthorPhotoUrl(publicUrl)
    } catch {
      // photo is optional — silently skip
    } finally {
      setPhotoUploading(false)
    }
  }

  async function handleSubmit() {
    if (!consent || !authorName.trim() || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const body: Record<string, unknown> = {
        slug: page.slug,
        type: testimonialType,
        authorName: authorName.trim(),
        consent: true,
      }
      if (authorTitle.trim()) body.authorTitle = authorTitle.trim()
      if (authorEmail.trim()) body.authorEmail = authorEmail.trim()
      if (authorPhotoUrl) body.authorPhotoUrl = authorPhotoUrl
      if (rating !== null) body.rating = rating
      if (testimonialType === 'text') body.text = text
      if (testimonialType === 'video') body.videoUrl = videoUrl

      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Submission failed')
      setStep('done')
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-5">🙏</div>
        <h2 className="text-2xl font-bold text-ink mb-2">Thank you!</h2>
        <p className="text-muted max-w-xs leading-relaxed">
          Your testimonial has been received. It means a lot — thank you for sharing!
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Branded header */}
      <header style={{ backgroundColor: brandColor }} className="px-4 py-5 text-on-brand text-center shrink-0">
        {brand.brand_logo_url ? (
          <img
            src={brand.brand_logo_url}
            alt={brand.brand_name ?? ''}
            className="h-8 mx-auto object-contain"
          />
        ) : (
          <span className="font-bold text-lg">{brand.brand_name ?? 'Trustwall'}</span>
        )}
      </header>

      <div className="flex-1 px-4 py-6 w-full max-w-lg mx-auto space-y-6">
        {/* Page title + prompt */}
        <div>
          <h1 className="text-xl font-semibold text-ink">{page.title}</h1>
          <p className="text-muted text-sm mt-1">{prompt}</p>
        </div>

        {/* Choose mode */}
        {step === 'choose' && (
          <div className="space-y-3">
            <button
              onClick={() => { setTestimonialType('video'); setStep('record') }}
              style={{ color: brandColor }}
              className="w-full bg-subtle rounded-2xl py-4 font-semibold text-base flex items-center justify-center gap-2 transition-opacity active:opacity-70"
            >
              <span>🎥</span> Record a quick video
            </button>
            <button
              onClick={() => { setTestimonialType('text'); setStep('write') }}
              className="w-full bg-subtle rounded-2xl py-4 font-semibold text-base text-ink flex items-center justify-center gap-2 transition-opacity active:opacity-70"
            >
              <span>✏️</span> Write it instead
            </button>
          </div>
        )}

        {/* Record step */}
        {step === 'record' && (
          <div className="space-y-3">
            <VideoRecorder
              slug={page.slug}
              brandColor={brandColor}
              onComplete={url => { setVideoUrl(url); setStep('details') }}
            />
            <button onClick={() => setStep('choose')} className="text-sm text-tertiary underline w-full text-center">
              Back
            </button>
          </div>
        )}

        {/* Write step */}
        {step === 'write' && (
          <div className="space-y-3">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={prompt}
              rows={6}
              className="w-full rounded-2xl bg-grey10 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setStep('choose')}
                className="flex-1 py-3 rounded-xl bg-subtle text-ink font-medium hover:bg-tertiary-soft transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep('details')}
                disabled={text.trim().length < 5}
                style={text.trim().length >= 5 ? { backgroundColor: brandColor } : undefined}
                className="flex-1 py-3 rounded-xl text-on-brand font-semibold disabled:bg-gray-200 disabled:text-gray-400"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Details step */}
        {step === 'details' && (
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">
                Your name <span className="text-red-500">*</span>
              </label>
              <input
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                placeholder="Jane Smith"
                autoComplete="name"
                className="w-full rounded-xl bg-grey10 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">
                Role or business{' '}
                <span className="text-tertiary font-normal">(optional)</span>
              </label>
              <input
                value={authorTitle}
                onChange={e => setAuthorTitle(e.target.value)}
                placeholder="Life coach at Bloom Coaching"
                className="w-full rounded-xl bg-grey10 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">
                Email <span className="text-tertiary font-normal">(optional)</span>
              </label>
              <input
                type="email"
                value={authorEmail}
                onChange={e => setAuthorEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl bg-grey10 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
              />
              <p className="text-xs text-tertiary mt-1">We&apos;ll let you know when your testimonial is published.</p>
            </div>

            {/* Photo */}
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">
                Photo <span className="text-tertiary font-normal">(optional)</span>
              </label>
              <div className="flex items-center gap-3">
                {authorPhotoUrl && (
                  <img
                    src={authorPhotoUrl}
                    alt="Your photo"
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                )}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={photoUploading}
                  className="px-4 py-2 rounded-lg bg-subtle text-sm text-muted hover:bg-tertiary-soft disabled:opacity-50 transition-colors active:opacity-70"
                >
                  {photoUploading ? 'Uploading…' : authorPhotoUrl ? 'Change photo' : 'Upload photo'}
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>

            {/* Star rating */}
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">
                Rating <span className="text-tertiary font-normal">(optional)</span>
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(rating === n ? null : n)}
                    className={`text-3xl leading-none transition-colors ${
                      n <= (rating ?? 0) ? 'text-amber-400' : 'text-gray-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Consent */}
            <div className="rounded-2xl bg-grey10 p-4">
              <label className="flex gap-3 items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  className="mt-0.5 shrink-0 w-4 h-4"
                />
                <span className="text-sm text-muted leading-snug">
                  I allow{' '}
                  <strong className="text-ink">{brand.brand_name ?? 'this business'}</strong>{' '}
                  to share this testimonial — my name, words, and photo/video — on their website
                  and in marketing.
                </span>
              </label>
            </div>

            {submitError && (
              <p className="text-red-700 text-sm text-center">{submitError}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!consent || !authorName.trim() || submitting}
              style={consent && authorName.trim() && !submitting ? { backgroundColor: brandColor } : undefined}
              className="w-full py-3.5 rounded-xl text-on-brand font-semibold text-base disabled:bg-gray-200 disabled:text-gray-400 transition-opacity active:opacity-80"
            >
              {submitting ? 'Submitting…' : 'Submit testimonial'}
            </button>

            <button
              onClick={() => setStep(testimonialType === 'video' ? 'record' : 'write')}
              className="text-sm text-tertiary underline w-full text-center"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
