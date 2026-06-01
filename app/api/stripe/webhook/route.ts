import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const PRICE_TO_PLAN: Record<string, 'pro' | 'studio'> = {}

function getPlan(priceId: string): 'free' | 'pro' | 'studio' {
  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO
  const studioPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO
  if (proPriceId && priceId === proPriceId) return 'pro'
  if (studioPriceId && priceId === studioPriceId) return 'studio'
  // Populate cache map at runtime
  return PRICE_TO_PLAN[priceId] ?? 'free'
}

export async function POST(req: NextRequest) {
  const rawBody = await req.arrayBuffer()
  const body = Buffer.from(rawBody)
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break
        const userId = session.metadata?.userId
        if (!userId) break
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        const priceId = sub.items.data[0]?.price.id ?? ''
        await supabase.from('profiles').update({
          plan: getPlan(priceId),
          stripe_customer_id: session.customer as string,
        }).eq('id', userId)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        const priceId = sub.items.data[0]?.price.id ?? ''
        const plan = sub.status === 'active' || sub.status === 'trialing'
          ? getPlan(priceId)
          : 'free'
        await supabase.from('profiles').update({ plan }).eq('stripe_customer_id', customerId)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await supabase.from('profiles')
          .update({ plan: 'free' })
          .eq('stripe_customer_id', sub.customer as string)
        break
      }
    }
  } catch (err) {
    console.error('webhook handler error', event.type, err)
    // Return 200 so Stripe doesn't retry — we log and move on
  }

  return NextResponse.json({ received: true })
}
