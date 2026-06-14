'use client'
import { useState, useActionState } from 'react'
import { saveOnboardingBrand, createOnboardingPage, completeOnboarding } from '@/app/onboarding/actions'
import { createCheckoutSession } from '@/app/app/billing/actions'
import { CopyButton } from '@/components/dashboard/CopyButton'

type Plan = 'free' | 'pro' | 'studio'

const STEPS = ['Brand', 'Collection page', 'Plan', 'Done'] as const

const PLAN_LABELS: Record<Plan, string> = { free: 'Free', pro: 'Pro', studio: 'Studio' }
const PLAN_PRICES: Record<Plan, string> = { free: '$0', pro: '$19/mo', studio: '$39/mo' }
const PLAN_FEATURES: Record<Plan, string[]> = {
  free: ['1 collection page', '1 wall', 'Up to 20 testimonials', 'Hosted wall page', '"Powered by LaudMark" footer'],
  pro: ['Unlimited testimonials', 'SEO embed + JSON-LD', 'Remove branding', 'Request automation'],
  studio: ['Everything in Pro', 'AI caption editing', 'Up to 5 brands', 'White-label'],
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

// Server actions end successful flows with redirect(), which throws a
// NEXT_REDIRECT control-flow signal — re-throw it so navigation happens.
function isRedirect(e: unknown): boolean {
  return !!e && typeof e === 'object' && 'digest' in e && String((e as { digest?: unknown }).digest).startsWith('NEXT_REDIRECT')
}

export function OnboardingWizard({
  initialStep,
  intent,
  plan,
  upgraded,
  brand,
  existingPageSlug,
  proPriceId,
  studioPriceId,
}: {
  initialStep: 1 | 2 | 3 | 4
  intent: 'pro' | 'studio' | null
  plan: Plan
  upgraded: boolean
  brand: { name: string; color: string; niche: string }
  existingPageSlug: string | null
  proPriceId?: string
  studioPriceId?: string
}) {
  const [step, setStep] = useState<number>(initialStep)
  const [brandName, setBrandName] = useState(brand.name)
  const [slug, setSlug] = useState(() => slugify(brand.name))
  const [pageSlug, setPageSlug] = useState<string | null>(existingPageSlug)

  const [brandError, brandAction, brandPending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await saveOnboardingBrand(formData)
        setSlug(prev => prev || slugify((formData.get('brand_name') as string) ?? ''))
        setStep(2)
        return null
      } catch (e) {
        if (isRedirect(e)) throw e
        return (e as Error).message
      }
    },
    null
  )

  const [pageError, pageAction, pagePending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        const { slug: created } = await createOnboardingPage(formData)
        setPageSlug(created)
        setStep(3)
        return null
      } catch (e) {
        if (isRedirect(e)) throw e
        return (e as Error).message
      }
    },
    null
  )

  // What the user will be on when the wizard ends — if they just paid but the
  // webhook hasn't flipped the plan yet, show the plan they bought.
  const displayPlan: Plan = plan !== 'free' ? plan : upgraded && intent ? intent : 'free'

  return (
    <div className="w-full max-w-xl mx-auto space-y-8">
      {/* Stepper */}
      <div className="flex items-center gap-2 flex-wrap" role="list" aria-label="Setup steps">
        {STEPS.map((label, i) => {
          const n = i + 1
          const state = n === step ? 'active' : n < step ? 'done' : 'upcoming'
          return (
            <span
              key={label}
              role="listitem"
              aria-current={state === 'active' ? 'step' : undefined}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                state === 'active' ? 'bg-accent-soft text-brand'
                : state === 'done' ? 'bg-surface text-brand'
                : 'bg-grey10 text-muted'
              }`}
            >
              {state === 'done' ? '✓ ' : `${n}. `}{label}
            </span>
          )
        })}
      </div>

      {/* Step 1 — Brand */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">Welcome — let&apos;s set up your brand</h1>
            <p className="text-sm text-muted mt-1">This shapes your collection page, your wall, and the AI prompts. You can change it anytime in Settings.</p>
          </div>

          <form action={brandAction} className="bg-surface rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Brand name</label>
              <input
                name="brand_name"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Acme Coaching"
                className="w-full rounded-lg bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Brand colour</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="brand_color"
                  defaultValue={brand.color}
                  className="w-10 h-10 rounded-lg cursor-pointer"
                />
                <span className="text-sm text-tertiary">Shown on your collection page header</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Niche</label>
              <input
                name="niche"
                defaultValue={brand.niche}
                placeholder="coach, course creator, consultant…"
                className="w-full rounded-lg bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
              <p className="text-xs text-tertiary mt-1">Used by AI to generate better prompt questions and request emails</p>
            </div>

            {brandError && <p className="text-red-700 text-sm">{brandError}</p>}

            <button
              type="submit"
              disabled={brandPending}
              className="px-4 py-2 bg-brand text-on-brand text-sm font-medium rounded-lg hover:bg-brand-strong disabled:opacity-50 transition-colors"
            >
              {brandPending ? 'Saving…' : 'Save & continue'}
            </button>
          </form>
        </div>
      )}

      {/* Step 2 — First collection page */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">Create your collection page</h1>
            <p className="text-sm text-muted mt-1">The one link you&apos;ll share with happy clients — they record or write a testimonial there. No login needed on their side.</p>
          </div>

          {pageSlug ? (
            <div className="bg-surface rounded-2xl p-6 space-y-4">
              <p className="text-sm text-muted">
                Your collection page is ready at{' '}
                <span className="font-mono text-brand font-semibold">/c/{pageSlug}</span>
              </p>
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-brand text-on-brand text-sm font-medium rounded-lg hover:bg-brand-strong transition-colors"
              >
                Continue
              </button>
            </div>
          ) : (
            <form action={pageAction} className="bg-surface rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Page title</label>
                <input
                  name="title"
                  required
                  defaultValue="Share your experience"
                  className="w-full rounded-lg bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Prompt question</label>
                <input
                  name="prompt"
                  required
                  placeholder="How has working with us changed things for you?"
                  className="w-full rounded-lg bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
                <p className="text-xs text-tertiary mt-1">The warm question clients see first — specific beats generic</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Slug <span className="text-tertiary font-normal">(used in the URL)</span></label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-tertiary">/c/</span>
                  <input
                    name="slug"
                    required
                    pattern="[a-z0-9-]+"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="my-coaching"
                    className="flex-1 rounded-lg bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                  />
                </div>
                <p className="text-xs text-tertiary mt-1">Lowercase letters, numbers, hyphens only — we suggested one from your brand name</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer rounded-xl bg-grey10 px-4 py-3">
                <input type="checkbox" name="collectRating" defaultChecked className="mt-0.5 shrink-0 w-4 h-4" />
                <span className="text-sm text-muted leading-snug">
                  <span className="font-medium text-ink">Let people add a star rating</span>
                  <span className="block text-xs text-tertiary mt-0.5">
                    Shows an optional 1–5 star picker on this page. Turn off if a rating doesn&apos;t fit.
                  </span>
                </span>
              </label>

              {pageError && <p className="text-red-700 text-sm">{pageError}</p>}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={pagePending}
                  className="px-4 py-2 bg-brand text-on-brand text-sm font-medium rounded-lg hover:bg-brand-strong disabled:opacity-50 transition-colors"
                >
                  {pagePending ? 'Creating…' : 'Create page & continue'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-lg bg-subtle text-ink text-sm hover:bg-tertiary-soft transition-colors"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Step 3 — Plan. The plan was already chosen on the pricing page, so this
          step CONFIRMS it (and runs checkout for a paid choice) — it never
          re-asks the user to pick. */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">
              {plan !== 'free'
                ? `You're on ${PLAN_LABELS[plan]}`
                : intent
                ? `Activate your ${PLAN_LABELS[intent]} plan`
                : "You're on the Free plan"}
            </h1>
            <p className="text-sm text-muted mt-1">
              {plan !== 'free'
                ? "Your plan is active — here's what's included."
                : intent
                ? `You picked ${PLAN_LABELS[intent]} on the pricing page — finish checkout to switch it on.`
                : 'No card needed. You can upgrade anytime from your account.'}
            </p>
          </div>

          {plan !== 'free' ? (
            <div className="bg-surface rounded-2xl p-6 space-y-4">
              <p className="text-lg font-semibold text-brand">{PLAN_PRICES[plan]}</p>
              <FeatureList features={PLAN_FEATURES[plan]} />
              <button
                onClick={() => setStep(4)}
                className="px-4 py-2 bg-brand text-on-brand text-sm font-medium rounded-lg hover:bg-brand-strong transition-colors"
              >
                Continue
              </button>
            </div>
          ) : intent ? (
            <div className="space-y-4">
              <PlanChoiceCard
                plan={intent}
                priceId={intent === 'pro' ? proPriceId : studioPriceId}
                highlighted
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep(4)}
                  className="px-4 py-2 rounded-lg bg-subtle text-ink text-sm hover:bg-tertiary-soft transition-colors"
                >
                  Continue on Free instead
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="text-sm text-muted hover:text-ink transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl p-6 space-y-4">
              <p className="text-lg font-semibold text-brand">$0 — no card needed</p>
              <FeatureList features={PLAN_FEATURES.free} />
              <button
                onClick={() => setStep(4)}
                className="px-4 py-2 bg-brand text-on-brand text-sm font-medium rounded-lg hover:bg-brand-strong transition-colors"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 4 — Done */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">You&apos;re all set</h1>
            <p className="text-sm text-muted mt-1">
              {displayPlan === 'free'
                ? 'Your brand and collection page are ready — time to ask for your first testimonial.'
                : `Your brand, collection page, and ${PLAN_LABELS[displayPlan]} plan are ready — time to ask for your first testimonial.`}
            </p>
          </div>

          {upgraded && plan === 'free' && (
            <div className="bg-amber-50 text-amber-700 rounded-xl px-4 py-3 text-sm">
              Payment received — your upgrade is activating and the features below unlock in a moment.
            </div>
          )}

          {pageSlug ? (
            <div className="bg-surface rounded-2xl p-6 space-y-3">
              <p className="text-sm font-medium text-ink">Your collection link</p>
              <p className="font-mono text-sm text-brand font-semibold break-all">/c/{pageSlug}</p>
              <div className="flex items-center gap-3">
                <CopyButton path={`/c/${pageSlug}`} />
                <a
                  href={`/c/${pageSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand font-medium hover:text-brand-strong underline underline-offset-2"
                >
                  Open it ↗
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl p-6">
              <button
                onClick={() => setStep(2)}
                className="text-sm text-brand font-medium hover:text-brand-strong underline underline-offset-2"
              >
                ← Back: create your collection page first
              </button>
            </div>
          )}

          <div className="bg-surface rounded-2xl p-6 space-y-3">
            <p className="text-sm font-medium text-ink">What&apos;s next</p>
            <ul className="space-y-1.5 text-sm text-muted">
              <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5 shrink-0">✓</span>Share your collection link with happy clients</li>
              <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5 shrink-0">✓</span>Approve testimonials in your dashboard — approved ones go straight onto your wall</li>
              {displayPlan === 'free' ? (
                <>
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5 shrink-0">✓</span>Your hosted wall page is live — embed the live widget anywhere</li>
                  <li className="flex items-start gap-2"><span className="text-tertiary mt-0.5 shrink-0">·</span>Free includes up to 20 testimonials and a &quot;Powered by LaudMark&quot; footer — upgrade anytime in Account → Plan &amp; billing</li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5 shrink-0">✓</span>Grab the SEO embed code from your wall — server-rendered HTML + JSON-LD that earns Google stars</li>
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5 shrink-0">✓</span>Set up request automation to ask clients at the right moment</li>
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5 shrink-0">✓</span>The &quot;Powered by LaudMark&quot; footer is off</li>
                  {displayPlan === 'studio' && (
                    <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5 shrink-0">✓</span>AI editing &amp; translation and up to 5 brands are unlocked</li>
                  )}
                </>
              )}
            </ul>
          </div>

          <form action={completeOnboarding}>
            <button
              type="submit"
              className="px-6 py-3 bg-brand text-on-brand rounded-lg font-semibold hover:bg-brand-strong transition-colors"
            >
              Go to my dashboard
            </button>
          </form>
        </div>
      )}

      {/* Escape hatch — never trap the user in the wizard */}
      {step < 4 && (
        <form action={completeOnboarding}>
          <button type="submit" className="text-sm text-muted hover:text-ink transition-colors">
            Skip setup for now →
          </button>
        </form>
      )}
    </div>
  )
}

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm text-muted">
      {features.map(f => (
        <li key={f} className="flex items-center gap-2"><span className="text-green-500">✓</span>{f}</li>
      ))}
    </ul>
  )
}

// A selectable paid plan with a Checkout button that returns to the wizard.
function PlanChoiceCard({ plan, priceId, highlighted }: { plan: 'pro' | 'studio'; priceId?: string; highlighted?: boolean }) {
  const checkoutAction = priceId ? createCheckoutSession.bind(null, priceId, '/onboarding') : null

  return (
    <div className={`rounded-2xl p-5 ${highlighted ? 'bg-accent-soft' : 'bg-surface'}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-bold text-ink">{PLAN_LABELS[plan]}</p>
          <p className="text-lg font-semibold text-brand mt-0.5">{PLAN_PRICES[plan]}</p>
        </div>
        {checkoutAction ? (
          <form action={checkoutAction}>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                highlighted
                  ? 'bg-brand text-on-brand hover:bg-brand-strong'
                  : 'bg-ink text-on-brand hover:opacity-90'
              }`}
            >
              Start {PLAN_LABELS[plan]} — {PLAN_PRICES[plan]} ↗
            </button>
          </form>
        ) : (
          <p className="text-xs text-tertiary">Stripe price not configured</p>
        )}
      </div>
      <FeatureList features={PLAN_FEATURES[plan]} />
    </div>
  )
}
