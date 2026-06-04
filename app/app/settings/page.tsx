import { createClient } from '@/lib/supabase/server'
import { updateBrandSettings, updateProfile } from './actions'
import { createCheckoutSession, createPortalSession } from '@/app/app/billing/actions'
import { PLANS } from '@/lib/plans'

const PLAN_LABELS = { free: 'Free', pro: 'Pro', studio: 'Studio' }
const PLAN_PRICES = { free: '$0', pro: '$19/mo', studio: '$39/mo' }

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>
}) {
  const { upgraded } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('brand_name, brand_color, niche, plan, stripe_customer_id')
    .eq('id', user!.id)
    .single()

  // `full_name` is added in migration 0003 — fetch it separately and tolerate
  // its absence so the page still renders if that migration isn't applied yet.
  const { data: nameRow } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .maybeSingle()
  const fullName = nameRow?.full_name ?? ''

  const plan = (profile?.plan ?? 'free') as keyof typeof PLANS
  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO
  const studioPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="text-sm text-muted mt-1">Your profile, brand, and billing — all in one place.</p>
      </div>

      {upgraded && (
        <div className="bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm">
          🎉 Plan upgraded successfully! Your new features are active.
        </div>
      )}

      {/* Profile */}
      <form action={updateProfile} className="bg-surface rounded-2xl shadow-card p-6 space-y-5">
        <h2 className="font-semibold text-ink">Profile</h2>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Your name</label>
          <input
            name="full_name"
            defaultValue={fullName}
            placeholder="Jane Smith"
            className="w-full rounded-xl bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Email</label>
          <input
            defaultValue={user?.email ?? ''}
            disabled
            className="w-full rounded-xl bg-grey10 px-3 py-2 text-sm text-tertiary cursor-not-allowed"
          />
          <p className="text-xs text-tertiary mt-1">Your sign-in email — can&apos;t be changed here.</p>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-brand text-on-brand text-sm font-medium rounded-xl hover:bg-brand-strong transition-colors"
        >
          Save profile
        </button>
      </form>

      {/* Brand */}
      <form action={updateBrandSettings} className="bg-surface rounded-2xl shadow-card p-6 space-y-5">
        <h2 className="font-semibold text-ink">Brand</h2>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Brand name</label>
          <input
            name="brand_name"
            defaultValue={profile?.brand_name ?? ''}
            placeholder="Acme Coaching"
            className="w-full rounded-xl bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Brand colour</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="brand_color"
              defaultValue={profile?.brand_color ?? '#111111'}
              className="w-10 h-10 rounded-lg cursor-pointer"
            />
            <span className="text-sm text-tertiary">Shown on your collection page header</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Niche</label>
          <input
            name="niche"
            defaultValue={profile?.niche ?? 'coach'}
            placeholder="coach, course creator, consultant…"
            className="w-full rounded-xl bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <p className="text-xs text-tertiary mt-1">Used by AI to generate better prompt questions and request emails</p>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-brand text-on-brand text-sm font-medium rounded-xl hover:bg-brand-strong transition-colors"
        >
          Save brand
        </button>
      </form>

      {/* Plan & billing */}
      <section className="space-y-4">
        <h2 className="font-semibold text-ink">Plan &amp; billing</h2>

        <div className="bg-surface rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted">Current plan</p>
              <p className="text-2xl font-bold text-ink mt-0.5">
                {PLAN_LABELS[plan]} <span className="text-base font-normal text-tertiary">{PLAN_PRICES[plan]}</span>
              </p>
            </div>
            {plan !== 'free' && profile?.stripe_customer_id && (
              <form action={createPortalSession}>
                <button className="px-4 py-2 rounded-xl bg-subtle text-ink text-sm hover:bg-tertiary-soft transition-colors">
                  Manage subscription
                </button>
              </form>
            )}
          </div>

          <ul className="space-y-1.5 text-sm text-muted">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              {plan === 'free' ? 'Up to 20 testimonials' : 'Unlimited testimonials'}
            </li>
            <li className="flex items-center gap-2">
              <span className={PLANS[plan].seoEmbed ? 'text-green-500' : 'text-tertiary'}>
                {PLANS[plan].seoEmbed ? '✓' : '✗'}
              </span>
              SEO embed + JSON-LD (Google star ratings)
            </li>
            <li className="flex items-center gap-2">
              <span className={!PLANS[plan].brandingFooter ? 'text-green-500' : 'text-tertiary'}>
                {!PLANS[plan].brandingFooter ? '✓' : '✗'}
              </span>
              Remove &quot;Powered by Trustwall&quot; branding
            </li>
            <li className="flex items-center gap-2">
              <span className={PLANS[plan].automation ? 'text-green-500' : 'text-tertiary'}>
                {PLANS[plan].automation ? '✓' : '✗'}
              </span>
              Request automation
            </li>
          </ul>
        </div>

        {plan === 'free' && (
          <div className="grid grid-cols-2 gap-4">
            <UpgradeCard
              name="Pro"
              price="$19/mo"
              features={['Unlimited testimonials', 'SEO embed + JSON-LD', 'Remove branding', 'Request automation']}
              priceId={proPriceId}
              action={createCheckoutSession}
            />
            <UpgradeCard
              name="Studio"
              price="$39/mo"
              features={['Everything in Pro', 'AI caption editing', 'Up to 5 brands', 'White-label']}
              priceId={studioPriceId}
              action={createCheckoutSession}
              highlighted
            />
          </div>
        )}

        {plan === 'pro' && (
          <div className="max-w-sm">
            <UpgradeCard
              name="Studio"
              price="$39/mo"
              features={['Everything in Pro', 'AI caption editing', 'Up to 5 brands', 'White-label']}
              priceId={studioPriceId}
              action={createCheckoutSession}
              highlighted
            />
          </div>
        )}
      </section>
    </div>
  )
}

function UpgradeCard({
  name, price, features, priceId, action, highlighted,
}: {
  name: string
  price: string
  features: string[]
  priceId?: string
  action: (priceId: string) => Promise<void>
  highlighted?: boolean
}) {
  const boundAction = priceId ? action.bind(null, priceId) : null

  return (
    <div className={`rounded-2xl p-5 shadow-card ${highlighted ? 'bg-accent-soft' : 'bg-surface'}`}>
      <p className="font-bold text-ink">{name}</p>
      <p className="text-lg font-semibold text-brand mt-0.5 mb-3">{price}</p>
      <ul className="space-y-1.5 text-sm text-muted mb-5">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2"><span className="text-green-500">✓</span>{f}</li>
        ))}
      </ul>
      {boundAction ? (
        <form action={boundAction}>
          <button
            className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${
              highlighted
                ? 'bg-brand text-on-brand hover:bg-brand-strong'
                : 'bg-ink text-on-brand hover:opacity-90'
            }`}
          >
            Upgrade to {name}
          </button>
        </form>
      ) : (
        <p className="text-xs text-tertiary text-center">Stripe price not configured</p>
      )}
    </div>
  )
}
