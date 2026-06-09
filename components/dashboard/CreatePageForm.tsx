'use client'
import { useActionState } from 'react'
import { createCollectionPage } from '@/app/app/pages/actions'

export function CreatePageForm({ appUrl }: { appUrl: string }) {
  const host = appUrl.replace(/^https?:\/\//, '')

  const [error, action, pending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await createCollectionPage(formData)
        return null
      } catch (e) {
        return (e as Error).message
      }
    },
    null
  )

  return (
    <form action={action} className="bg-surface rounded-2xl shadow-card p-6 space-y-4">
      <h2 className="font-semibold text-ink">New collection page</h2>

      <div>
        <label className="block text-sm font-medium text-muted mb-1">Slug <span className="text-tertiary font-normal">(used in the URL)</span></label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-tertiary">/c/</span>
          <input name="slug" required placeholder="my-coaching" pattern="[a-z0-9-]+"
            className="flex-1 rounded-lg bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
        </div>
        <p className="text-xs text-tertiary mt-1">Lowercase letters, numbers, hyphens only</p>

        <div className="mt-3 rounded-xl bg-accent-soft px-4 py-3 text-xs text-muted leading-relaxed">
          <p className="font-medium text-ink mb-1">New here? What&apos;s a slug?</p>
          <p>
            It&apos;s just the short bit of text at the end of your page&apos;s web address. Say your brand is{' '}
            <span className="font-medium text-ink">Erik Coaching</span> — your collection page link might be:
          </p>
          <p className="my-2 font-mono text-[11px] text-ink break-all">
            {host}/c/<span className="text-brand font-semibold">erik-coaching</span>
          </p>
          <p>
            That last part — <span className="font-mono text-brand font-semibold">erik-coaching</span>{' — '}is the slug.
            It&apos;s how we know which page to open and whose branding and questions to show. You pick it here when you
            create the page; it just has to be different from everyone else&apos;s.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted mb-1">Page title</label>
        <input name="title" required defaultValue="Share your experience"
          className="w-full rounded-lg bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted mb-1">Prompt question</label>
        <input name="prompt" required placeholder="How has working with us changed things for you?"
          className="w-full rounded-lg bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
      </div>

      {error && <p className="text-red-700 text-sm">{error}</p>}

      <button type="submit" disabled={pending}
        className="px-4 py-2 bg-brand text-on-brand text-sm font-medium rounded-lg hover:bg-brand-strong disabled:opacity-50 transition-colors">
        {pending ? 'Creating…' : 'Create page'}
      </button>
    </form>
  )
}
