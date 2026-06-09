import Link from 'next/link'
import type { ReactNode } from 'react'

const PLATFORMS = ['Webflow', 'WordPress', 'Kajabi', 'Systeme.io', 'Squarespace', 'Framer']

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Share one link',
    body: 'Send your collection page to happy clients right after a purchase, coaching call, or course completion. No account required on their end.',
  },
  {
    step: '02',
    title: 'Reviews come in automatically',
    body: 'Clients record a 60-second video or write a few sentences. AI transcribes and cleans everything. You approve what goes live.',
  },
  {
    step: '03',
    title: 'Embed it — and boost your SEO',
    body: 'Paste one script tag. Testimonials render as real HTML text that Google indexes. Star ratings appear in search results.',
  },
]

const FEATURES = [
  {
    icon: '🔍',
    title: 'SEO-positive embed',
    body: 'Review text appears in raw HTML at first paint. Competitors use iframes — Google sees nothing and your page slows down. LaudMark earns you star ratings in search results and keeps your Lighthouse score clean.',
  },
  {
    icon: '🎥',
    title: 'Video + text in one link',
    body: 'Clients choose to record a quick video or type it out. Both land in your dashboard — auto-transcribed and AI-polished — without you lifting a finger.',
  },
  {
    icon: '⚡',
    title: 'Automated request sequences',
    body: 'Send a request right after a purchase or call. LaudMark follows up with two more nudges over 10 days, stopping automatically when someone responds. Other tools charge $99+/mo for this.',
  },
  {
    icon: '✅',
    title: 'Consent built in',
    body: "Every submission captures usage-rights consent — stored with timestamp and IP. You're covered for FTC rules, GDPR, and any platform that asks for written proof.",
  },
  {
    icon: '✨',
    title: 'AI enrichment, no fabrication',
    body: "Claude trims filler words and extracts pull quotes. It never invents praise or changes the meaning — just makes your real testimonials easier to publish.",
  },
  {
    icon: '🎯',
    title: 'Built for your stack',
    body: 'Drop a script tag into Webflow, WordPress, Kajabi, or any site. Static HTML option for maximum SEO. Widget auto-updates when you approve new testimonials.',
  },
]

const MOCK_ITEMS = [
  {
    initials: 'SC', bg: 'bg-accent-soft', fg: 'text-brand',
    name: 'Sarah Chen', role: 'Business Coach', stars: 5,
    text: '"My revenue doubled in 90 days. The systems James taught completely transformed how I run my practice."',
    status: 'approved', statusBg: 'bg-green-50', statusFg: 'text-green-700',
    typeLabel: '🎥 Video',
  },
  {
    initials: 'MR', bg: 'bg-subtle', fg: 'text-muted',
    name: 'Marcus Reid', role: 'Course Creator', stars: 5,
    text: '"Worth every penny and then some. I was skeptical at first but the results speak for themselves."',
    status: 'pending', statusBg: 'bg-amber-50', statusFg: 'text-amber-700',
    typeLabel: '✍️ Text',
  },
  {
    initials: 'PS', bg: 'bg-stone-200', fg: 'text-stone-700',
    name: 'Priya Sharma', role: 'Yoga Studio Owner', stars: 4,
    text: '"Completely changed how I approach client onboarding. Highly recommend to anyone serious about growth."',
    status: 'approved', statusBg: 'bg-green-50', statusFg: 'text-green-700',
    typeLabel: '✍️ Text',
  },
]

function Stars({ n }: { n: number }) {
  return (
    <span>
      <span className="text-amber-400">{'★'.repeat(n)}</span>
      <span className="text-gray-200">{'★'.repeat(5 - n)}</span>
    </span>
  )
}

function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="bg-surface rounded-xl overflow-hidden">
      <div className="bg-subtle px-3 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-canvas rounded-md h-5 flex items-center px-2 min-w-0">
          <span className="text-[10px] text-muted truncate">🔒 {url}</span>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-canvas">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="font-bold text-lg text-ink">LaudMark</span>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-muted hover:text-ink transition-colors">Pricing</Link>
          <Link href="/login" className="text-sm bg-ink text-on-brand px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-20 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-accent-soft text-brand-strong text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          ✨ Collect video + text testimonials with one link
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-ink leading-tight mb-5">
          Show them in a widget that{' '}
          <span className="text-highlight">boosts your Google ranking</span>{' '}
          instead of slowing your site
        </h1>
        <p className="text-lg text-muted mb-8 max-w-xl mx-auto leading-relaxed">
          The only testimonial tool with server-rendered embeds. Your review text appears in raw
          HTML — Google indexes it, visitors trust it, and your pagespeed stays green.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/login" className="bg-brand text-on-brand px-6 py-3 rounded-lg font-semibold hover:bg-brand-strong transition-colors">
            Get started free →
          </Link>
          <Link href="/pricing" className="bg-subtle text-ink px-6 py-3 rounded-lg font-medium hover:bg-tertiary-soft transition-colors">
            See pricing
          </Link>
        </div>
        <p className="text-xs text-muted mt-4">Free plan available · No credit card required</p>
      </section>

      {/* Platforms bar */}
      <section className="bg-subtle py-4 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          <span className="text-xs text-muted font-medium uppercase tracking-wider">Works with</span>
          {PLATFORMS.map(p => (
            <span key={p} className="text-sm font-semibold text-muted">{p}</span>
          ))}
        </div>
      </section>

      {/* Dashboard screenshot */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-ink mb-3">Everything in one clean dashboard</h2>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Approve testimonials, build your wall, grab the embed code. From collection to live on
            your site in minutes.
          </p>
        </div>
        <BrowserFrame url="app.laudmark.io/app/testimonials">
          <div className="bg-canvas p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-ink text-sm">Testimonials</h3>
                <p className="text-xs text-muted">3 total · 2 approved</p>
              </div>
              <div className="flex gap-1.5">
                <span className="text-xs bg-accent-soft text-brand px-2.5 py-1 rounded-full font-medium cursor-pointer">All</span>
                <span className="text-xs text-muted px-2.5 py-1 rounded-full hover:bg-subtle cursor-pointer">Approved</span>
                <span className="text-xs text-muted px-2.5 py-1 rounded-full hover:bg-subtle cursor-pointer">Pending</span>
              </div>
            </div>
            <div className="space-y-2">
              {MOCK_ITEMS.map((item) => (
                <div key={item.name} className="flex items-start gap-3 bg-surface rounded-lg p-3">
                  <div className={`w-8 h-8 rounded-full ${item.bg} ${item.fg} flex items-center justify-center text-xs font-bold shrink-0`}>
                    {item.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-sm font-semibold text-ink">{item.name}</span>
                      <span className="text-xs text-muted">{item.role}</span>
                      <Stars n={item.stars} />
                      <span className="text-xs text-muted">{item.typeLabel}</span>
                    </div>
                    <p className="text-xs text-muted truncate">{item.text}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.statusBg} ${item.statusFg}`}>
                      {item.status}
                    </span>
                    {item.status === 'pending' && (
                      <button className="text-xs bg-brand text-on-brand px-2.5 py-1 rounded-lg font-medium">Approve</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BrowserFrame>
      </section>

      {/* How it works */}
      <section className="bg-subtle px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ink mb-3">Up and running in 10 minutes</h2>
            <p className="text-muted text-lg">Three steps from zero to Google-indexed testimonials on your site.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step}>
                <div className="text-5xl font-bold text-accent-soft mb-4 leading-none">{item.step}</div>
                <h3 className="font-semibold text-ink text-lg mb-2">{item.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO comparison */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-accent-soft text-brand-strong text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            🏆 The LaudMark difference
          </div>
          <h2 className="text-3xl font-bold text-ink mb-3">The only embed Google can actually read</h2>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Every other testimonial tool serves an iframe. Google&apos;s crawler sees a blank box.
            Your reviews are invisible to search — and your page gets slower.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl overflow-hidden">
            <div className="bg-red-50 px-4 py-2.5 flex items-center gap-2">
              <span>❌</span>
              <span className="text-sm font-semibold text-red-700">Other testimonial tools</span>
            </div>
            <pre className="bg-grey10 p-4 text-xs text-muted overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
{`<!-- Google crawler sees: nothing -->

<iframe
  src="https://widget.competitor.com
       /embed?id=abc123"
  width="100%"
  height="400px"
  frameborder="0">
</iframe>

<!-- Your reviews are hidden.
     Page loads slower.
     No star ratings in search. -->`}
            </pre>
          </div>
          <div className="rounded-xl overflow-hidden">
            <div className="bg-accent-soft px-4 py-2.5 flex items-center gap-2">
              <span>✅</span>
              <span className="text-sm font-semibold text-brand-strong">LaudMark</span>
            </div>
            <pre className="bg-grey10 p-4 text-xs text-muted overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
{`<!-- Google indexes every word -->

<blockquote class="tw-review">
  <p>"Revenue doubled in 90 days..."</p>
  <cite>Sarah Chen · Coach ★★★★★</cite>
</blockquote>
<blockquote class="tw-review">
  <p>"Worth every penny."</p>
  <cite>Marcus Reid · Creator ★★★★★</cite>
</blockquote>

<script type="application/ld+json">
{ "@type": "AggregateRating",
  "ratingValue": "4.9",
  "reviewCount": "47" }
</script>`}
            </pre>
          </div>
        </div>
        <p className="text-center text-sm text-muted mt-5">
          LaudMark&apos;s embed is real HTML. Google indexes it. Your star ratings appear in search
          results. Competitors&apos; iframes disappear into a black box.
        </p>
      </section>

      {/* Features */}
      <section className="bg-subtle px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ink mb-3">Everything you need, nothing you don&apos;t</h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Built for coaches, course creators, and solo service pros who are tired of enterprise
              pricing for basic features.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-surface rounded-2xl p-6">
                <span className="text-3xl mb-3 block">{f.icon}</span>
                <h3 className="font-semibold text-ink mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wall embed mockup */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-ink mb-3">What visitors see on your site</h2>
          <p className="text-muted text-lg max-w-xl mx-auto">
            A beautiful wall of real testimonials — paste one script tag and it updates
            automatically every time you approve a new one.
          </p>
        </div>
        <BrowserFrame url="janecoaching.com/results">
          <div className="bg-white">
            <div className="px-6 py-3 flex items-center justify-between">
              <span className="font-semibold text-gray-800 text-sm">Jane Thompson Coaching</span>
              <div className="hidden md:flex gap-5 text-xs text-gray-400">
                <span>About</span>
                <span>Work With Me</span>
                <span className="font-semibold text-gray-700 underline">Results</span>
                <span>Contact</span>
              </div>
            </div>
            <div className="px-6 py-8">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">What my clients say</h3>
                <div className="flex items-center justify-center gap-1 text-amber-400 text-sm mb-1">
                  {'★★★★★'}
                  <span className="text-gray-500 text-xs ml-1">4.9 average · 47 reviews</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {MOCK_ITEMS.map((item) => (
                  <div key={item.name} className="rounded-xl p-4 bg-white">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className={`w-8 h-8 rounded-full ${item.bg} ${item.fg} flex items-center justify-center text-xs font-bold shrink-0`}>
                        {item.initials}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{item.name}</p>
                        <p className="text-[10px] text-gray-400">{item.role}</p>
                      </div>
                    </div>
                    <div className="text-amber-400 text-xs mb-2">{'★'.repeat(item.stars)}<span className="text-gray-200">{'★'.repeat(5 - item.stars)}</span></div>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-[10px] text-gray-300">Powered by LaudMark</p>
            </div>
          </div>
        </BrowserFrame>
        <p className="text-center text-xs text-muted mt-4">
          The &ldquo;Powered by LaudMark&rdquo; footer is removed on paid plans.
        </p>
      </section>

      {/* CTA */}
      <section className="bg-brand text-on-brand text-center px-6 py-16 mx-6 mb-16 rounded-3xl max-w-5xl md:mx-auto">
        <h2 className="text-3xl font-bold mb-3">Ready to collect better testimonials?</h2>
        <p className="text-on-brand-soft mb-7 text-lg">Start free. Upgrade when you&apos;re ready to unlock SEO + automation.</p>
        <Link href="/login" className="inline-block bg-canvas text-brand font-semibold px-8 py-3 rounded-lg hover:bg-accent-soft transition-colors">
          Get started free
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-muted pb-8 space-x-4">
        <Link href="/privacy" className="hover:text-ink transition-colors">Privacy</Link>
        <Link href="/terms" className="hover:text-ink transition-colors">Terms</Link>
        <Link href="/pricing" className="hover:text-ink transition-colors">Pricing</Link>
      </footer>
    </main>
  )
}
