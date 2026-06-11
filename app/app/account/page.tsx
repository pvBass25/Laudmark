import { createClient } from '@/lib/supabase/server'
import { updateProfile } from './actions'
import { createCheckoutSession } from '@/app/app/billing/actions'
import { ManageSubscriptionButton } from '@/components/dashboard/ManageSubscriptionButton'
import { PLANS } from '@/lib/plans'

const PLAN_LABELS = { free: 'Free', pro: 'Pro', studio: 'Studio' }
const PLAN_PRICES = { free: '$0', pro: '$19/mo', studio: '$39/mo' }

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>
}) {
  const { upgraded } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, stripe_customer_id')
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
        <h1 className="text-2xl font-bold text-ink">Account</h1>
        <p className="text-sm text-muted mt-1">Everything tied to your account rather than your brand — your profile, your plan and billing, and your sign-in.</p>
      </div>

      {upgraded && (
        <div className="bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm">
          🎉 Plan upgraded successfully! Your new features are active.
        </div>
      )}

      {/* Profile */}
      <section className="space-y-4">
        <h2 className="font-semibold text-ink">Profile</h2>

        <form action={updateProfile} className="bg-surface rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Your name</label>
          <input
            name="full_name"
            defaultValue={fullName}
            placeholder="Jane Smith"
            className="w-full rounded-lg bg-grey10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Email</label>
          <input
            defaultValue={user?.email ?? ''}
            disabled
            className="w-full rounded-lg bg-grey10 px-3 py-2 text-sm text-tertiary cursor-not-allowed"
          />
          <p className="text-xs text-tertiary mt-1">Your sign-in email — can&apos;t be changed here.</p>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-brand text-on-brand text-sm font-medium rounded-lg hover:bg-brand-strong transition-colors"
        >
          Save profile
        </button>
        </form>
      </section>

      {/* Plan & billing */}
      <section className="space-y-4">
        <h2 className="font-semibold text-ink">Plan &amp; billing</h2>

        <div className="bg-surface rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted">Current plan</p>
              <p className="text-2xl font-bold text-ink mt-0.5">
                {PLAN_LABELS[plan]} <span className="text-base font-normal text-tertiary">{PLAN_PRICES[plan]}</span>
              </p>
            </div>
            {plan !== 'free' && profile?.stripe_customer_id && (
              <ManageSubscriptionButton />
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
              Remove &quot;Powered by LaudMark&quot; branding
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
          <div className="grid gap-4">
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
          <UpgradeCard
            name="Studio"
            price="$39/mo"
            features={['Everything in Pro', 'AI caption editing', 'Up to 5 brands', 'White-label']}
            priceId={studioPriceId}
            action={createCheckoutSession}
            highlighted
          />
        )}
      </section>

      {/* Session */}
      <section className="space-y-4">
        <h2 className="font-semibold text-ink">Session</h2>
        <div className="bg-surface rounded-2xl p-6 flex items-center justify-between">
          <p className="text-sm text-muted">
            Signed in as <span className="text-ink font-medium">{user?.email}</span>
          </p>
          <form action="/auth/signout" method="post">
            <button className="px-4 py-2 rounded-lg bg-subtle text-ink text-sm hover:bg-tertiary-soft transition-colors">
              Sign out
            </button>
          </form>
        </div>
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
    <div className={`rounded-2xl p-5 ${highlighted ? 'bg-accent-soft' : 'bg-surface'}`}>
      {/* Header row mirrors the current-plan card: name/price left, action top-right */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-bold text-ink">{name}</p>
          <p className="text-lg font-semibold text-brand mt-0.5">{price}</p>
        </div>
        {boundAction ? (
          <form action={boundAction}>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                highlighted
                  ? 'bg-brand text-on-brand hover:bg-brand-strong'
                  : 'bg-ink text-on-brand hover:opacity-90'
              }`}
            >
              Upgrade to {name} ↗
            </button>
          </form>
        ) : (
          <p className="text-xs text-tertiary">Stripe price not configured</p>
        )}
      </div>
      <ul className="space-y-1.5 text-sm text-muted">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2"><span className="text-green-500">✓</span>{f}</li>
        ))}
      </ul>
    </div>
  )
}
