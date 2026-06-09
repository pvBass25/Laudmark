import { createServiceClient } from '@/lib/supabase/server'
import { Spectral, Hanken_Grotesk } from 'next/font/google'

// ── This page is a FICTIONAL CUSTOMER website ("Sarah Chen Coaching") used to
// demo the embedded testimonial widget. It deliberately uses its OWN brand —
// "Clementine Press": warm cream + saturated terracotta, Spectral + Hanken
// Grotesk, hairline rules, sharp corners. It is intentionally NOT the LaudMark
// "Harbor" design system, so we can show the widget dropping into any site.

const spectral = Spectral({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-spectral',
  display: 'swap',
})

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-hanken',
  display: 'swap',
})

const WALL_ID = '75df08d4-1868-4d72-9734-a458389740ad'

// Clementine Press palette (NOT Harbor)
const C = {
  bg: '#F7F0E6',
  surface: '#FFFCF6',
  band: '#F1E7D7',
  ink: '#241A14',
  muted: '#6E5C4E',
  accent: '#C2562C',
  accentStrong: '#9E3D1B',
  ochre: '#C99A3C',
  hair: 'rgba(36,26,20,0.14)',
}

const serif = 'font-[family-name:var(--font-spectral)]'
const sans = 'font-[family-name:var(--font-hanken)]'

interface Testimonial {
  id: string
  author_name: string
  author_title?: string | null
  rating?: number | null
  clean_text?: string | null
  raw_text?: string | null
}

function Stars({ n }: { n: number }) {
  return (
    <span aria-label={`${n} out of 5 stars`} className="tracking-[2px] text-[15px]" style={{ color: C.ochre }}>
      {'★'.repeat(n)}
      <span style={{ color: C.hair }}>{'★'.repeat(5 - n)}</span>
    </span>
  )
}

function Eyebrow({ num, children }: { num: string; children: React.ReactNode }) {
  return (
    <div className={`${sans} flex items-baseline gap-3 text-[11px] font-medium uppercase tracking-[0.16em]`} style={{ color: C.accentStrong }}>
      <span style={{ color: C.ink }}>{num}</span>
      <span style={{ color: C.ink }}>—</span>
      <span>{children}</span>
    </div>
  )
}

export default async function DemoPage() {
  const supabase = createServiceClient()

  const { data: wall } = await supabase
    .from('walls')
    .select('testimonial_ids')
    .eq('id', WALL_ID)
    .single()

  let testimonials: Testimonial[] = []
  if (wall?.testimonial_ids?.length) {
    const { data } = await supabase
      .from('testimonials')
      .select('id, author_name, author_title, rating, clean_text, raw_text')
      .in('id', wall.testimonial_ids)
      .eq('status', 'approved')
      .eq('consent', true)

    if (data) {
      const map = new Map(data.map(t => [t.id, t]))
      testimonials = wall.testimonial_ids
        .map((id: string) => map.get(id))
        .filter(Boolean) as Testimonial[]
    }
  }

  return (
    <main
      className={`${spectral.variable} ${hanken.variable} ${sans} min-h-screen`}
      style={{ background: C.bg, color: C.ink }}
    >
      {/* ── Masthead ── */}
      <header className="border-b" style={{ borderColor: C.hair }}>
        <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className={`${serif} text-xl font-semibold tracking-tight`}>Sarah&nbsp;Chen</span>
          <div className={`${sans} hidden md:flex items-center gap-8 text-[11px] font-medium uppercase tracking-[0.16em]`} style={{ color: C.muted }}>
            <span>The Work</span>
            <span>About</span>
            <span style={{ color: C.ink }}>Praise</span>
            <span>Journal</span>
          </div>
          <button
            className={`${sans} text-[11px] font-semibold uppercase tracking-[0.16em] px-4 py-2 rounded-[3px]`}
            style={{ background: C.accent, color: C.surface, boxShadow: `3px 3px 0 ${C.accentStrong}` }}
          >
            Book a call
          </button>
        </nav>
      </header>

      {/* ── Hero / magazine cover ── */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20">
        <div className={`${sans} text-[11px] font-medium uppercase tracking-[0.2em] mb-6`} style={{ color: C.accentStrong }}>
          San Francisco <span style={{ color: C.ink }}>·</span> Business Coaching
        </div>
        <div className="border-t mb-10" style={{ borderColor: C.hair }} />

        <div className="grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <h1 className={`${serif} font-semibold leading-[1.04] tracking-[-0.01em]`} style={{ fontSize: 'clamp(2.75rem,6vw,5rem)' }}>
              I help coaches build a&nbsp;business{' '}
              <span className="italic" style={{ color: C.accent }}>they actually want to run.</span>
            </h1>
            <p className={`${serif} italic mt-7 max-w-xl text-xl leading-relaxed`} style={{ color: C.muted }}>
              Six months. A clear offer, a full pipeline, and a practice that fits your life — no
              hustle culture, no bro marketing, no templates pulled off a shelf.
            </p>
            <div className="mt-9 flex items-center gap-5">
              <button
                className={`${sans} text-sm font-semibold px-7 py-3 rounded-[3px]`}
                style={{ background: C.ink, color: C.surface, boxShadow: `3px 3px 0 ${C.accent}` }}
              >
                Apply for coaching →
              </button>
              <span className={`${sans} text-sm`} style={{ color: C.muted }}>
                Applications open for Q3
              </span>
            </div>
          </div>

          {/* Portrait plate */}
          <div className="md:col-span-4">
            <div className="border p-1.5 rounded-[3px]" style={{ borderColor: C.hair }}>
              <div
                className="aspect-[3/4] rounded-[2px] flex items-center justify-center"
                style={{ background: `linear-gradient(150deg, ${C.accent} 0%, ${C.accentStrong} 100%)` }}
              >
                <span className={`${serif} text-7xl font-semibold`} style={{ color: C.surface, opacity: 0.92 }}>SC</span>
              </div>
            </div>
            <p className={`${serif} italic text-xs mt-2`} style={{ color: C.muted }}>
              Sarah Chen, photographed in her Mission District studio.
            </p>
          </div>
        </div>
      </section>

      {/* ── Approach band w/ margin pull-quote ── */}
      <section style={{ background: C.band, borderColor: C.hair }} className="border-y">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <Eyebrow num="01">The Work</Eyebrow>
          <div className="border-t mt-4 mb-10" style={{ borderColor: C.hair }} />
          <div className="grid md:grid-cols-12 gap-10">
            <blockquote className={`${serif} italic md:col-span-7 leading-[1.18]`} style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)' }}>
              &ldquo;Most coaches don&rsquo;t need another funnel. They need a business they&rsquo;re not
              quietly resenting by Thursday.&rdquo;
            </blockquote>
            <div className={`${sans} md:col-span-5 text-base leading-relaxed`} style={{ color: C.muted }}>
              <p>
                We rebuild your offer from the positioning up, install the few systems that actually
                move revenue, and protect the calendar so the work stays sustainable. No two
                engagements look the same.
              </p>
              <p className="mt-4">
                It&rsquo;s deliberate, a little contrarian, and built to outlast the trend cycle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Praise / embedded testimonial widget ── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <Eyebrow num="02">What clients say</Eyebrow>
        <div className="border-t mt-4 mb-8" style={{ borderColor: C.hair }} />
        <p className={`${serif} italic text-2xl max-w-2xl mb-12 leading-relaxed`}>
          Real words from real clients — published in full, with their permission, exactly as they
          wrote them.
        </p>

        {/* ── LaudMark widget renders inside this hairline-ruled frame ── */}
        <div className="border rounded-[3px] p-5 md:p-8" style={{ borderColor: C.hair, background: C.surface }}>
          {testimonials.length === 0 ? (
            <p className={`${sans} text-center text-sm py-8`} style={{ color: C.muted }}>
              No approved testimonials yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: C.hair }}>
              {testimonials.map(t => (
                <article key={t.id} className="flex flex-col gap-4 p-6" style={{ background: C.surface }}>
                  {t.rating && <Stars n={t.rating} />}
                  <p className={`${serif} text-[17px] leading-[1.6] flex-1`} style={{ color: C.ink }}>
                    &ldquo;{t.clean_text ?? t.raw_text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <div
                      className={`${sans} w-9 h-9 flex items-center justify-center text-xs font-bold rounded-[2px]`}
                      style={{ background: C.accent, color: C.surface }}
                    >
                      {t.author_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className={sans}>
                      <p className="text-sm font-semibold" style={{ color: C.ink }}>{t.author_name}</p>
                      {t.author_title && <p className="text-xs" style={{ color: C.muted }}>{t.author_title}</p>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        <p className={`${sans} text-[11px] uppercase tracking-[0.16em] mt-4`} style={{ color: C.muted }}>
          Collected & verified with LaudMark
        </p>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: C.ink }}>
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <h2 className={`${serif} font-semibold leading-tight mb-5`} style={{ color: C.surface, fontSize: 'clamp(2rem,4vw,3.25rem)' }}>
            Ready to build a practice{' '}
            <span className="italic" style={{ color: C.ochre }}>you love?</span>
          </h2>
          <p className={`${sans} mb-9 text-base`} style={{ color: '#C9BEB1' }}>
            Applications open for Q3 — six spots, by interview only.
          </p>
          <button
            className={`${sans} text-sm font-semibold px-8 py-3.5 rounded-[3px]`}
            style={{ background: C.accent, color: C.surface, boxShadow: `3px 3px 0 ${C.accentStrong}` }}
          >
            Apply now →
          </button>
        </div>
      </section>

      {/* ── Colophon footer ── */}
      <footer className="max-w-5xl mx-auto px-6 py-14">
        <div className="border-t pt-10 grid grid-cols-2 md:grid-cols-4 gap-8" style={{ borderColor: C.hair }}>
          {[
            { h: 'Studio', items: ['The Work', 'About Sarah', 'Results'] },
            { h: 'Programs', items: ['1:1 Coaching', 'The Intensive', 'Group Cohort'] },
            { h: 'Read', items: ['Journal', 'Newsletter', 'Speaking'] },
            { h: 'Connect', items: ['Instagram', 'LinkedIn', 'Contact'] },
          ].map(col => (
            <div key={col.h}>
              <p className={`${sans} text-[11px] font-semibold uppercase tracking-[0.16em] mb-3`} style={{ color: C.accentStrong }}>{col.h}</p>
              <ul className={`${sans} space-y-1.5 text-sm`} style={{ color: C.muted }}>
                {col.items.map(i => <li key={i}>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <p className={`${serif} italic text-sm mt-12`} style={{ color: C.muted }}>
          Sarah Chen Coaching — San Francisco, California. © 2026.
        </p>
      </footer>
    </main>
  )
}
