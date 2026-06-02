# TrustWall UI Style Guide — "Testament"

> Reference for all UI styling. When adding or editing UI, match these patterns so
> the product stays visually consistent and on-brand. **Tokens are the source of
> truth** — always prefer a token class (`bg-brand`, `text-ink`, `border-line`)
> over a raw Tailwind color (`bg-indigo-600`, `text-gray-500`).
>
> The full visual brand system (rationale, logos, the other directions we
> rejected) lives in `/brand`: open `brand/trustwall-brand-styleguide.html` in a
> browser to see it with the real fonts. This file is the day-to-day coding guide.

---

## 0. The brand in one paragraph

TrustWall sells **trust** — real consent, no fabrication, SEO-honest embeds — to
coaches, course creators, and solo service pros. The visual language is
**"Testament": warm, editorial, and credible**, like a respected publication or a
signed statement. Warm paper backgrounds, deep warm-black ink, a confident burnt
sienna accent, and a high-contrast serif for headlines. It deliberately avoids the
category clichés (review-green, trust-blue, and the violet/purple used by
Testimonial.to and Senja). Tone: honest, calm, human — never loud or salesy.

---

## 1. Design tokens

All color tokens live in **`app/globals.css`** under `@theme`. Tailwind v4 turns
each `--color-*` into utility classes automatically (e.g. `--color-brand` →
`bg-brand`, `text-brand`, `border-brand`, `ring-brand`). **To re-skin the entire
app, edit that one block.** All three brand directions are pre-written in
`brand/trustwall-design-tokens.css`.

| Token | Hex | Utility | Use for | Contrast vs canvas |
|---|---|---|---|---|
| `canvas` | `#FBF8F2` | `bg-canvas` | Page background (warm paper) | — |
| `subtle` | `#F4ECDE` | `bg-subtle` | Alternating section bands | — |
| `surface` | `#FFFFFF` | `bg-surface` | Cards (lift off the paper) | — |
| `line` | `#E9DECB` | `border-line` | Borders / hairlines | — |
| `grey10` | `#F6F0E6` | `bg-grey10` | **Form field fill** | — |
| `ink` | `#211C16` | `text-ink` | Primary text | 15.9 : 1 (AAA) |
| `muted` | `#5E5341` | `text-muted` | Secondary text | 7.1 : 1 (AAA) |
| `brand` | `#A8531B` | `bg-brand` / `text-brand` | **Links, buttons, active states** | 5.1 : 1 (AA) |
| `brand-strong` | `#844014` | `bg-brand-strong` | Hover / pressed / emphasis | 7.3 : 1 (AAA) |
| `on-brand` | `#FFFFFF` | `text-on-brand` | Text on a brand surface | 5.4 : 1 on brand |
| `on-brand-soft` | `#F4DEC8` | `text-on-brand-soft` | Muted text on brand (large) | 4.1 : 1 on brand |
| `highlight` | `#8A4514` | `text-highlight` | Highlighted words in headlines | 6.7 : 1 (AA) |
| `accent-soft` | `#F6E8D4` | `bg-accent-soft` | Tinted chips, pills, active fills, avatars | — |
| `secondary` | `#9A3412` | `bg-secondary` / `text-secondary` | Terracotta — 2nd accent, illustrations | 6.9 : 1 (AA) |
| `secondary-strong` | `#7C2A0E` | `bg-secondary-strong` | Terracotta hover | — |
| `tertiary` | `#8C7B63` | `text-tertiary` | Warm stone — meta text, dividers, illustration | — |
| `tertiary-soft` | `#E8DFD0` | `bg-tertiary-soft` | Stone tint fills | — |
| `spark` | `#E0A23C` | `text-spark` | Marigold — **decorative only** (stars, accents); never body text | — |

**Interactive rule (non-negotiable):** `brand` is the **one** color for anything
clickable — links *and* buttons *and* active states. `brand-strong` is only its
hover/pressed shade. Never introduce a second link color.

**Star ratings:** use `text-amber-400` (or `text-spark`) filled, `text-line` /
`text-gray-200` empty. Gold stars are a universal convention — keep them.

---

## 2. Typography

Two families, wired via `next/font` in `app/layout.tsx`:

| Family | Token | Utility | Role |
|---|---|---|---|
| **Fraunces** (high-contrast serif) | `--font-display` | `font-display` | Display / headlines — the editorial voice |
| **Inter** (neutral grotesque) | `--font-sans` | default body font | Everything else — UI, body, labels |

**Headings auto-serif:** `globals.css` sets `h1, h2` to Fraunces automatically, so
semantic page/section titles get the serif with no extra class. For a non-semantic
display element (a `<div>` styled as a hero number, a marketing stat), add
`font-display`. **Keep `h3`/`h4`, card headings, buttons, and all UI labels in
Inter** — Fraunces at small sizes reads too heavy.

| Element | Classes |
|---|---|
| Hero title (marketing) | `text-5xl font-bold tracking-tight text-ink leading-tight` (h1 → Fraunces) |
| Section heading | `text-3xl font-bold text-ink` (h2 → Fraunces) |
| Page title (dashboard) | `text-2xl font-bold text-ink` (use `<h1>`) |
| Card / form heading | `font-semibold text-ink` (h3/div — stays Inter) |
| Body | `text-sm` / `text-lg text-muted leading-relaxed` |
| Helper / caption | `text-xs text-tertiary` |
| Highlighted word in a headline | wrap in `<span class="text-highlight">…</span>` |

Letter-spacing of `-0.02em` is applied to `h1, h2` in `globals.css`; don't re-add it.

---

## 3. Buttons

`brand` fill = primary action. Same color as links (see §1).

**Primary:**

```html
class="bg-brand text-on-brand px-6 py-3 rounded-xl font-semibold
       hover:bg-brand-strong disabled:opacity-50 transition-colors"
```

**Primary (compact / dashboard):**

```html
class="px-4 py-2 bg-brand text-on-brand text-sm font-medium rounded-xl
       hover:bg-brand-strong disabled:opacity-50 transition-colors"
```

**Secondary / outline:**

```html
class="border border-line text-ink px-6 py-3 rounded-xl font-medium
       hover:bg-subtle transition-colors"
```

**Ink button** (e.g. nav "Sign in", where a quieter dark action is wanted):

```html
class="bg-ink text-on-brand px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
```

- Radius: `rounded-xl` (pills use `rounded-full`)
- Disabled: `disabled:opacity-50`
- Always `transition-colors`

---

## 4. Links

```html
class="text-brand font-medium hover:text-brand-strong underline underline-offset-2"
```

Inline links in body text may drop the underline if context makes them obvious, but
default to underlined for accessibility. Same `brand` color as buttons — always.

---

## 5. Form fields

**Every text input, textarea, and select uses a `grey10` fill.** Never leave a
field on a white/transparent background.

**Recipe (dashboard / collection):**

```html
class="w-full rounded-xl border border-gray-200 bg-grey10 px-3 py-2 text-sm
       focus:outline-none focus:ring-2 focus:ring-brand/40"
```

- **Fill:** `bg-grey10` (required on all fields)
- **Border:** `border border-gray-200`
- **Radius:** `rounded-xl` (dashboard) / `rounded-2xl` (large collection inputs)
- **Padding:** `px-3 py-2` (compact) / `px-4 py-3` (collection)
- **Focus ring:** `focus:outline-none focus:ring-2 focus:ring-brand/40` — a soft
  sienna ring. This is now the standard **everywhere, including auth** (the old
  black ring is retired).

**Label:**

```html
class="block text-sm font-medium text-gray-700 mb-1.5"
```

**Exceptions:**
- **Collection page** fields use the *owner's* brand color as the focus ring via an
  inline `--tw-ring-color` style — keep that (it's customer-customizable), just keep
  `bg-grey10`.
- **Color swatch** (`<input type="color">`) gets no fill — it renders the color itself.

---

## 6. Single-select boxes (no dropdowns)

**Do not use `<select>` for a small, fixed set of visual choices.** Use selectable
boxes. Canonical implementation: **`components/dashboard/LayoutPicker.tsx`** — reuse
or copy its pattern.

- 3-up grid: `grid grid-cols-3 gap-3`
- Each option: `<button type="button">` with `role="radio"` + `aria-checked`;
  wrapper is `role="radiogroup"`
- **Active:** `border-brand bg-accent-soft` with `text-brand`
- **Inactive:** `border-line bg-grey10` with `text-muted`, hover `border-gray-300`
- Use `border-2` so the active border reads clearly
- Include a small glyph + label + one-line hint per box

---

## 7. Cards & surfaces

```html
class="bg-surface rounded-2xl border border-line p-6"
```

- Radius: `rounded-2xl`
- Border: `border border-line`
- Padding: `p-6` standard, `p-4` compact, `p-12` empty states
- **Selected / active card:** `border-2 border-brand bg-accent-soft`

---

## 8. Semantic (non-brand) colors

These communicate **state**, not brand, and stay in their conventional hues. Keep
them — they should read the same in any palette.

| State | Classes |
|---|---|
| Success / approved | `bg-green-50 text-green-700 border-green-200` |
| Pending / warning | `bg-amber-50 text-amber-700 border-amber-200` |
| Error / destructive | `text-red-500` / `bg-red-50 text-red-700` |
| Neutral / hidden | `bg-gray-100 text-gray-500 border-gray-200` |
| Video badge | `bg-accent-soft text-brand-strong border border-line` |

Decorative avatar chips (mock data, initials) use warm fills only —
`bg-accent-soft text-brand`, `bg-orange-100 text-orange-800`, `bg-stone-200
text-stone-700`. **No purple / sky / emerald / indigo.**

---

## 9. Logo & wordmark

The product name stays visible as the **"TrustWall" wordmark** in-app for now
(nav, login, footer). Three logo concepts are proposed in `brand/logos/`
(`logo-1-keystone`, `logo-2-quote`, `logo-3-chorus`, plus icon-only favicons) — the
final mark is still TBD, so don't wire a logo image into the UI yet. When it's
chosen, the SVG accents recolor to `brand` (`#A8531B`).

---

## 10. Accessibility

- All text/interactive tokens are verified **WCAG 2.1 AA** against `canvas` (most
  AAA) — see the contrast comment at the top of `globals.css`. Don't hand-pick a new
  brand/text color without re-checking contrast.
- Custom controls (selection boxes, toggles) need ARIA roles and a **visible focus
  ring** (`focus:ring-2 focus:ring-brand/40`) — never strip the ring to "clean up".
- `on-brand-soft` is for large or secondary text on a brand fill only (4.1:1); use
  `on-brand` (white) for primary text on brand.

---

## 11. Conventions

- **Token first.** Reach for `bg-brand` / `text-muted` / `border-line` before any
  raw `gray-*` / `indigo-*`. Migrate `gray-*` → token when you touch a file.
- **Radii ladder:** fields/buttons `rounded-xl`, cards `rounded-2xl`, pills
  `rounded-full`.
- **Transitions:** interactive elements get `transition-colors` (or
  `transition-all` when border + bg both animate).
- **Headlines in Fraunces, everything else in Inter** (see §2).
- **Never reintroduce indigo/violet/purple/sky** — they're the look we left behind.
- To re-skin: swap the `@theme` block in `app/globals.css` (all three directions
  are in `brand/trustwall-design-tokens.css`).
```
