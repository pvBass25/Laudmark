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
    <main className="min-h-screen bg-gray-50 py-16 px-6">
      {/* Nav */}
      <div className="max-w-5xl mx-auto mb-2 flex items-center justify-between">
        <Link href="/" className="font-bold text-gray-900">Trustwall</Link>
        <Link href="/login" className="text-sm text-indigo-600 hover:underline">Sign in →</Link>
      </div>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Simple, honest pricing</h1>
        <p className="text-gray-500">Start free. Upgrade when you need SEO embeds and automation.</p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className={`rounded-2xl border-2 p-7 flex flex-col ${
              plan.highlighted
                ? 'border-indigo-400 bg-white shadow-lg shadow-indigo-100'
                : 'border-gray-100 bg-white'
            }`}
          >
            {plan.highlighted && (
              <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit mb-3">
                Most popular
              </div>
            )}
            <h2 className="font-bold text-xl text-gray-900">{plan.name}</h2>
            <div className="mt-1 mb-1">
              <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-gray-400 text-sm">{plan.period}</span>
            </div>
            <p className="text-sm text-gray-500 mb-5">{plan.description}</p>

            <ul className="space-y-2 mb-5 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>{f}
                </li>
              ))}
              {plan.excluded.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="mt-0.5 shrink-0">✗</span>{f}
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={`text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                plan.highlighted
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-10">
        All plans include video + text collection, consent capture, and AI enrichment. Cancel anytime.
      </p>
    </main>
  )
}
