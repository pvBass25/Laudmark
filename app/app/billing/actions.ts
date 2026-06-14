'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

// `returnTo` is the in-app path (no query string) the user comes back to after
// Checkout — e.g. '/onboarding' from the wizard. Defaults to the account page.
export async function createCheckoutSession(priceId: string, returnTo: string = '/app/account') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // When invoked via a <form> with only priceId bound, the FormData lands in
  // this parameter — and server actions are reachable by direct POST — so only
  // accept a real in-app path.
  if (typeof returnTo !== 'string' || !returnTo.startsWith('/') || returnTo.startsWith('//')) {
    returnTo = '/app/account'
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    ...(profile?.stripe_customer_id
      ? { customer: profile.stripe_customer_id }
      : { customer_email: user.email ?? undefined }),
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}${returnTo}?upgraded=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}${returnTo}`,
    metadata: { userId: user.id },
  })

  redirect(session.url!)
}

const PLAN_RANK = { free: 0, pro: 1, studio: 2 } as const

function planForPrice(priceId: string): 'pro' | 'studio' | null {
  if (priceId && priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO) return 'pro'
  if (priceId && priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO) return 'studio'
  return null
}

// The customer's one live subscription (active/trialing/past_due), or null.
async function getLiveSubscription(customerId: string) {
  const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 10 })
  return subs.data.find(s => ['active', 'trialing', 'past_due'].includes(s.status)) ?? null
}

// Switches the EXISTING subscription to a different price (Pro ↔ Studio) with
// proration — never creates a second subscription via Checkout. Used for both
// the Pro → Studio upgrade and the Studio → Pro downgrade.
export async function changeSubscriptionPrice(priceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const targetPlan = planForPrice(priceId)
  if (!targetPlan) throw new Error('Unknown price')

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, plan')
    .eq('id', user.id)
    .single()
  if (!profile?.stripe_customer_id) throw new Error('No active subscription')

  const sub = await getLiveSubscription(profile.stripe_customer_id)
  if (!sub) throw new Error('No active subscription')

  await stripe.subscriptions.update(sub.id, {
    items: [{ id: sub.items.data[0].id, price: priceId }],
    proration_behavior: 'create_prorations',
    cancel_at_period_end: false,
  })

  // The webhook (customer.subscription.updated) is the source of truth, but
  // set the plan now too so the account page is correct on the very next render.
  // Only grant it optimistically for a paid-up subscription — mirror the
  // webhook, which forces a past_due (dunning) subscription back to free. This
  // avoids briefly re-granting paid features to a delinquent account.
  if (sub.status === 'active' || sub.status === 'trialing') {
    await supabase.from('profiles').update({ plan: targetPlan }).eq('id', user.id)
  }

  const currentPlan = (profile.plan ?? 'free') as keyof typeof PLAN_RANK
  const isUpgrade = PLAN_RANK[targetPlan] > PLAN_RANK[currentPlan]
  redirect(isUpgrade ? '/app/account?upgraded=1' : `/app/account?changed=${targetPlan}`)
}

// Downgrade to Free: cancel at period end. Paid features stay on until the
// period ends; Stripe then sends customer.subscription.deleted and the webhook
// sets plan='free'.
export async function cancelSubscription() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()
  if (!profile?.stripe_customer_id) throw new Error('No active subscription')

  const sub = await getLiveSubscription(profile.stripe_customer_id)
  if (!sub) throw new Error('No active subscription')

  await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true })
  redirect('/app/account?changed=cancel')
}

// Undo a pending cancellation while the paid period is still running.
export async function resumeSubscription() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()
  if (!profile?.stripe_customer_id) throw new Error('No active subscription')

  const sub = await getLiveSubscription(profile.stripe_customer_id)
  if (!sub) throw new Error('No active subscription')

  await stripe.subscriptions.update(sub.id, { cancel_at_period_end: false })
  redirect('/app/account?changed=resumed')
}

// Returns the Stripe Billing Portal URL (instead of redirecting) so the client
// can open it in a new tab.
export async function createPortalUrl(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) throw new Error('No active subscription')

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/account`,
  })

  return session.url
}
