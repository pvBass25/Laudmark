import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import type { Plan } from '@/lib/plans'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; upgraded?: string; preview?: string }>
}) {
  const { plan: planParam, upgraded, preview } = await searchParams
  const intent = planParam === 'pro' || planParam === 'studio' ? planParam : null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/onboarding${intent ? `?plan=${intent}` : ''}`)}`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('brand_name, brand_color, niche, plan')
    .eq('id', user.id)
    .maybeSingle()

  // `onboarded_at` is added in migration 0005 — fetch it separately and
  // tolerate its absence so the page still works if that migration isn't
  // applied yet (project convention).
  const { data: onboardRow, error: onboardError } = await supabase
    .from('profiles')
    .select('onboarded_at')
    .eq('id', user.id)
    .maybeSingle()
  // ?preview=1 (the dashboard nav link) lets an already-onboarded owner view
  // the wizard without being bounced back to the dashboard.
  if (preview !== '1' && !onboardError && onboardRow?.onboarded_at) {
    // Already onboarded: carry an upgrade intent from the pricing page through
    // to the account page so it can highlight the chosen plan; everything else
    // goes to the dashboard.
    redirect(intent ? `/app/account?plan=${intent}` : '/app')
  }

  const { data: page } = await supabase
    .from('collection_pages')
    .select('slug')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const plan = (profile?.plan ?? 'free') as Plan
  // Resume at the first incomplete step; back from Checkout goes straight to Done.
  const initialStep = upgraded ? 4 : !profile?.brand_name ? 1 : !page ? 2 : 3

  return (
    <main className="min-h-screen bg-canvas py-16 px-6">
      <div className="max-w-xl mx-auto mb-8">
        <span className="font-bold text-ink">LaudMark</span>
      </div>
      <OnboardingWizard
        initialStep={initialStep}
        intent={intent}
        plan={plan}
        upgraded={upgraded === '1'}
        brand={{
          name: profile?.brand_name ?? '',
          color: profile?.brand_color ?? '#111111',
          niche: profile?.niche ?? 'coach',
        }}
        existingPageSlug={page?.slug ?? null}
        proPriceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO}
        studioPriceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO}
      />
    </main>
  )
}
