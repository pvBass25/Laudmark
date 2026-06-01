import Link from 'next/link'

const FEATURES = [
  {
    icon: '🔍',
    title: 'SEO-positive embed',
    body: 'Your review text appears in the raw HTML — visible to Google at first paint. Competitors use iframes that hide text and slow your page. Trustwall helps your pagespeed and earns Google star ratings.',
  },
  {
    icon: '⚡',
    title: 'Automation + consent on cheap tiers',
    body: 'Auto-request testimonials at the right moment. Usage-rights consent is captured in the same flow. No gating behind expensive plans.',
  },
  {
    icon: '🎯',
    title: 'Built for coaches & creators',
    body: 'Integrates where you already live — Webflow, WordPress, Kajabi, Systeme. Fast, never loses data, speaks your niche\'s language.',
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="font-bold text-lg text-gray-900">Trustwall</span>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900">Pricing</Link>
          <Link href="/login" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-20 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          ✨ Collect video + text testimonials with one link
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 leading-tight mb-5">
          Show them in a widget that{' '}
          <span className="text-indigo-600">boosts your Google ranking</span>{' '}
          instead of slowing your site
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto leading-relaxed">
          The only testimonial tool with server-rendered embeds. Your review text appears in raw HTML — Google indexes it, visitors trust it, and your pagespeed stays green.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/login" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            Get started free →
          </Link>
          <Link href="/pricing" className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            See pricing
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">Free plan available · No credit card required</p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why people switch to Trustwall</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-6">
              <span className="text-3xl mb-3 block">{f.icon}</span>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 text-white text-center px-6 py-16 mx-6 mb-16 rounded-3xl max-w-5xl md:mx-auto">
        <h2 className="text-3xl font-bold mb-3">Ready to collect better testimonials?</h2>
        <p className="text-indigo-200 mb-7 text-lg">Start free. Upgrade when you're ready to unlock SEO + automation.</p>
        <Link href="/login" className="inline-block bg-white text-indigo-600 font-semibold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors">
          Get started free
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 pb-8 space-x-4">
        <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
        <Link href="/terms" className="hover:text-gray-600">Terms</Link>
        <Link href="/pricing" className="hover:text-gray-600">Pricing</Link>
      </footer>
    </main>
  )
}
