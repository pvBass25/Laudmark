# TrustWall — Marketing Plan

> A cheap (< $100/mo), Claude-powered growth plan for a just-launched testimonial SaaS.
> Beachhead niche: **coaches**. Engine: **SEO + product-led loops**, executed almost entirely with Claude.
> Horizon: **next 90 days**, then a repeatable weekly loop.

---

## 0. How to use this plan

1. Read §1–§4 once to internalize the strategy. Everything after is execution.
2. Work the **90-day roadmap (§9)** week by week. The companion `content-calendar.xlsx` is the day-to-day to-do list; this doc is the "why."
3. Every task that says *"→ Claude"* has a ready-to-paste prompt in the **Claude Playbook (§10)**. You are the strategist and the voice; Claude is the drafting, research, and repurposing engine.
4. Review once a week against the metrics in §11. Run **one** experiment at a time.

**The core bet:** you don't out-spend Testimonial.to or Senja — you out-position them on one true wedge (SEO that's normally locked behind $80/mo tiers, on your $19 plan), then let the product market itself through embeds and Google stars while compounding content does the rest.

---

## 1. Situation (June 2026)

**Where you are:** Live, few or no paying customers. The goal of the next 90 days is *first 10–50 users, first paying customers, and a content engine that keeps compounding after.*

**Market reality, from current research:**

| Competitor | Free tier | Entry paid | "Google stars" (rich results / SEO) | Remove branding |
|---|---|---|---|---|
| **Testimonial.to** | 1 space, 2 video / 10 text | Starter **$20/mo** | Locked to **Ultimate ~$80/mo** | **+$40/mo** add-on |
| **Senja** | 15 testimonials | Starter **~$29/mo** | Higher tiers | Higher tiers |
| **TrustWall (you)** | 20 testimonials | **Pro $19/mo** | **Included on Pro $19** (JSON-LD + SSR) | **Included on Pro** |

**The takeaway:** the single feature that makes a testimonial widget *worth money* to a coach — getting ⭐ star ratings to show up in Google and not slowing the site — is the feature competitors charge ~$80/mo for. You ship it at **$19**, server-rendered (not an iframe), with consent + automation included on cheap tiers. That gap is the entire campaign.

**Macro tailwind:** a solo founder can now run 70–80% of marketing execution through AI (drafts, emails, social, repurposing), with quality control by a human. This plan is built around that — it is realistically doable by one person + Claude in ~6–10 focused hours/week.

---

## 2. Positioning & messaging

**One-liner:** *"Collect video + text testimonials with one link — and show them in a fast widget that earns you Google star ratings instead of slowing your site."*

**Category framing:** not "another testimonial tool." You are *"the testimonial tool that's good for your SEO."* Lead with the outcome (Google stars, faster page, more trust), not the feature list.

### The three wedges (every piece of content ladders up to one of these)

1. **SEO-positive embed.** Server-rendered text + `schema.org` review markup, so the customer earns Google star ratings and the widget *helps* PageSpeed. Competitors use iframes/JS that hide review text from Google and slow the page. → *"Reviews Google can actually read."*
2. **Automation + consent on cheap tiers.** Auto-request at the right moment; usage-rights consent captured in the same flow. Competitors lack it or gate it at $99+. → *"Set it up once, testimonials roll in — legally clean."*
3. **Reliability + niche fit.** Fast, never loses data, speaks the coach's language, embeds where they live (Webflow / WordPress / Kajabi / Systeme). → *"Built for coaches, not for everyone."*

### Messaging pillars (the only 4 stories you tell, repeatedly)

- **"Get Google stars for $19, not $80."** (price + SEO wedge — the hook)
- **"Your testimonial widget is probably slowing your sales page. Here's the fix."** (problem-aware, technical, demoable)
- **"Stop chasing clients for reviews — automate the ask, capture consent."** (workflow + compliance)
- **"Real proof, never faked."** (FTC-safe AI that cleans but never invents — a trust differentiator, see §12)

### Objection handling (keep these answers handy for DMs, comments, FAQ)

- *"I already use Testimonial.to."* → "Do your reviews show up as stars in Google? On their plans that's the $80 tier. Same thing here is $19, and it won't slow your page."
- *"Is the AI making up reviews?"* → "Never. It cleans filler and grammar only — it's literally prompt-blocked from adding praise, names, or numbers. That's an FTC requirement we take seriously."
- *"I'm not technical."* → "One link to collect, copy-paste one line to embed. If you can paste a YouTube embed, you can do this."

---

## 3. Ideal customer & beachhead

You picked *no preference* on niche, so the recommendation is: **start with coaches, expand to course creators second.**

**Why coaches first (the beachhead):**
- Their sales pages live and die on social proof — testimonials are a *core buying trigger*, not a nice-to-have.
- They cluster in findable, high-density communities (Skool is now the dominant home for coaches/creators in 2026; plus Facebook groups, Circle, niche subreddits).
- They already pay for marketing tools and understand "rank higher on Google."
- The product already integrates with the platforms they use (Kajabi, Systeme, WordPress, Webflow).

**Primary ICP:** a solo or small-team coach (business / life / fitness / career) selling a $500–$5,000 offer from a website or funnel, who manually screenshots testimonials today and worries their page is slow.

**Expansion order (don't touch until coaches works):** Course creators → solo service pros / consultants → agencies-of-one. Each reuses ~80% of the content with swapped vocabulary (Claude does the swap — see §10).

---

## 4. The growth model (how a stranger becomes paying)

```
        Content / Community / Launches / Embeds in the wild
                              │
                      Free signup (1 link, no card)
                              │
        ★ Activation = "collected first testimonial"  ← the whole game
                              │
        Hits a wall: wants Google stars / remove "Powered by" / automation
                              │
                       Upgrade to Pro $19
```

**Activation is the metric that matters.** A free user who collects one testimonial has felt the magic and embedded your "Powered by TrustWall" footer on their site. Optimize relentlessly for *time-to-first-testimonial*.

**Two compounding loops make this cheap and self-reinforcing — build them deliberately:**

- **Loop A — the Powered-by footer.** Every free wall embeds "Powered by TrustWall" on the customer's live site. Each customer becomes a billboard on a page their visitors already trust. Free users *are* your ad network. (Removing it is a paid trigger — so the loop also drives revenue.)
- **Loop B — Google stars → word of mouth.** When a Pro customer's page starts showing ⭐ ratings in Google, that's a visible, braggable win they'll mention in their own communities — and a ready-made case study for you. The product produces its own proof.

A third, founder-driven loop: **dogfood.** Collect testimonials *for TrustWall, using TrustWall*, and show them everywhere. It proves the product and generates content in one move.

---

## 5. Channel strategy (prioritized)

Pick few, go deep. For a just-launched solo SaaS the priority order is:

**Tier 1 (do these every week):**
1. **SEO + content** — the compounding engine. Seeds now, pays for years.
2. **Build-in-public on X + LinkedIn** — founder distribution while SEO warms up.
3. **Community value-giving** (Skool / Reddit / Facebook / Indie Hackers) — where coaches already are.

**Tier 2 (campaign-based / always-on but lower cadence):**
4. **Direct, intent-based outreach** (warm DMs to people complaining about competitors or asking for proof tools) + dogfood collection.
5. **Launch surfaces** (Product Hunt + alternatives) — a timed spike around day ~60–75.

**Tier 3 (set up once, runs itself):**
6. **Lifecycle email + referral loop** — onboarding nudges to drive activation; the product's own automation as a showcase.

Each channel below: *why → what to do → Claude's role → cost → KPI.*

### 5.1 SEO + content (the engine)

- **Why:** highest-ROI long-term channel; content written now drives signups for years. SEO takes ~7–9 months to compound, so **start today** — early signups come from the other channels while this warms.
- **What to do — three content types:**
  1. **Pain-point clusters** (top of funnel): "how to ask clients for a testimonial," "testimonial page slowing your site," "do reviews help SEO," "how to get Google star ratings for your coaching site." Build topical authority around the coach's problems.
  2. **Comparison / alternative pages** (bottom of funnel, high intent): "TrustWall vs Testimonial.to," "Testimonial.to alternative for coaches," "Senja alternative." *"X vs Y" searchers are deciding right now.*
  3. **Product-led / template pages:** "free wall of love generator," "testimonial request email templates for coaches," "video testimonial questions to ask clients."
- **⚠️ 2026 quality bar:** Google's May 2026 core update penalizes *thin* programmatic pages. Do **not** mass-generate near-identical "vs" pages. Each must carry real, specific, first-hand info (actual feature/price comparisons, a screenshot, your honest take). Quality over quantity: ~2 genuinely useful articles/week beats 50 thin ones.
- **→ Claude's role:** keyword angle brainstorming, SEO briefs, first drafts in your voice, comparison tables from researched facts, on-page optimization, internal-linking suggestions, repurposing each article into social posts. **You** add the first-hand take, screenshots, and fact-check. (See §10 prompts.)
- **Cost:** $0 (Google Search Console + free keyword tools) to ~$20–30/mo if you add one lightweight keyword tool.
- **KPI:** articles published/week (target 2), then indexed pages, impressions, and signups-from-organic.

### 5.2 Build-in-public (founder brand on X + LinkedIn)

- **Why:** distribution while SEO is cold; people get invested in the journey and convert. LinkedIn personal profiles get ~2.75x the reach of company pages.
- **What to do:** post 3–5x/week — MRR/signups updates, a wedge demo ("watch my coaching page get Google stars in 2 min"), lessons, screenshots of real testimonials customers collected. One "money" post/week is a side-by-side: competitor's hidden-from-Google iframe vs your view-source showing the review text.
- **→ Claude:** turn each shipped article, feature, or metric into a thread/post in your voice; draft hooks; repurpose one idea into both an X thread and a LinkedIn post.
- **Cost:** $0.
- **KPI:** posting consistency, profile views, DMs/replies started, click-throughs to signup.

### 5.3 Community value-giving

- **Why:** coaches concentrate in Skool communities, Facebook groups, a few subreddits (r/coaching, r/Entrepreneur, r/SaaS for peers), and Indie Hackers (for the building story).
- **What to do:** the 9:1 rule — nine genuinely helpful answers for every soft mention. Answer "how do I collect/show testimonials" questions with real help; mention TrustWall only when directly relevant. Post your build-in-public milestones on Indie Hackers. Share a free resource (the templates page) rather than a pitch.
- **→ Claude:** draft helpful, non-spammy replies; summarize a thread's question and propose a value-first answer; adapt one resource into the norms of each community.
- **Cost:** $0 (a Skool community you join may have its own fee; optional).
- **KPI:** helpful posts/week, profile clicks, signups with community as source.

### 5.4 Direct, intent-based outreach + dogfood

- **Why:** fastest path to the *first* 10 users; warm, specific outreach beats cold blasts.
- **What to do:** (a) find people publicly frustrated with competitor pricing or asking "best way to show reviews," and help them (link only if it fits). (b) **Dogfood:** set up your own TrustWall wall and personally ask 10 early users / friendly coaches for a testimonial — this fills your social proof *and* onboards them. (c) Offer to set up the first wall by hand for your first 10 users (white-glove = retention + case studies).
- **→ Claude:** draft personalized (not templated-feeling) DMs from a prospect's public post; write the dogfood request copy; draft white-glove onboarding messages.
- **Cost:** $0; keep it manual and human. **No spam** — CAN-SPAM/EU rules and your own brand depend on it.
- **KPI:** personalized DMs/week, reply rate, users onboarded by hand.

### 5.5 Launch surfaces (timed spike, ~day 60–75)

- **Why:** a concentrated burst of traffic, backlinks, and first reviews once the product and a few testimonials are solid.
- **What to do:** **stagger** across platforms, don't rely on Product Hunt alone (it's saturated and favors big launches). Build a small waitlist first via build-in-public. On PH: launch 12:01am PST, Tue–Thu; reply to every comment within the first 4 hours and keep going 24–48h. Also submit to BetaList, Firsto, and relevant directories for long-tail discovery. Post the problem statement in relevant subreddits and your IH journey.
- **→ Claude:** write the PH tagline/description/first comment, the launch-day X/LinkedIn posts, the "we're live" email, and tailored blurbs per directory.
- **Cost:** $0.
- **KPI:** launch-day signups, backlinks earned, post-launch baseline traffic lift.

### 5.6 Lifecycle email + referral loop (set up once)

- **Why:** email returns ~$36 per $1; onboarding nudges drive the activation metric that everything hinges on. The product's own request-automation is both a feature and your showcase.
- **What to do:** a 3–4 email onboarding sequence — welcome + "collect your first testimonial" → nudge if not activated in 48h → "here's your embed code + see your Google stars" → soft upgrade prompt when they hit the free wall. Dogfood your own automation. Add a light referral ask to happy users.
- **→ Claude:** draft the whole sequence (React Email copy), subject-line A/B variants, and the re-engagement nudge.
- **Cost:** $0 on Resend's free tier at this volume.
- **KPI:** activation rate (free→first testimonial), 48h activation, free→paid.

---

## 6. The 90-day roadmap (phased)

Detailed week-by-week tasks live in `content-calendar.xlsx`. The shape:

**Phase 1 — Foundation (Weeks 1–3): "Get the engine ready."**
Lock messaging & the comparison story. Set up GSC, analytics, X/LinkedIn profiles, a simple content repo. Dogfood: stand up your own wall, collect 5–10 testimonials. Publish the 2 cornerstone pages: "vs Testimonial.to" and "how coaches get Google stars." Write the onboarding email sequence. **Exit criteria:** tracking live, 2 pages published, 5+ own testimonials, sequence sending.

**Phase 2 — Engine + audience (Weeks 4–8): "Show up everywhere, consistently."**
2 articles/week (clusters + comparison/template pages). 3–5 build-in-public posts/week. Daily community value-giving. Begin intent-based DMs (5–10/week) and white-glove onboard the first 10 users. Build the launch waitlist. **Exit criteria:** ~12–16 articles live, first 10–25 signups, first paying customer(s), waitlist started.

**Phase 3 — Launch + scale (Weeks 9–12): "Spike, then compound."**
Staggered launch (PH + BetaList + Firsto + Reddit + IH). Publish launch case studies from your white-glove users ("how [coach] got Google stars in a week"). Double down on whichever Tier-1 channel is converting best; cut what isn't. **Exit criteria:** launch executed, post-launch traffic baseline up, first 5–10 paying customers, a repeatable weekly loop you can sustain.

---

## 7. The repeatable weekly loop (after day 90)

Roughly 6–10 hrs/week, mostly with Claude:

- **2 articles** published (pain-point or comparison/template). *(~3 hrs with Claude drafting)*
- **5 build-in-public posts** across X/LinkedIn. *(~1 hr)*
- **~5 community touchpoints** (genuine help first). *(~1 hr)*
- **~10 personalized DMs** to intent signals. *(~1 hr)*
- **1 case study or customer win** repurposed into content. *(~1 hr)*
- **Weekly review** (§11) + queue next week. *(~30 min)*

Run **one experiment at a time** (a new headline, a new community, a new article angle). Measure, keep or kill.

---

## 8. Claude execution playbook (paste-ready prompts)

This is the "do it with Claude" core. Keep every prompt's anti-fabrication discipline — your marketing must practice what the product preaches (§12). Always fact-check Claude's output before publishing.

**A. SEO content brief**
> "You're an SEO strategist for TrustWall, a testimonial tool for coaches whose wedge is SEO-positive embeds (server-rendered review text + schema.org markup that earns Google star ratings, on the $19 plan vs competitors' $80 tier). Target keyword: `[keyword]`. Give me: search intent, who's searching and why, an outline (H2/H3) that genuinely answers it, the angle only *we* can write from, 3 title options, meta description, and 4 internal-link ideas. Don't write the article yet."

**B. Article draft (in your voice)**
> "Write the article from this brief: [paste brief]. Audience: solo coaches, not technical. Voice: clear, warm, concrete, no hype, no fluff. ~1,200 words. Use real specifics; where you'd need a fact/number/screenshot I should supply, mark it `[FILL: …]`. Never invent stats, customer names, or testimonials. End with one soft CTA to start free."

**C. Comparison page (high-intent, must be genuinely useful)**
> "Draft a 'TrustWall vs Testimonial.to' page for coaches. Use ONLY these verified facts: [paste the §1 table + notes]. Be fair — note where they're stronger. Center the comparison on what a coach actually cares about: Google star ratings, page speed, price, consent/automation. Include a comparison table and an honest 'who should pick which' section. Mark anything you're unsure of as `[VERIFY]`. No fabricated claims."

**D. Build-in-public post / thread**
> "Turn this into (1) an X thread and (2) a LinkedIn post, in a build-in-public founder voice — honest, specific, a little vulnerable, no growth-hacky hype: [paste the update / metric / shipped feature / screenshot description]. Hook in the first line. One clear takeaway. Soft, optional mention of TrustWall."

**E. Community reply (value-first)**
> "Here's a post from [community] asking [paste]. Write a genuinely helpful reply that solves their problem first. Mention TrustWall only if directly relevant, once, as a 'one option' — never salesy. Match the community's casual tone."

**F. Intent-based DM (personalized)**
> "This person publicly posted: [paste]. Write a short, human DM (3–4 sentences) that references their specific situation, offers real help, and only mentions TrustWall if it genuinely fits. No template feel, no pitch energy. Goal is a conversation, not a click."

**G. Onboarding / lifecycle email**
> "Write a [welcome / 48h-nudge / embed-code / soft-upgrade] email for a coach who just signed up free. Goal: get them to collect their first testimonial (our activation metric) / embed it / see Google stars. < 120 words, one CTA, warm and concrete. Give me 2 subject lines."

**H. Niche pivot (when expanding past coaches)**
> "Rewrite this coach-targeted asset for [course creators / consultants]: [paste]. Swap vocabulary, examples, and pain points to fit them. Keep the wedge and structure. Flag anything that no longer applies."

**I. Repurpose 1 → many**
> "From this article [paste/link], give me: 1 X thread, 1 LinkedIn post, 3 short community-answer snippets, and 2 email subject lines. Keep my voice. No fabricated claims or stats."

---

## 9. Budget (target: under $100/month)

| Item | Tool | Monthly |
|---|---|---|
| AI execution engine | **Claude** (your drafting/research/repurposing) | $0–20 |
| Email sending | **Resend** free tier (ample at this volume) | $0 |
| Analytics | **PostHog** / **Plausible** free tier | $0–9 |
| Search data | **Google Search Console** (free) + 1 light keyword tool (optional) | $0–30 |
| Social scheduling | manual or a free-tier scheduler | $0–15 |
| Launch / directories | Product Hunt, BetaList, Firsto, Reddit, Indie Hackers | $0 |
| Buffer | small experiments (one paid test at a time) | ~$15 |
| **Total** | | **~$15–90/mo** |

Everything here is achievable at **$0** if you stay fully organic; the optional tools just save time. The expensive input is your consistency, not cash. Don't add paid ads until you've proven free→paid conversion and have real budget headroom.

---

## 10. Metrics & weekly review

**North-star:** activation = *free users who collected their first testimonial.* Everything ladders to this.

**Track weekly (a simple sheet or PostHog):**

- *Leading (you control):* articles published, build-in-public posts, community touchpoints, personalized DMs, users onboarded by hand.
- *Lagging (results):* signups, **activation rate**, 48-hour activation, free→paid, MRR, organic impressions/clicks (GSC).

**Honest 90-day targets (just-launched, bootstrapped — ranges, not promises):**
- ~12–20 quality articles published & indexed.
- ~50–100 free signups.
- Activation rate climbing toward 40%+.
- First **5–10 paying customers** → roughly **$100–300 MRR**.
- A launch executed and a weekly loop you can sustain solo.

Early on, **judge yourself on the leading indicators** (did you publish, post, and reach out?) — the lagging numbers follow with a lag. Review every Friday: what moved, what didn't, what's the one experiment for next week.

---

## 11. Risks & guardrails

- **Your own marketing must be FTC-clean.** The product's whole trust story is "real proof, never faked." So *never* fabricate your own testimonials, social proof, or metrics. Only show real, consented testimonials (dogfood the consent flow). This isn't just compliance — it's the brand.
- **Google quality update (May 2026).** Thin, templated "vs" pages get penalized now. Keep every page genuinely useful and first-hand. Quality > volume.
- **Channel over-spread.** The classic solo-founder failure mode. Master Tier-1 before adding anything. One experiment at a time.
- **Email law.** Any request/outreach email needs an unsubscribe link + physical address (CAN-SPAM / EU). Stop sequences on unsubscribe. Keep DMs personal and non-spammy.
- **Don't out-source your voice.** Claude drafts; you supply the first-hand take, screenshots, and final edit. AI-on-autopilot content reads generic and won't rank or convert. You are the quality gate.
- **Founder burnout.** 6–10 focused hours/week is sustainable; a heroic month followed by silence is not. Consistency compounds; sprints don't.

---

## 12. The first 7 days (start here)

1. Lock the one-liner and the "vs Testimonial.to" story (§2). *(→ Claude to draft variants)*
2. Set up Google Search Console + analytics; create/clean up X + LinkedIn profiles.
3. Stand up your **own** TrustWall wall and collect 5 real testimonials (dogfood). 
4. Publish cornerstone page #1: **"TrustWall vs Testimonial.to (for coaches)."** *(→ Claude prompt C)*
5. Write the onboarding email sequence and turn it on. *(→ Claude prompt G)*
6. Make your first 5 build-in-public posts and 5 genuine community answers. *(→ Claude prompts D, E)*
7. Open `content-calendar.xlsx` and start Week 1.

---

*This plan is intentionally cheap and Claude-executable. The unfair advantage is a true product wedge (Google stars at $19) plus relentless, consistent, AI-assisted output. Build the loops, publish weekly, help people genuinely — and let the product's own results become your marketing.*
