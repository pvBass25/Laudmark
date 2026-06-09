<!-- ════════════════════════════════════════════════════════════════════════
  ⛔ CHANGE-CONTROL & STYLE LOCK — HIGHEST PRIORITY · NON-NEGOTIABLE · PERMANENT
  Reproduced VERBATIM at the top of EVERY .md file in this project, by direct
  standing order of the project owner. It governs every part of the project
  equally — marketing, product, dashboard, emails, embeds, configs, scripts.
  No exceptions. Never remove, move, or weaken this block.
═════════════════════════════════════════════════════════════════════════════ -->

> # ⛔ CHANGE-CONTROL & STYLE LOCK (read first — overrides everything below)
>
> 1. **Change NOTHING unless the user gives a direct, explicit command to change
>    that specific thing.** No refactors, no cleanups, no restructuring, no new
>    files, no renamed or moved files, no "better" or "different" approaches, no
>    extra features, no proactive fixes. If the user did not explicitly ask for it,
>    do not touch it. **Doing nothing is the correct default.**
> 2. **The style guide IS the brand.** `STYLEGUIDE.md` (the "Harbor" direction)
>    together with `app/globals.css` is the SINGLE source of truth for ALL styling,
>    everywhere. When the user asks for a change, implement it ONLY by reusing the
>    tokens, components, and patterns already defined there. **Never invent or
>    introduce a new or different color, font, spacing, radius, component, or style.
>    Never create a new look.** If it is not already in the style guide, STOP and ask.
> 3. This applies to EVERY part of the project equally — it does not matter whether
>    it is the marketing page or the actual product. The brand is the style guide.
> 4. When unsure whether a change is in scope or on-brand, STOP and ask first.

# Testimonial App — Build Spec for Claude Code

> **What this is:** a complete, decision-closed specification for building a niche testimonial-collection SaaS. Every major decision is already made so you (the coding agent) can build without guessing. When something is genuinely optional, it is marked `OPTIONAL` or `LATER`. Do not deviate from anything under **§2 Non-negotiables**.

---

## 0. How to use this document (read first)

1. Put this file at the **repo root** as `BUILD_SPEC.md`. Optionally also copy it to `CLAUDE.md` so it loads as ambient context automatically.
2. Build **milestone by milestone** (see §15). Do not try to build everything in one pass — it wastes tokens and produces tangled code.
3. Recommended driving prompts (type these into Claude Code one at a time):
   - *"Read BUILD_SPEC.md. Do Milestone 0 only: scaffold the repo per §4, create `.env.example` per §5, and apply the SQL in §6 as a Supabase migration. Then stop and list what you created."*
   - *"Do Milestone 1 per §15. Meet every acceptance criterion listed. Run it locally and show me it works, then stop."*
   - …continue M2 → M5.
4. **Commit after every milestone.** Start each milestone in a fresh session when possible to keep context small.
5. Each milestone has **acceptance criteria** — treat them as a self-check before declaring done.

**Token-saving rules for the agent:** prefer editing over rewriting files; don't reprint large files back to the user; don't restate this spec; ask for a decision only if something here truly conflicts.

---

## 1. Product summary & positioning

**Product:** A testimonial-collection tool for **coaches, course creators, and solo service pros**. They collect video + text testimonials with one link and embed them on sales pages.

**One-liner:** *"Collect video + text testimonials with one link, and show them in a fast widget that boosts your Google ranking instead of slowing your site."*

**The three wedges (why anyone switches to us):**
1. **SEO-positive embed** — server-rendered plain-text HTML + `schema.org` review markup, so the customer earns Google star ratings and the widget *helps* pagespeed. Competitors use iframes/JS that hide review text from Google and slow the page.
2. **Automation + consent included on cheap tiers** — auto-request at the right moment; usage-rights consent captured in the same flow. (Testimonial.to has neither; others gate it at $99+.)
3. **Reliability + niche fit** — fast, never loses data, speaks the niche's language, integrates where they live (Webflow/WordPress/Kajabi/Systeme).

**Pricing tiers (these drive the gating logic in §12):**
- **Free** — 1 collection page, 1 wall, up to 20 testimonials, hosted wall + basic JS widget **with "Powered by" footer**. No SEO embed, no automation.
- **Pro $19/mo** — unlimited testimonials, remove branding, **SEO embed + JSON-LD**, request automation, 1 brand.
- **Studio $39/mo** — multiple brands/pages, AI editing (captions, translation), integrations, white-label.

---

## 2. Non-negotiables (do not violate)

> **0. SCOPE LOCK (agent operating boundary — applies to every task, file, and scheduled run).** Only ever read, write, or run commands inside the `trustwall` project folder (`/Users/erikmcdonald/personal-dev/trustwall`). Never read, write, move, or delete anything anywhere else on the user's computer, for any reason. Web search / fetch is permitted when a task needs it (it's network, not the local machine); the local filesystem stays off-limits outside this folder. **Reproduce this SCOPE LOCK block verbatim in every document, file, config, or scheduled task you generate.**

1. **The SEO embed MUST be server-rendered or static HTML, NEVER an iframe.** The review text must appear in the raw HTML response (visible in view-source / first paint). This is the entire product differentiator.
2. **Claude cannot transcribe audio.** Video → text uses an STT service (Deepgram). Claude only does the *language* work (clean-up, captions, tagging) on the resulting text.
3. **All AI calls run server-side.** The `ANTHROPIC_API_KEY` is never shipped to the client.
4. **Anti-fabrication is mandatory in every AI prompt.** The model may clean and shorten testimonials but must NEVER invent praise, facts, names, numbers, or sentiment. This is FTC compliance, not a nicety.
5. **Consent is stored on every testimonial:** boolean + timestamp + IP, captured at submission. No consent → cannot publish.
6. **Performance budget for the embed:** loader script < 50KB, async, lazy-loaded. No layout-shift.
7. **Row-Level Security enabled on every table.** Public reads for embeds go through the server (service-role), never via a permissive client policy.

---

## 3. Tech stack (final)

| Layer | Choice | Notes |
|---|---|---|
| Framework / host | **Next.js (App Router) + TypeScript**, deploy on **Vercel** | SSR is the SEO wedge; route handlers are the backend. |
| DB / Auth | **Supabase** (Postgres + Auth + RLS) | Email magic-link auth for owners. |
| Video storage | **Cloudflare R2** (S3-compatible) | Zero egress fees; presigned uploads. |
| Speech-to-text | **Deepgram** (`nova-3`, prerecorded) | Pairs with Claude; see §10. |
| AI | **Anthropic Claude API** (`@anthropic-ai/sdk`) | Models in §9. |
| Email | **Resend** + React Email | Verify sending domain (SPF/DKIM). |
| Billing | **Stripe** (Checkout + Billing Portal + webhooks) | Test mode first. |
| Cron | **Vercel Cron** | Drives request sequences. |
| Validation | **zod** | Validate every API input. |
| Analytics | **PostHog** `OPTIONAL` | Activation + funnel. |
| Video quality upgrade | **Mux** `LATER` | Only if raw `MediaRecorder` quality is insufficient. |

Package manager: **pnpm**. Node 20+. Use the Next.js `app/` router and React Server Components by default; client components only where interactivity is required (recorder, dashboard widgets).

---

## 4. Repo structure (scaffold to this)

```
/app
  /(marketing)/
    page.tsx                  # landing page
    pricing/page.tsx
  /c/[slug]/page.tsx          # PUBLIC collection page (no auth)
  /wall/[wallId]/page.tsx     # hosted "wall of love" (SSR, SEO)
  /app/                       # dashboard (auth-gated via layout)
    layout.tsx
    page.tsx                  # overview
    pages/page.tsx            # manage collection pages
    testimonials/page.tsx     # approve / edit / hide
    walls/[wallId]/page.tsx   # curate a wall + get embed code
    settings/page.tsx         # brand, niche, account
    billing/page.tsx
  /api/
    testimonials/route.ts     # POST: submit a testimonial
    upload-url/route.ts       # POST: presigned R2 URL
    transcribe/route.ts       # POST: video URL -> transcript (Deepgram)
    ai/[task]/route.ts        # POST: polish|assets|request|tag|followup|translate|questions
    embed/[wallId]/route.ts   # GET: returns SSR HTML + JSON-LD (THE WEDGE)
    stripe/checkout/route.ts  # POST: create Checkout session
    stripe/portal/route.ts    # POST: create Billing Portal session
    stripe/webhook/route.ts   # POST: Stripe events
    cron/requests/route.ts    # GET: process due request-sequence steps
/lib
  supabase/server.ts          # server client (service role)
  supabase/client.ts          # browser client (anon)
  claude.ts                   # the AI layer (§9)
  deepgram.ts                 # STT (§10)
  r2.ts                       # presigned uploads
  stripe.ts
  email/                      # Resend templates
  schema-ld.ts                # JSON-LD builder (§11)
  plans.ts                    # gating map (§12)
  consent.ts                  # consent capture helper
/components
  collection/                 # recorder, text form, consent box
  dashboard/
  embed/                      # server-rendered wall HTML
/public
  widget.js                   # the < 50KB loader script (§11)
/supabase/migrations/
  0001_init.sql               # §6
```

---

## 5. Environment variables (`.env.example`)

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only — never NEXT_PUBLIC

# Anthropic
ANTHROPIC_API_KEY=

# Deepgram
DEEPGRAM_API_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=testimonials
R2_PUBLIC_URL=                    # public bucket/CDN base URL

# Resend
RESEND_API_KEY=
RESEND_FROM="Your App <hello@yourdomain.com>"

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRICE_PRO=
NEXT_PUBLIC_STRIPE_PRICE_STUDIO=

# Cron auth
CRON_SECRET=
```

---

## 6. Data model — Supabase migration (`0001_init.sql`)

```sql
create extension if not exists pgcrypto;

-- OWNERS ----------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  plan            text not null default 'free' check (plan in ('free','pro','studio')),
  stripe_customer_id text,
  brand_name      text,
  brand_logo_url  text,
  brand_color     text default '#111111',
  niche           text default 'coach',
  created_at      timestamptz not null default now()
);

-- COLLECTION PAGES ------------------------------------------------
create table public.collection_pages (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  slug            text not null unique,
  title           text not null default 'Leave a testimonial',
  prompt_questions text[] not null default '{}',
  created_at      timestamptz not null default now()
);

-- TESTIMONIALS ----------------------------------------------------
create table public.testimonials (
  id              uuid primary key default gen_random_uuid(),
  page_id         uuid not null references public.collection_pages(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  type            text not null check (type in ('video','text')),
  author_name     text not null,
  author_title    text,
  author_photo_url text,
  rating          int check (rating between 1 and 5),
  raw_text        text,            -- original typed text or transcript
  clean_text      text,            -- Claude-polished
  pull_quote      text,
  video_url       text,
  captions_vtt    text,
  themes          text[] default '{}',
  sentiment       text,
  status          text not null default 'pending' check (status in ('pending','approved','hidden')),
  consent         boolean not null default false,
  consent_ts      timestamptz,
  consent_ip      text,
  created_at      timestamptz not null default now()
);
create index on public.testimonials (user_id, status);
create index on public.testimonials (page_id);

-- WALLS -----------------------------------------------------------
create table public.walls (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  name            text not null default 'Wall of Love',
  layout          text not null default 'grid' check (layout in ('grid','carousel','list')),
  testimonial_ids uuid[] not null default '{}',
  created_at      timestamptz not null default now()
);

-- REQUEST AUTOMATION ---------------------------------------------
create table public.requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  page_id         uuid not null references public.collection_pages(id) on delete cascade,
  recipient_email text not null,
  recipient_name  text,
  sequence_step   int not null default 0,    -- 0,1,2 = three nudges
  status          text not null default 'active' check (status in ('active','done','stopped')),
  scheduled_at    timestamptz not null default now(),
  created_at      timestamptz not null default now()
);
create index on public.requests (status, scheduled_at);

-- RLS -------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.collection_pages enable row level security;
alter table public.testimonials     enable row level security;
alter table public.walls            enable row level security;
alter table public.requests         enable row level security;

-- Owners manage only their own rows.
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own pages" on public.collection_pages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own testimonials" on public.testimonials
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own walls" on public.walls
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own requests" on public.requests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

**Security model:** the public collection page (insert a testimonial) and the public embed (read approved testimonials) are served by **server route handlers using the service-role key** with explicit logic — NOT by public RLS policies. This keeps the tables locked to owners while still serving public traffic safely. Validate the `slug`/`wallId` server-side before any insert/select.

---

## 7. Routes & API contracts

### Public pages
- `GET /c/[slug]` — collection page. Loads page + brand by slug. Renders recorder/text form + consent. No auth.
- `GET /wall/[wallId]` — hosted wall (SSR). Outputs approved testimonials as real HTML + JSON-LD. Indexable.

### Dashboard pages (auth-gated by `/app/layout.tsx`)
`/app`, `/app/pages`, `/app/testimonials`, `/app/walls/[wallId]`, `/app/settings`, `/app/billing`.

### API route handlers
| Route | Method | Auth | Purpose / shape |
|---|---|---|---|
| `/api/upload-url` | POST | none (rate-limited) | `{slug, contentType}` → `{uploadUrl, publicUrl}` (presigned R2 PUT). |
| `/api/transcribe` | POST | server-internal | `{videoUrl}` → `{transcript}` via Deepgram. |
| `/api/testimonials` | POST | none (rate-limited) | Submit. Body validated by zod (see below). Inserts `pending`. Triggers transcription (if video) + `ai/polish` + `ai/assets`. |
| `/api/ai/[task]` | POST | owner or server-internal | `task ∈ polish|assets|request|tag|followup|translate|questions`. |
| `/api/embed/[wallId]` | GET | none | Returns **SSR HTML fragment + JSON-LD** for the live widget. `Cache-Control: public, s-maxage=300`. |
| `/api/stripe/checkout` | POST | owner | `{priceId}` → Checkout URL. |
| `/api/stripe/portal` | POST | owner | → Billing Portal URL. |
| `/api/stripe/webhook` | POST | Stripe sig | Update `profiles.plan` (see §12). |
| `/api/cron/requests` | GET | `CRON_SECRET` | Process due `requests`; send next nudge via Resend; advance `sequence_step`. |

**Testimonial submit zod schema:**
```ts
const SubmitSchema = z.object({
  slug: z.string().min(1),
  type: z.enum(['video','text']),
  authorName: z.string().min(1).max(120),
  authorTitle: z.string().max(160).optional(),
  authorPhotoUrl: z.string().url().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  text: z.string().max(5000).optional(),       // required if type==='text'
  videoUrl: z.string().url().optional(),        // required if type==='video'
  consent: z.literal(true),                     // must be true
});
```
The server records `consent_ts = now()` and `consent_ip` from request headers.

---

## 8. The collection flow (UX + acceptance)

Mobile-first page at `/c/[slug]`:
1. Branded header (logo, brand color) + one warm prompt question (from `collection_pages.prompt_questions`).
2. Two CTAs: **"Record a quick video"** and **"Write it instead."**
3. **Video path:** `MediaRecorder` API, front camera, 60s soft cap, show countdown, allow re-record. On stop → request presigned URL (`/api/upload-url`) → PUT to R2 → get `videoUrl`.
4. **Text path:** a textarea with the prompt question as placeholder.
5. Then collect: name (required), role/business (optional), photo (optional), star rating.
6. **Consent checkbox (required, unchecked by default):** *"I allow {brand_name} to share this testimonial — my name, words, and photo/video — on their website and in marketing."* Submit is disabled until checked.
7. POST `/api/testimonials`. Show a friendly thank-you screen.

**Acceptance:** works on iOS Safari + Android Chrome; no login anywhere; submit blocked without consent; a video submission appears in the dashboard as `pending` with a transcript within ~30s; total happy-path time < 2 minutes.

---

## 9. The Claude AI layer (`/lib/claude.ts`)

```ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Model selection
export const MODEL_QUALITY = 'claude-sonnet-4-6';          // polish (meaning-sensitive)
export const MODEL_FAST    = 'claude-haiku-4-5-20251001';  // everything else (cheap, frequent)

// Force JSON by prefilling the assistant turn with "{"
async function jsonCall(model: string, system: string, user: string) {
  const msg = await anthropic.messages.create({
    model,
    max_tokens: 1024,
    system,
    messages: [
      { role: 'user', content: user },
      { role: 'assistant', content: '{' },
    ],
  });
  const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
  return JSON.parse('{' + text);   // defensively parse; wrap in try/catch in callers
}
```

Each function below = one exported helper. **Every system prompt must keep the anti-fabrication clause.**

**A. `polishTestimonial(rawText)` — `MODEL_QUALITY`**
```
SYSTEM:
You are a careful editor that lightly cleans customer testimonials.
RULES:
1. NEVER add praise, claims, facts, names, numbers, or sentiment not in the original.
2. Keep the customer's voice and first-person perspective.
3. Fix grammar; remove filler ("um","like","you know"), false starts, and repetition.
4. Do not change the meaning or strengthen the opinion.
5. If the input is too short or has no clear point, return it almost unchanged.
6. Output JSON only.
USER: <raw transcript or typed text>
OUTPUT: {"cleaned": string, "pull_quote": string(<=12 words), "was_edited": boolean}
```

**B. `extractAssets(transcript)` — `MODEL_FAST`**
```
SYSTEM: From this testimonial transcript, extract display assets. Invent nothing. Output JSON only.
USER: <transcript>
OUTPUT: {"pull_quote": string(<=12 words), "summary": string(1 sentence),
         "themes": string[](max 3), "suggested_title": string(<=5 words),
         "captions_vtt": string (valid WebVTT)}
```

**C. `generateRequest({niche, tone, channel, link, name})` — `MODEL_FAST`**
```
SYSTEM: Write a short, warm testimonial request from a {niche} to a happy client named {name}.
Tone: {tone}. Channel: {channel}. Email body < 90 words; SMS < 2 sentences.
Exactly one clear CTA to {link}. No salesy fluff. Output JSON only.
OUTPUT: {"subject": string, "body": string, "variant_b": string}
```

**D. `tagTestimonial(text)` — `MODEL_FAST`**
```
SYSTEM: Classify this testimonial. Output JSON only.
OUTPUT: {"sentiment": "positive"|"neutral"|"mixed",
         "themes": string[](max 5), "has_specific_result": boolean,
         "best_for": "homepage"|"pricing_page"|"social"}
```

**E. `suggestFollowup(text)` — `MODEL_FAST`**
```
SYSTEM: This testimonial is vague. Suggest ONE specific follow-up question that would
surface a concrete result or story. Friendly, one sentence. Output JSON only.
OUTPUT: {"question": string}
```

**F. `translate(text, lang)` — `MODEL_FAST`** (Studio plan)
```
SYSTEM: Translate the testimonial into {lang}. Preserve voice and meaning. Invent nothing.
Output JSON only.
OUTPUT: {"translated": string, "machine_translated": true}
```

**G. `generateQuestions(niche)` — `MODEL_FAST`** (page setup)
```
SYSTEM: For a {niche}, generate 3 prompt questions that elicit specific, results-focused
testimonials. <= 15 words each. Output JSON only.
OUTPUT: {"questions": string[3]}
```

**Caller rules:** wrap `JSON.parse` in try/catch; on parse failure, fall back to raw text (never block submission on an AI error). Cache results in the DB columns so you never re-run AI on the same testimonial.

---

## 10. STT integration (`/lib/deepgram.ts`)

```ts
import { createClient } from '@deepgram/sdk';
const dg = createClient(process.env.DEEPGRAM_API_KEY!);

export async function transcribe(videoUrl: string): Promise<string> {
  const { result } = await dg.listen.prerecorded.transcribeUrl(
    { url: videoUrl },
    { model: 'nova-3', smart_format: true, punctuate: true }
  );
  return result?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? '';
}
```
Flow: submit video → store → `transcribe(videoUrl)` → save `raw_text` → `polishTestimonial` → `extractAssets`. Run async after responding to the user (don't block the thank-you screen).

---

## 11. The SEO embed — the wedge (`/lib/schema-ld.ts`, `/public/widget.js`, `/api/embed/[wallId]`)

Offer the owner **two embed options** in the wall's "Get embed code" panel:

**Option 1 — "Copy HTML" (best SEO; for homepage/sales page).** A static block of real testimonial text + author names (consented) + a `<script type="application/ld+json">` block. The owner pastes it directly; Google sees the text immediately.

**Option 2 — "Live widget" (auto-updates).** A small async script:
```html
<script async src="https://yourdomain.com/widget.js" data-wall="WALL_ID"></script>
```
`widget.js` (< 50KB, no framework) fetches `/api/embed/[wallId]`, which returns **server-rendered HTML** (not an iframe), and injects it. It also injects the JSON-LD. Lazy-load via `IntersectionObserver`; reserve space to avoid layout shift.

**JSON-LD builder:**
```ts
export function buildJsonLd(brandName: string, items: Testimonial[]) {
  const rated = items.filter(i => i.rating);
  const avg = rated.length
    ? (rated.reduce((s,i)=>s+(i.rating||0),0)/rated.length).toFixed(1) : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": brandName,
    ...(avg && { "aggregateRating": {
      "@type": "AggregateRating", "ratingValue": avg, "reviewCount": String(rated.length) }}),
    "review": items.slice(0, 20).map(i => ({
      "@type": "Review",
      "reviewRating": { "@type": "Rating", "ratingValue": String(i.rating ?? 5) },
      "author": { "@type": "Person", "name": i.author_name },
      "reviewBody": i.clean_text ?? i.raw_text ?? ""
    })),
  };
}
```

**Plan gating on embed:** Free → only Option 2, with a "Powered by" footer, and **no JSON-LD**. Pro/Studio → both options, no footer, JSON-LD on. (This makes SEO + de-branding the upgrade trigger.)

**Acceptance:** view-source of `/wall/[wallId]` and the `/api/embed` response both contain the literal review text; the JSON-LD passes Google's Rich Results Test; Lighthouse shows no CLS from the widget and total embed transfer < 50KB.

---

## 12. Billing (`/lib/stripe.ts`, `/lib/plans.ts`)

**Stripe products:** create two recurring prices — Pro ($19/mo) and Studio ($39/mo). Free needs no Stripe object.

**Gating map:**
```ts
export const PLANS = {
  free:   { maxTestimonials: 20,  brandingFooter: true,  seoEmbed: false, automation: false, aiEditing: false, brands: 1 },
  pro:    { maxTestimonials: Infinity, brandingFooter: false, seoEmbed: true,  automation: true,  aiEditing: false, brands: 1 },
  studio: { maxTestimonials: Infinity, brandingFooter: false, seoEmbed: true,  automation: true,  aiEditing: true,  brands: 5 },
} as const;
```
Enforce limits **server-side** on every relevant action (submit, embed render, request scheduling).

**Webhook events to handle (`/api/stripe/webhook`):**
- `checkout.session.completed` → set `profiles.plan` + `stripe_customer_id`.
- `customer.subscription.updated` → set plan from price; handle downgrades.
- `customer.subscription.deleted` → set plan back to `free`.
- `invoice.payment_failed` → `OPTIONAL` dunning email.

Verify the Stripe signature using `STRIPE_WEBHOOK_SECRET`. Use the raw body (disable body parsing on that route).

---

## 13. Email & request automation

**Resend templates (React Email):** `request-email` (the ask), `testimonial-approved` (thank-you/notify). Verify the sending domain (SPF/DKIM) before launch.

**Sequence logic (`/api/cron/requests`, Vercel Cron e.g. hourly):**
- Select `requests` where `status='active'` and `scheduled_at <= now()`.
- Send the email for the current `sequence_step` (copy from `generateRequest`).
- Advance: step 0 → +3 days, step 1 → +7 days, step 2 → mark `done`.
- If a testimonial arrives from that recipient/page, set their request `status='done'`.
- Protect the route with `CRON_SECRET` (compare header/secret).

---

## 14. Legal & compliance (build these in, don't bolt on)

- **Consent record:** every testimonial stores `consent`, `consent_ts`, `consent_ip`. Never display a testimonial with `consent=false`.
- **FTC:** the anti-fabrication prompt rules (§9) are the compliance mechanism — AI must not invent or embellish. Don't offer features that incentivize reviews without disclosure.
- **GDPR (Spain/EU):** privacy policy + terms pages; cookie/consent banner; a data-deletion path (deleting a testimonial purges the video from R2). If the operating entity is Spanish, generate baseline docs with the **AEPD "Facilita RGPD"** tool.
- **Email law:** request emails include an unsubscribe link + physical address (CAN-SPAM / EU). Stop the sequence on unsubscribe.

---

## 15. Build milestones (execute in order)

### Milestone 0 — Scaffold
Scaffold per §4, create `.env.example` per §5, apply §6 migration to Supabase, wire Supabase auth (magic link), deploy a hello-world to Vercel.
**Acceptance:** app boots; can sign up/in; tables + RLS exist; CI/deploy green.

### Milestone 1 — Collection + capture
Build `/c/[slug]` (§8): video recorder + text form + consent; presigned R2 upload; `POST /api/testimonials`; thank-you screen. Stub AI/STT (store raw only).
**Acceptance:** a real video + a text testimonial can be submitted on mobile; both land as `pending` with consent metadata; submit blocked without consent.

### Milestone 2 — AI + STT layer
Implement `/lib/claude.ts` (§9) + `/lib/deepgram.ts` (§10). On submit, async: transcribe → polish → assets → tag. Populate `clean_text`, `pull_quote`, `captions_vtt`, `themes`, `sentiment`.
**Acceptance:** new video testimonial shows transcript + clean text + pull quote within ~30s; AI failure never blocks submission; no key in client bundle.

### Milestone 3 — Dashboard + walls
Build `/app/*`: list/approve/hide/edit testimonials; create a wall; pick layout; select testimonials; "Get embed code" panel.
**Acceptance:** owner can approve a testimonial and add it to a wall; only their own data is visible (RLS verified by a second test account).

### Milestone 4 — The SEO embed (wedge)
Build `/wall/[wallId]` (SSR), `/api/embed/[wallId]`, `/public/widget.js`, `/lib/schema-ld.ts` (§11). Implement both embed options + plan-gated footer/JSON-LD.
**Acceptance:** review text present in raw HTML; JSON-LD passes Rich Results Test; widget < 50KB, lazy-loaded, no CLS; Free shows footer + no JSON-LD, Pro doesn't.

### Milestone 5 — Billing + automation + legal + launch prep
Stripe Checkout/Portal/webhook + gating (§12); Resend templates + cron sequence (§13); legal pages + consent/cookie banner (§14); landing + pricing pages; PostHog `OPTIONAL`.
**Acceptance:** test-mode upgrade flips plan and unlocks SEO embed; cron sends the next nudge and advances step; privacy/terms live; "Powered by" footer only on Free.

---

## 16. Launch checklist

**Pre-launch**
- [ ] Niche, name, domain locked.
- [ ] Landing + pricing pages live; free signup works.
- [ ] Stripe Free / Pro $19 / Studio $39; webhook tested end-to-end (test mode → live).
- [ ] Consent stored (bool + ts + IP) on every submission; unconsented never shown.
- [ ] Privacy policy, terms, cookie/consent banner (AEPD Facilita if ES entity).
- [ ] Gated behind Pro: remove-branding **and** SEO embed/JSON-LD.
- [ ] SEO embed passes Google Rich Results Test; Lighthouse clean.
- [ ] Resend domain verified (SPF/DKIM); request + approved emails sending.
- [ ] Rate-limiting on public endpoints (`/api/upload-url`, `/api/testimonials`).

**Soft launch (first 10 users)**
- [ ] Recruit 10 from your niche's communities; set up each wall by hand.
- [ ] Collect a testimonial from each → your own wall (dogfood).
- [ ] Fix the top 3 friction points you watch them hit.

**Public launch**
- [ ] Post in 3 niche communities; start building in public (X/LinkedIn).
- [ ] Publish "best testimonial tool for {niche}" + "vs Testimonial.to / vs Senja" pages.
- [ ] Product Hunt + relevant directories.
- [ ] DM people complaining about competitor pricing.

**Weekly loop**
- [ ] 1 SEO article, ~5 community touchpoints, ~10 cold DMs.
- [ ] Watch activation (got first testimonial) + free→paid; run one paywall experiment at a time.

---

## 17. Coding conventions & guardrails (for the agent)

- TypeScript **strict**; no `any` without a comment justifying it.
- Validate every API input with **zod**; return typed errors.
- **Secrets server-only.** Nothing sensitive in `NEXT_PUBLIC_*`. Never import `SUPABASE_SERVICE_ROLE_KEY` or `ANTHROPIC_API_KEY` into a client component.
- **RLS on every table**; public traffic served via service-role route handlers with explicit checks.
- Wrap external calls (Claude, Deepgram, Stripe, R2, Resend) in try/catch with graceful fallbacks; user-facing flows never hard-fail on a third-party error.
- Minimal but real **tests** for the three risk areas: (1) consent is persisted and gating works, (2) `/api/embed` HTML contains literal review text + valid JSON-LD, (3) Stripe webhook updates `profiles.plan`.
- Keep the embed dependency-free and tiny. Don't pull a framework into `widget.js`.
- Don't add features outside this spec without flagging them as proposals first.

---

## 18. Later / stretch (do not build now)

- **Mux** for higher-quality video recording/encoding/playback.
- Multilingual walls (auto-translate via §9F) as a Studio feature.
- Additional niche templates beyond the launch niche.
- Zapier/Make integration; native WordPress/Webflow plugins.
- Third-party review verification badge (for regulated niches).

---

*End of spec. Build milestone by milestone; meet the acceptance criteria; commit between each.*
