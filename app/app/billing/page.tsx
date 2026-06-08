import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, createPortalSession } from './actions'
import { PLANS } from '@/lib/plans'

const PLAN_LABELS = { free: 'Free', pro: 'Pro', studio: 'Studio' }
const PLAN_PRICES = { free: '$0', pro: '$19/mo', studio: '$39/mo' }

export default async function BillingPage({
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

  const plan = (profile?.plan ?? 'free') as keyof typeof PLANS
  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO
  const studioPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 leading-[48px]">Billing</h1>
        {upgraded && (
          <div className="mt-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
            🎉 Plan upgraded successfully! Your new features are active.
          </div>
        )}
      </div>

      {/* Current plan */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Current plan</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {PLAN_LABELS[plan]} <span className="text-base font-normal text-gray-400">{PLAN_PRICES[plan]}</span>
            </p>
          </div>
          {plan !== 'free' && profile?.stripe_customer_id && (
            <form action={createPortalSession}>
              <button className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Manage subscription
              </button>
            </form>
          )}
        </div>

        <ul className="space-y-1.5 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            {plan === 'free' ? 'Up to 20 testimonials' : 'Unlimited testimonials'}
          </li>
          <li className="flex items-center gap-2">
            <span className={PLANS[plan].seoEmbed ? 'text-green-500' : 'text-gray-300'}>
              {PLANS[plan].seoEmbed ? '✓' : '✗'}
            </span>
            SEO embed + JSON-LD (Google star ratings)
          </li>
          <li className="flex items-center gap-2">
            <span className={!PLANS[plan].brandingFooter ? 'text-green-500' : 'text-gray-300'}>
              {!PLANS[plan].brandingFooter ? '✓' : '✗'}
            </span>
            Remove "Powered by Trustwall" branding
          </li>
          <li className="flex items-center gap-2">
            <span className={PLANS[plan].automation ? 'text-green-500' : 'text-gray-300'}>
              {PLANS[plan].automation ? '✓' : '✗'}
            </span>
            Request automation
          </li>
        </ul>
      </div>

      {/* Upgrade cards */}
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
    <div className={`rounded-2xl border-2 p-5 ${highlighted ? 'border-brand bg-accent-soft' : 'border-gray-100 bg-white'}`}>
      <p className="font-bold text-gray-900">{name}</p>
      <p className="text-lg font-semibold text-brand mt-0.5 mb-3">{price}</p>
      <ul className="space-y-1.5 text-sm text-gray-600 mb-5">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2"><span className="text-green-500">✓</span>{f}</li>
        ))}
      </ul>
      {boundAction ? (
        <form action={boundAction}>
          <button
            className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${
              highlighted
                ? 'bg-brand text-white hover:bg-brand-strong'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            Upgrade to {name}
          </button>
        </form>
      ) : (
        <p className="text-xs text-gray-400 text-center">Stripe price not configured</p>
      )}
    </div>
  )
}
