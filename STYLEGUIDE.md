# TrustWall UI Style Guide — "Harbor" (muted)

> Reference for all UI styling. When adding or editing UI, match these patterns so
> the product stays visually consistent and on-brand. **Tokens are the source of
> truth** — always prefer a token class (`bg-brand`, `text-ink`, `shadow-card`)
> over a raw Tailwind color (`bg-teal-600`, `text-gray-500`).
>
> **The UI is fully borderless: no outlines or borders on any element** (cards, fields,
> buttons, selection boxes, badges, dividers). Separate and lift surfaces with fills +
> `shadow-card` + spacing. The only exception is the accessibility focus ring. See §11.
>
> The full visual brand exploration (other directions, logos) lives in `/brand`.
> The interactive guide is published as a live Cowork artifact. This file is the
> day-to-day coding guide.

---

## 0. The brand in one paragraph

TrustWall sells **trust** — real consent, no fabrication, SEO-honest embeds — to
coaches, course creators, and solo service pros. The visual language is **"Harbor":
cool, modern, and elegant** — a soft sage-green paper, deep ink, and a *muted* slate-teal
that reads calm and architectural rather than loud. Accents are deliberately
desaturated (dusty clay, soft sand) so nothing shouts. It avoids the category
clichés (review-green, trust-blue, and the violet/purple of Testimonial.to and
Senja) and keeps the editorial serif headline. Tone: composed, honest, considered.

---

## 1. Design tokens

All color tokens live in **`app/globals.css`** under `@theme`. Tailwind v4 turns
each `--color-*` into utility classes automatically (e.g. `--color-brand` →
`bg-brand`, `text-brand`, `border-brand`, `ring-brand`). **To re-skin the entire
app, edit that one block.** Alternate directions are saved in
`brand/trustwall-design-tokens.css`.

| Token | Hex | Utility | Use for | Contrast vs canvas |
|---|---|---|---|---|
| `canvas` | `#E2E8E4` | `bg-canvas` | Page background (soft sage green) | — |
| `subtle` | `#DAE1DC` | `bg-subtle` | Alternating section bands | — |
| `surface` | `#FFFFFF` | `bg-surface` | Cards | — |
| `line` | `#DDDED5` | `border-line` | _(retired — the UI is borderless; see §11)_ | — |
| `grey10` | `#F0F0EB` | `bg-grey10` | **Form field fill** | — |
| `ink` | `#1C201F` | `text-ink` | Primary text | 13.2 : 1 (AAA) |
| `muted` | `#565B56` | `text-muted` | Secondary text | 5.6 : 1 (AA) |
| `brand` | `#3C5A54` | `bg-brand` / `text-brand` | **Links, buttons, active states** | 6.1 : 1 (AA) |
| `brand-strong` | `#2C443F` | `bg-brand-strong` | Hover / pressed / emphasis | 8.4 : 1 (AAA) |
| `on-brand` | `#FFFFFF` | `text-on-brand` | Text on a brand surface | 7.6 : 1 on brand |
| `on-brand-soft` | `#CDDAD6` | `text-on-brand-soft` | Muted text on brand | 5.3 : 1 on brand |
| `highlight` | `#3C5A54` | `text-highlight` | Highlighted words in headlines | 6.1 : 1 (AA) |
| `accent-soft` | `#C9D5CF` | `bg-accent-soft` | Tinted chips, pills, active fills, avatars | brand 5.0 : 1 (AA) |
| `secondary` | `#776046` | `bg-secondary` / `text-secondary` | Dusty clay — 2nd accent, illustrations | 4.8 : 1 (AA) |
| `secondary-strong` | `#695340` | `bg-secondary-strong` | Clay hover | — |
| `tertiary` | `#5F635D` | `text-tertiary` | Cool stone — meta text, hints | 4.9 : 1 (AA) |
| `tertiary-soft` | `#E3E5DE` | `bg-tertiary-soft` | Stone tint fills | — |
| `spark` | `#C8A06A` | `text-spark` | Soft sand — **decorative only** (stars, marks); never body text | — |

**Interactive rule (non-negotiable):** `brand` is the **one** color for anything
clickable — links *and* buttons *and* active states. `brand-strong` is only its
hover/pressed shade. Never introduce a second link color.

**Elevation (borderless):** the UI uses **no borders** — lift cards and surfaces off
the greige with the soft `shadow-card` / `shadow-card-lg` tokens instead (see §7, §11).
**Stars:** gold — `text-amber-400` filled, `text-gray-200` empty (or `text-spark` for a
softer sand).

---

## 2. Typography

Two families, wired via `next/font` in `app/layout.tsx`:

| Family | Token | Utility | Role |
|---|---|---|---|
| **Fraunces** (high-contrast serif) | `--font-display` | `font-display` | Display / headlines — the editorial voice |
| **Inter** (neutral grotesque) | `--font-sans` | default body font | Everything else — UI, body, labels |

**Headings auto-serif:** `globals.css` sets `h1, h2` to Fraunces automatically. For a
non-semantic display element, add `font-display`. **Keep `h3`/`h4`, card headings,
buttons, and UI labels in Inter** — Fraunces at small sizes reads too heavy.

| Element | Classes |
|---|---|
| Hero title (marketing) | `text-5xl font-bold tracking-tight text-ink leading-tight` (h1 → Fraunces) |
| Section heading | `text-3xl font-bold text-ink` (h2 → Fraunces) |
| Page title (dashboard) | `text-2xl font-bold text-ink` (use `<h1>`) |
| Card / form heading | `font-semibold text-ink` (h3/div — stays Inter) |
| Body | `text-sm` / `text-lg text-muted leading-relaxed` |
| Helper / caption | `text-xs text-tertiary` |
| Highlighted word | wrap in `<span class="text-highlight">…</span>` |

---

## 3. Buttons

`brand` fill = primary action. Same color as links (see §1).

```html
<!-- Primary -->
class="bg-brand text-on-brand px-6 py-3 rounded-xl font-semibold
       hover:bg-brand-strong disabled:opacity-50 transition-colors"
<!-- Secondary (quiet fill) -->
class="bg-subtle text-ink px-6 py-3 rounded-xl font-medium hover:bg-tertiary-soft transition-colors"
<!-- Ink (quiet dark action) -->
class="bg-ink text-on-brand px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
```

Radius `rounded-xl` (pills `rounded-full`); corners render as iOS squircles (§9);
always `transition-colors`; disabled `disabled:opacity-50`.

---

## 4. Links

```html
class="text-brand font-medium hover:text-brand-strong underline underline-offset-2"
```

Same `brand` color as buttons — always.

---

## 5. Form fields

**Every text input, textarea, and select uses a `grey10` fill.**

```html
class="w-full rounded-xl bg-grey10 px-3 py-2 text-sm
       focus:outline-none focus:ring-2 focus:ring-brand/40"
```

- **Fill:** `bg-grey10` (required) · **Radius:** `rounded-xl` / `rounded-2xl` (large)
- **Focus ring:** `focus:ring-2 focus:ring-brand/40` — soft teal, standard everywhere
  including auth.
- **Collection page** fields use the owner's brand color as the ring via inline
  `--tw-ring-color` (customer-customizable) — keep that, just keep `bg-grey10`.

---

## 6. Single-select boxes (no dropdowns)

Canonical: **`components/dashboard/LayoutPicker.tsx`**.

- 3-up grid; each option a `<button role="radio" aria-checked>`; wrapper `role="radiogroup"`
- **Active:** `bg-accent-soft shadow-card` with `text-brand` · **Inactive:** `bg-grey10` with `text-muted`, hover `bg-tertiary-soft`
- No borders — the filled `accent-soft` + soft shadow carries the active state

---

## 7. Cards & surfaces

Borderless — a soft shadow lifts the surface off the greige (never a border):

```html
class="bg-surface rounded-2xl shadow-card p-6"
```

- Radius `rounded-2xl` · Padding `p-6` standard, `p-4` compact, `p-12` empty states
- Elevation: `shadow-card` (resting), `shadow-card-lg` (raised/hover/modals)
- **Selected / active card:** `bg-accent-soft` (fill only — no border)

---

## 8. Semantic (non-brand) colors

State, not brand — stay in conventional hues.

| State | Classes |
|---|---|
| Success / approved | `bg-green-50 text-green-700` |
| Pending / warning | `bg-amber-50 text-amber-700` |
| Error / destructive | `text-red-500` / `bg-red-50 text-red-700` |
| Neutral / hidden | `bg-gray-100 text-gray-500` |
| Video badge | `bg-accent-soft text-brand-strong` |

Decorative avatar chips use calm fills only — `bg-accent-soft text-brand`,
`bg-stone-200 text-stone-700`. **No purple / sky / emerald / indigo / bright-teal.**

---

## 9. Corners — squircles

`app/globals.css` upgrades every rounded element to an **iOS-style squircle**
(`corner-shape: squircle`) app-wide, except `rounded-full` (avatars, pills, dots stay
round). Progressive enhancement: Chromium 139+ shows the superellipse; other browsers
fall back to normal `border-radius`. Keep using the normal `rounded-xl` / `rounded-2xl`
radii — the squircle shaping is applied globally.

---

## 10. Accessibility

- All text/interactive tokens verified **WCAG 2.1 AA** against `canvas` (most AAA) —
  see the contrast comment atop `globals.css`. Re-check before adding a new color.
- Custom controls need ARIA roles and a visible focus ring (`focus:ring-2 focus:ring-brand/40`).
  The borderless rule (§11) **never** applies to focus rings — they're the one ring we always keep.
- `on-brand-soft` is for muted/secondary text on a brand fill; use `on-brand` (white)
  for primary text on brand.

---

## 11. Conventions

- **No outlines / borders (hard rule).** The product is **fully borderless** — never add
  `border`, `border-*`, `border-2`, or hairline dividers (`border-t/b/y`) to any element.
  Separate and lift surfaces with **fills** (`bg-surface` / `bg-grey10` / `bg-subtle`) +
  **`shadow-card`** + spacing. Tables that need row separation use zebra striping
  (`[&>tr:nth-child(even)]:bg-subtle`), not row rules. The ONE exception is the
  accessibility **focus ring** (`focus:ring-2 focus:ring-brand/40`) — always keep it.
  (`border-line` is retired.)
- **Token first.** Reach for `bg-brand` / `text-muted` / `shadow-card` before raw `gray-*` / hex.
- **Radii ladder:** fields/buttons `rounded-xl`, cards `rounded-2xl`, pills `rounded-full`
  (all shaped as squircles except `rounded-full`).
- **Headlines in Fraunces, everything else in Inter** (see §2).
- **Never reintroduce indigo/violet/purple/sky** — and keep the teal *muted*, not the
  bright category review-green.
- To re-skin: swap the `@theme` block in `app/globals.css` (alternates in
  `brand/trustwall-design-tokens.css`).
```
