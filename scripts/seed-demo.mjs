// SCOPE LOCK (agent operating boundary — applies to every task, file, and scheduled run).
// Only ever read, write, or run commands inside the `trustwall` project folder
// (/Users/erikmcdonald/personal-dev/trustwall). Never read, write, move, or delete
// anything anywhere else on the user's computer, for any reason. Web search / fetch is
// permitted when a task needs it (it's network, not the local machine); the local
// filesystem stays off-limits outside this folder.
//
// seed-demo.mjs — Seeds a realistic Pro-plan demo brand ("Sarah Chen Coaching") with a
// collection page, a wall, and several approved + consented testimonials, so the
// standalone demo "customer site" (demo/index.html) has real data to embed.
//
// Idempotent: re-running cleans up the prior demo wall/page/testimonials first.
// Run with:  node scripts/seed-demo.mjs
//
// Reuses an existing profile (FK: profiles.id -> auth.users.id makes inserting a brand
// new owner impractical without the auth admin API). Upgrades that profile to `pro` so
// the embed renders JSON-LD with no "Powered by" footer — the full SEO wedge.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// --- Load .env.local -------------------------------------------------------
const env = Object.fromEntries(
  readFileSync(join(root, '.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]
    })
)

const URL = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
}

async function rest(path, opts = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, { ...opts, headers: { ...headers, ...(opts.headers || {}) } })
  const text = await res.text()
  let body
  try { body = text ? JSON.parse(text) : null } catch { body = text }
  if (!res.ok) throw new Error(`${res.status} ${path}: ${text}`)
  return body
}

const DEMO_PAGE_SLUG = 'sarah-chen-coaching'
const DEMO_WALL_NAME = 'Client Wins'

// --- Demo testimonials -----------------------------------------------------
const TESTIMONIALS = [
  {
    type: 'text', rating: 5, author_name: 'Marcus Reyes', author_title: 'Founder, Reyes Studio',
    clean_text:
      "I came to Sarah stuck at the same revenue ceiling for two years. Within four months of her program I'd restructured my offer and signed three retainer clients. The accountability calls were the thing that actually made it stick.",
    pull_quote: 'Signed three retainer clients in four months',
    themes: ['results', 'accountability'], sentiment: 'positive',
  },
  {
    type: 'video', rating: 5, author_name: 'Priya Nair', author_title: 'Health Coach',
    clean_text:
      "What I appreciated most was that Sarah never sold me a template. She helped me build a niche that was actually mine. My discovery-call booking rate roughly doubled once we tightened the messaging.",
    pull_quote: 'My booking rate roughly doubled',
    themes: ['positioning', 'results'], sentiment: 'positive',
    video_url: 'https://example.com/demo/priya.mp4',
  },
  {
    type: 'text', rating: 5, author_name: 'Devon Walsh', author_title: 'Career Coach',
    clean_text:
      "I was skeptical about group programs, but the cohort turned out to be the best part. Having other coaches at my stage to pressure-test ideas with saved me from a few expensive mistakes.",
    pull_quote: 'Saved me from a few expensive mistakes',
    themes: ['community', 'support'], sentiment: 'positive',
  },
  {
    type: 'video', rating: 4, author_name: 'Aisha Bello', author_title: 'Leadership Consultant',
    clean_text:
      "Sarah is direct in the best way. She told me the thing I'd been avoiding — that my pricing was the problem, not my marketing. I raised my rates 40% the next quarter and nobody blinked.",
    pull_quote: 'I raised my rates 40% and nobody blinked',
    themes: ['pricing', 'confidence'], sentiment: 'positive',
    video_url: 'https://example.com/demo/aisha.mp4',
  },
  {
    type: 'text', rating: 5, author_name: 'Tom Okafor', author_title: 'Fitness Coach',
    clean_text:
      "Before this I was trading hours for dollars and burning out. Sarah helped me package a signature program so I could serve more people without adding more 1:1 slots. First launch did 28 sales.",
    pull_quote: 'First launch did 28 sales',
    themes: ['offers', 'results'], sentiment: 'positive',
  },
  {
    type: 'text', rating: 5, author_name: 'Lena Fischer', author_title: 'Business Coach, Berlin',
    clean_text:
      "Practical, warm, and zero fluff. Every session ended with a clear next action. Six months in, my email list went from 200 to just over 2,000 engaged subscribers.",
    pull_quote: 'From 200 to 2,000 engaged subscribers',
    themes: ['marketing', 'results'], sentiment: 'positive',
  },
]

async function main() {
  // 1. Pick an owner profile to host the demo brand.
  const profiles = await rest('profiles?select=id,email&order=created_at.asc')
  if (!profiles.length) { console.error('No profiles exist — sign up once in the app first.'); process.exit(1) }
  const owner = profiles[0]
  console.log(`Owner: ${owner.email} (${owner.id})`)

  // 2. Upgrade to Pro + set brand identity (the wedge: JSON-LD on, no footer).
  await rest(`profiles?id=eq.${owner.id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ plan: 'pro', brand_name: 'Sarah Chen Coaching', brand_color: '#0F766E', niche: 'coach' }),
  })
  console.log('Profile upgraded to pro + branded.')

  // 3. Clean up any prior demo run (idempotency).
  const oldPages = await rest(`collection_pages?slug=eq.${DEMO_PAGE_SLUG}&select=id`)
  for (const p of oldPages) {
    await rest(`testimonials?page_id=eq.${p.id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } })
    await rest(`collection_pages?id=eq.${p.id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } })
  }
  await rest(`walls?user_id=eq.${owner.id}&name=eq.${encodeURIComponent(DEMO_WALL_NAME)}`, {
    method: 'DELETE', headers: { Prefer: 'return=minimal' },
  })
  if (oldPages.length) console.log('Cleaned up prior demo data.')

  // 4. Collection page.
  const [page] = await rest('collection_pages', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      user_id: owner.id,
      slug: DEMO_PAGE_SLUG,
      title: 'Share your win with Sarah',
      prompt_questions: ['What changed in your business after we worked together?'],
    }),
  })
  console.log(`Collection page: /c/${page.slug}`)

  // 5. Testimonials — all approved + consented so the embed will show them.
  const now = new Date().toISOString()
  // Uniform column set — PostgREST bulk insert requires every object to have identical keys.
  const rows = TESTIMONIALS.map((t) => ({
    page_id: page.id,
    user_id: owner.id,
    status: 'approved',
    consent: true,
    consent_ts: now,
    consent_ip: '203.0.113.10',
    type: t.type,
    author_name: t.author_name,
    author_title: t.author_title ?? null,
    author_photo_url: t.author_photo_url ?? null,
    rating: t.rating ?? null,
    raw_text: t.clean_text,
    clean_text: t.clean_text,
    pull_quote: t.pull_quote ?? null,
    video_url: t.video_url ?? null,
    themes: t.themes ?? [],
    sentiment: t.sentiment ?? null,
  }))
  const inserted = await rest('testimonials', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(rows),
  })
  console.log(`Inserted ${inserted.length} approved testimonials.`)

  // 6. Wall referencing them in order.
  const [wall] = await rest('walls', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      user_id: owner.id,
      name: DEMO_WALL_NAME,
      layout: 'grid',
      testimonial_ids: inserted.map((r) => r.id),
    }),
  })

  console.log('\n✅ Demo seeded.')
  console.log(`   Wall ID:    ${wall.id}`)
  console.log(`   Wall page:  ${env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wall/${wall.id}`)
  console.log(`   Embed API:  ${env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/embed/${wall.id}`)
  console.log(`\n   Put this Wall ID into demo/index.html (data-wall) — or run scripts/build-demo.mjs.`)
}

main().catch((e) => { console.error(e); process.exit(1) })
