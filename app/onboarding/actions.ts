'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function saveOnboardingBrand(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const brandName = (formData.get('brand_name') as string)?.trim()
  if (!brandName) throw new Error('Please enter your brand name')

  const { error } = await supabase.from('profiles').update({
    brand_name: brandName,
    brand_color: (formData.get('brand_color') as string) || '#111111',
    niche: (formData.get('niche') as string)?.trim() || 'coach',
  }).eq('id', user.id)
  if (error) throw new Error(error.message)

  revalidatePath('/app/settings')
}

const FirstPageSchema = z.object({
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens'),
  title: z.string().min(1).max(120),
  prompt: z.string().min(1).max(200),
})

// Wizard variant of page creation: returns the slug instead of redirecting so
// the wizard can advance in place. Idempotent — if the user already has a
// page, that page is reused.
export async function createOnboardingPage(formData: FormData): Promise<{ slug: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: existing } = await supabase
    .from('collection_pages')
    .select('slug')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (existing) return { slug: existing.slug }

  const parsed = FirstPageSchema.safeParse({
    slug: formData.get('slug'),
    title: formData.get('title'),
    prompt: formData.get('prompt'),
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { slug, title, prompt } = parsed.data
  const collectRating = formData.get('collectRating') !== null
  const base = { user_id: user.id, slug, title, prompt_questions: [prompt] }

  let { error } = await supabase.from('collection_pages').insert({ ...base, collect_rating: collectRating })
  // If migration 0004 hasn't been applied yet the column is missing — don't block
  // page creation over an optional preference; insert without it (defaults to "on").
  if (error && error.message.includes('collect_rating')) {
    ({ error } = await supabase.from('collection_pages').insert(base))
  }
  if (error) throw new Error(error.message.includes('unique') ? 'That slug is already taken' : error.message)

  revalidatePath('/app/pages')
  return { slug }
}

export async function completeOnboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Upsert (not update) so the stamp still lands if the profile row was never
  // created — an update would match zero rows and silently no-op, leaving the
  // user un-onboarded.
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, email: user.email ?? '', onboarded_at: new Date().toISOString() }, { onConflict: 'id' })
  // Tolerate migration 0005 not being applied yet (project convention) — the
  // user still reaches the dashboard; they may just see the wizard again.
  if (error && !error.message.includes('onboarded_at')) throw new Error(error.message)

  redirect('/app/testimonials')
}
