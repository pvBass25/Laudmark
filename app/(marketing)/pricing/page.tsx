import Link from 'next/link'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Try it out. No card needed.',
    features: [
      '1 collection page',
      '1 wall',
      'Up to 20 testimonials',
      'Video + text collection',
      'Hosted wall page',
      '"Powered by" footer',
    ],
    excluded: ['SEO embed + JSON-LD', 'Remove branding', 'Request automation'],
    cta: 'Get started free',
    href: '/login',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For coaches and creators ready to grow.',
    features: [
      'Unlimited testimonials',
      'Unlimited collection pages',
      'SEO embed + JSON-LD',
      'Remove "Powered by" branding',
      'Request automation (3-step sequence)',
      '1 brand',
    ],
    excluded: ['AI caption editing', 'Multiple brands'],
    cta: 'Upgrade to Pro',
    href: '/login',
    highlighted: true,
  },
  {
    name: 'Studio',
    price: '$39',
    period: '/month',
    description: 'For agencies and multi-brand creators.',
    features: [
      'Everything in Pro',
      'AI caption editing + translation',
      'Up to 5 brands / pages',
      'White-label embed',
      'Integrations (Zapier / Make)',
    ],
    excluded: [],
    cta: 'Upgrade to Studio',
    href: '/login',
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-canvas py-16 px-6">
      {/* Nav */}
      <div className="max-w-5xl mx-auto mb-2 flex items-center justify-between">
        <Link href="/" className="font-bold text-ink">Trustwall</Link>
        <Link href="/login" className="text-sm text-brand hover:underline">Sign in →</Link>
      </div>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-ink mb-3">Simple, honest pricing</h1>
        <p className="text-muted">Start free. Upgrade when you need SEO embeds and automation.</p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className={`rounded-2xl p-7 flex flex-col bg-surface ${
              plan.highlighted
                ? 'shadow-card-lg'
                : 'shadow-card'
            }`}
          >
            {plan.highlighted && (
              <div className="text-xs font-semibold text-brand bg-accent-soft px-3 py-1 rounded-full w-fit mb-3">
                Most popular
              </div>
            )}
            <h2 className="font-bold text-xl text-ink">{plan.name}</h2>
            <div className="mt-1 mb-1">
              <span className="text-4xl font-bold text-ink">{plan.price}</span>
              <span className="text-tertiary text-sm">{plan.period}</span>
            </div>
            <p className="text-sm text-muted mb-5">{plan.description}</p>

            <ul className="space-y-2 mb-5 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>{f}
                </li>
              ))}
              {plan.excluded.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-tertiary">
                  <span className="mt-0.5 shrink-0">✗</span>{f}
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={`text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                plan.highlighted
                  ? 'bg-brand text-on-brand hover:bg-brand-strong'
                  : 'bg-subtle text-ink hover:bg-tertiary-soft'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-tertiary mt-10">
        All plans include video + text collection, consent capture, and AI enrichment. Cancel anytime.
      </p>
    </main>
  )
}
