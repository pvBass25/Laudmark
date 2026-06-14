'use client'
import { useState } from 'react'
import { changeSubscriptionPrice, cancelSubscription, resumeSubscription } from '@/app/app/billing/actions'

// The downgrade side of the plan-change flow. Every path shows the concrete
// consequences — with the user's live numbers — before anything is confirmed.
export function DowngradePanel({
  plan,
  proPriceId,
  testimonialCount,
  activeRequests,
  periodEnd,
  cancelAtPeriodEnd,
}: {
  plan: 'pro' | 'studio'
  proPriceId?: string
  testimonialCount: number
  activeRequests: number
  periodEnd?: string
  cancelAtPeriodEnd: boolean
}) {
  const [expanded, setExpanded] = useState<'none' | 'pro' | 'free'>('none')

  // Pending cancellation: the only action left is resuming.
  if (cancelAtPeriodEnd) {
    return (
      <div className="bg-amber-50 text-amber-700 rounded-2xl p-6 space-y-3">
        <p className="text-sm font-medium">
          Your subscription ends{periodEnd ? ` on ${periodEnd}` : ' at the end of the billing period'} — you&apos;ll move to Free.
        </p>
        <p className="text-sm">
          SEO embed + JSON-LD turns off, the &quot;Powered by LaudMark&quot; footer returns, and request automation stops. Your paid features stay active until then.
        </p>
        <form action={resumeSubscription}>
          <button className="px-4 py-2 bg-brand text-on-brand text-sm font-medium rounded-lg hover:bg-brand-strong transition-colors">
            Resume subscription
          </button>
        </form>
      </div>
    )
  }

  const switchToPro = proPriceId ? changeSubscriptionPrice.bind(null, proPriceId) : null

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-ink">Change plan</h2>

      {/* Studio → Pro */}
      {plan === 'studio' && switchToPro && (
        <div className="bg-surface rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-ink">Switch to Pro</p>
              <p className="text-lg font-semibold text-brand mt-0.5">$19/mo</p>
            </div>
            {expanded !== 'pro' && (
              <button
                onClick={() => setExpanded('pro')}
                className="px-4 py-2 rounded-lg bg-subtle text-ink text-sm hover:bg-tertiary-soft transition-colors"
              >
                Switch to Pro…
              </button>
            )}
          </div>

          {expanded === 'pro' && (
            <>
              <ul className="space-y-1.5 text-sm text-muted">
                <li className="flex items-center gap-2"><span className="text-tertiary">✗</span>AI editing &amp; translation turns off</li>
                <li className="flex items-center gap-2"><span className="text-tertiary">✗</span>Extra brands turn off — you keep 1</li>
                <li className="flex items-center gap-2"><span className="text-tertiary">✗</span>White-label turns off</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span>You keep unlimited testimonials, the SEO embed, and request automation</li>
              </ul>
              <p className="text-xs text-tertiary">Billing is prorated — the switch takes effect immediately.</p>
              <div className="flex items-center gap-3">
                <form action={switchToPro}>
                  <button className="px-4 py-2 bg-brand text-on-brand text-sm font-medium rounded-lg hover:bg-brand-strong transition-colors">
                    Confirm switch to Pro
                  </button>
                </form>
                <button
                  onClick={() => setExpanded('none')}
                  className="px-4 py-2 rounded-lg bg-subtle text-ink text-sm hover:bg-tertiary-soft transition-colors"
                >
                  Keep Studio
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Pro / Studio → Free */}
      <div className="bg-surface rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-ink">Downgrade to Free</p>
            <p className="text-lg font-semibold text-brand mt-0.5">$0</p>
          </div>
          {expanded !== 'free' && (
            <button
              onClick={() => setExpanded('free')}
              className="px-4 py-2 rounded-lg bg-subtle text-ink text-sm hover:bg-tertiary-soft transition-colors"
            >
              Downgrade to Free…
            </button>
          )}
        </div>

        {expanded === 'free' && (
          <>
            <ul className="space-y-1.5 text-sm text-muted">
              <li className="flex items-center gap-2">
                <span className="text-tertiary">✗</span>
                {testimonialCount > 20
                  ? `You have ${testimonialCount} testimonials — Free keeps up to 20`
                  : `Free includes up to 20 testimonials (you have ${testimonialCount})`}
              </li>
              <li className="flex items-center gap-2"><span className="text-tertiary">✗</span>SEO embed + JSON-LD turns off — your walls stop earning Google stars</li>
              <li className="flex items-center gap-2"><span className="text-tertiary">✗</span>The &quot;Powered by LaudMark&quot; footer returns to your wall and widget</li>
              <li className="flex items-center gap-2">
                <span className="text-tertiary">✗</span>
                {activeRequests > 0
                  ? `${activeRequests} active request sequence${activeRequests === 1 ? '' : 's'} will stop sending`
                  : 'Request automation turns off'}
              </li>
              {plan === 'studio' && (
                <li className="flex items-center gap-2"><span className="text-tertiary">✗</span>AI editing, translation, and extra brands turn off</li>
              )}
            </ul>
            <p className="text-xs text-tertiary">
              Your {plan === 'studio' ? 'Studio' : 'Pro'} features stay active until{periodEnd ? ` ${periodEnd}` : ' the end of the billing period'}, then you move to Free. You can resume before then if you change your mind.
            </p>
            <div className="flex items-center gap-3">
              <form action={cancelSubscription}>
                <button className="px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:opacity-90 transition-opacity">
                  Cancel subscription
                </button>
              </form>
              <button
                onClick={() => setExpanded('none')}
                className="px-4 py-2 rounded-lg bg-subtle text-ink text-sm hover:bg-tertiary-soft transition-colors"
              >
                Keep my plan
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
