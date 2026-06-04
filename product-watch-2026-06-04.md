# TrustWall Product Watch — 2026-06-04 (run 3, ~evening)

## ⚠️ Action Required in 11 Days: Model retirement June 15

`claude-sonnet-4-20250514` (original Sonnet 4.0) retires June 15. **Your code uses `claude-sonnet-4-6` — not affected.** No code change needed; confirm the Vercel env var isn't pointing at an older alias string just in case.

---

## 1. Dependencies & Security

No new changes from run 2. Pending minor/patch updates (no security advisories):

| Package | Installed | Latest | Upgrade command |
|---|---|---|---|
| `next` + `eslint-config-next` | 16.2.6 | 16.2.7 | `pnpm up next eslint-config-next` |
| `react` / `react-dom` | 19.2.4 | 19.2.7 | `pnpm up react react-dom` |
| `@aws-sdk/client-s3` + `presigner` | 3.1057.0 | 3.1061.0 | `pnpm up @aws-sdk/client-s3 @aws-sdk/s3-request-presigner` |
| `@supabase/supabase-js` | 2.106.2 | 2.107.0 | `pnpm up @supabase/supabase-js` |

**Hold:** `typescript` 5→6 and `eslint` 9→10 are major bumps — wait for a dedicated test session.

Models all current: `claude-sonnet-4-6` ✓, `claude-haiku-4-5-20251001` ✓, Deepgram `nova-3` ✓ (nova-3 received a 34% WER reduction update in March 2026 — no action needed, same model string).

---

## 2. Progress vs. Build Spec

No new commits (last: June 2). All M0–M5 complete. Active uncommitted work across 21 files includes the Harbor rebrand polish, settings page improvements, and a new untracked migration:

- **`supabase/migrations/0003_add_full_name.sql`** — adds `full_name` column to `profiles`. This needs to be applied to Supabase (run via `supabase db push` or paste into the SQL editor). Nothing breaks without it but the settings form won't save the display name field.

---

## 3. Competitor Watch

**⚠️ Testimonial.to pricing correction from run 2.** Run 2 stated SEO embed is locked to an $80/mo tier. Multiple sources now show current pricing as: Free / $25 / $40 / $60 per space per month, with branding removal at $40 and the top tier at $60 (not $80). If this is a recent price drop, the competitive gap at the top narrows slightly, but TrustWall Pro at $19 still undercuts significantly. **No SEO server-rendered embed or consent-in-flow feature detected at any tier — wedge 1 and wedge 2 remain intact.** Suggested action: verify directly at testimonial.to/pricing.

**Senja** — Confirmed $29 Starter / $59 Pro. Has auto-transcription and sentiment analysis (overlaps TrustWall's AI layer) but no server-rendered JSON-LD SEO story. Wedge 1 intact. TrustWall Pro at $19 undercuts Senja Starter by $10/mo.

---

*Run `pnpm audit` locally to double-check CVEs. Apply migration 0003 before next deploy.*
