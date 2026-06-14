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

> **0. SCOPE LOCK (agent operating boundary — applies to every task, file, and scheduled run).** Only ever read, write, or run commands inside the `trustwall` project folder (`/Users/erikmcdonald/personal-dev/trustwall`). Never read, write, move, or delete anything anywhere else on the user's computer, for any reason. Web search / fetch is permitted when a task needs it (it's network, not the local machine); the local filesystem stays off-limits outside this folder. **Reproduce this SCOPE LOCK block verbatim in every document, file, config, or scheduled task you generate.**

# Onboarding & Plan-Change Flows

User flows for (a) onboarding a new customer on each subscription tier — Free,
Pro, Studio — and (b) what happens when an existing customer upgrades or
downgrades. This document is the design; the implementation mapping at the
bottom lists exactly which files realize it.

---

## 1. Shared foundation

- **Auth is magic-link only.** A profile row is auto-created (`plan: 'free'`)
  in the auth callback on first sign-in.
- **`profiles.onboarded_at`** (migration `0005`) records whether the setup
  wizard was finished. `NULL` → the dashboard layout redirects to
  `/onboarding`. Existing accounts are backfilled as already onboarded.
- **Plan intent** is carried from the pricing page through the magic-link
  round-trip as a query param: pricing CTA → `/login?next=/onboarding?plan=pro`
  → magic link → auth callback → `/onboarding?plan=pro`. Nobody pays before
  they have an account; Free is always the starting state.
- The wizard lives at **`/onboarding`** — a full-screen page outside the
  dashboard shell (no sidebar), styled with existing Harbor tokens only.

### Wizard steps (all tiers share the skeleton)

| # | Step | What happens |
|---|------|--------------|
| 1 | **Brand** | Brand name, brand colour, niche → saved to `profiles` (same fields as Settings). |
| 2 | **Collection page** | Title, prompt question, slug (auto-suggested from brand name), star-rating toggle → creates the first `collection_pages` row. If one already exists, it's shown and reused. |
| 3 | **Plan** | **Confirms** the plan already chosen on the pricing page — it never re-asks the user to pick. Tier-dependent — see flows below. |
| 4 | **Done** | Share link (`/c/slug`) with copy button + a plan-aware "what's next" checklist. "Go to my dashboard" stamps `onboarded_at` and lands on `/app/testimonials`. |

A quiet "Skip setup for now" escape hatch is always visible; it also stamps
`onboarded_at` so the user is never trapped in the wizard.

The wizard resumes intelligently: on load the server computes the first
incomplete step (no brand name → 1, no collection page → 2, otherwise 3;
`?upgraded=1` → 4), so abandoning mid-way and signing in again continues where
the user left off.

---

## 2. Flow: Free onboarding

**Entry:** pricing "Get started free" → `/login?next=/onboarding`, or any
generic sign-up (default `next=/app` → layout bounces un-onboarded users to
`/onboarding`).

1. Brand → 2. Collection page → 3. **Plan step confirms "You're on the Free
plan"**: a summary card (1 collection page, 1 wall, up to 20 testimonials,
hosted wall, "Powered by LaudMark" footer) with a single **Continue**. No
in-wizard upsell — upgrading lives on the Done checklist and in Account → Plan
& billing.
4. Done — checklist: share the link; approve testimonials (approved ones go on
the wall); the hosted wall is live. Notes the 20-testimonial cap and footer,
and that upgrading lives in Account → Plan & billing.

## 3. Flow: Pro onboarding

**Entry:** pricing "Upgrade to Pro" → `/login?next=/onboarding?plan=pro`.

1. Brand → 2. Collection page → 3. **Plan step confirms the Pro choice** —
heading "Activate your Pro plan", the Pro card highlighted (unlimited
testimonials, SEO embed + JSON-LD, no branding, request automation) with
primary **Start Pro — $19/mo** → Stripe Checkout
(`success_url=/onboarding?upgraded=1`, `cancel_url=/onboarding`). A secondary
**Continue on Free instead** lets them defer.
4. Done — Pro checklist: share the link; grab the **SEO embed code** from the
wall; set up **request automation**; branding is off.

- **Checkout cancelled** → back at step 3, nothing lost.
- **Webhook lag** (returned from Stripe before the webhook flipped the plan):
  step 4 shows a "payment received — features activating" notice instead of
  claiming Pro is live.

## 4. Flow: Studio onboarding

Identical to Pro with the Studio card ($39/mo) and a Done checklist that adds
**AI editing & translation** and **up to 5 brands**.

---

## 5. Flow: Upgrade

| From → To | Mechanism |
|---|---|
| Free → Pro / Studio | Stripe **Checkout** (new subscription) — existing upgrade cards on `/app/account`. |
| Pro → Studio | **Subscription price change** (`changeSubscriptionPrice`) — modifies the existing subscription with proration. Never creates a second subscription. |

1. Entry points: upgrade cards on `/app/account`; pricing-page CTAs for a
   signed-in, already-onboarded user route to `/app/account` (intent
   preserved, wizard skipped).
2. After success the user returns to `/app/account?upgraded=1`, which shows a
   **plan-aware "what just unlocked" card**: SEO embed + JSON-LD (with a link
   to the wall to grab the embed code), branding removed, request automation —
   plus AI editing/translation and 5 brands for Studio.
3. If the Stripe webhook hasn't landed yet, the page shows an "upgrade
   activating" notice rather than stale features. (Price-change upgrades also
   set `profiles.plan` directly so the UI is immediate; the webhook remains
   the source of truth.)

## 6. Flow: Downgrade

All downgrades start from a **Change plan** section on `/app/account`
(visible on paid plans only). Every path shows the concrete consequences —
with the user's live numbers — before anything is confirmed.

### Studio → Pro
1. "Switch to Pro — $19/mo" expands a confirmation card: loses AI editing &
   translation, extra brands, white-label; keeps unlimited testimonials, SEO
   embed, automation.
2. Confirm → subscription price changed with proration → webhook +
   immediate `profiles.plan` update → banner "You're now on Pro."

### Pro / Studio → Free (cancel)
1. "Downgrade to Free" expands a confirmation card listing, with live counts:
   - "You have **N** testimonials — Free keeps up to 20."
   - SEO embed + JSON-LD turns off (walls stop earning Google stars).
   - The "Powered by LaudMark" footer returns.
   - "**N** active request sequence(s) stop sending" / automation turns off.
   - (Studio) AI editing, translation, extra brands turn off.
   - Paid features stay active until the period end date, then Free.
2. Confirm → `cancel_at_period_end = true` on the Stripe subscription. The
   plan stays paid until the period ends; Stripe then emits
   `customer.subscription.deleted` → webhook sets `plan='free'`.
3. The account page now shows a **pending-cancellation card** ("ends on
   {date} — you'll move to Free") with a **Resume subscription** button that
   un-sets `cancel_at_period_end` (banner: "Subscription resumed").

---

## 7. Edge cases

| Case | Behaviour |
|---|---|
| Existing accounts at migration time | Backfilled `onboarded_at` — never see the wizard. |
| Migration 0005 not applied yet | Layout/wizard tolerate the missing column (project convention) — no redirect loop, no crash. |
| Un-onboarded user deep-links into `/app/*` | Layout redirect → `/onboarding` (applies to every dashboard page by construction). |
| Onboarded user opens `/onboarding` | Redirect to `/app` (or `/app/account` if a `?plan=` upgrade intent is present). With `?preview=1` (the dashboard nav's "Onboarding flow ↗" link) the wizard renders instead, so the owner can always view it. |
| Signed-out user opens `/onboarding?plan=pro` | → `/login?next=/onboarding?plan=pro` — intent survives the magic link. |
| Slug already taken in wizard | Inline error, user edits the slug (same validation as the dashboard form). |
| User abandons wizard mid-way | Next sign-in resumes at the first incomplete step. |
| `?upgraded=1` but webhook not yet processed | "Activating" notice (wizard step 4 and account page). |
| Pro user buys Studio | Price change on the existing subscription — never a second Checkout subscription. |
| Cancelled then changed their mind | Resume button while the period is still running. |

---

## 8. Implementation map

| Piece | File |
|---|---|
| `onboarded_at` column + backfill | `supabase/migrations/0005_add_onboarded_at.sql` |
| Wizard page (server: auth, resume step, intent) | `app/onboarding/page.tsx` |
| Wizard server actions (brand, first page, complete) | `app/onboarding/actions.ts` |
| Wizard UI (stepper + 4 steps, client) | `components/onboarding/OnboardingWizard.tsx` |
| Redirect un-onboarded users | `app/app/layout.tsx` |
| Pricing CTAs carry plan intent | `app/(marketing)/pricing/page.tsx` |
| Checkout `returnTo`, price change, cancel, resume | `app/app/billing/actions.ts` |
| Unlocked card, banners, renewal line, Change plan | `app/app/account/page.tsx` |
| Downgrade / cancel / resume confirmation UI | `components/dashboard/DowngradePanel.tsx` |

Styling reuses existing Harbor patterns only: `bg-surface rounded-2xl p-6`
cards, `bg-grey10` fields, `bg-brand`/`bg-subtle` buttons, `bg-accent-soft`
active fills, §8 semantic colors for success/pending/destructive states. No
new tokens, no borders, no shadows.
