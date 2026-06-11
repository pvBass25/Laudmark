'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreatePageSchema = z.object({
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens'),
  title: z.string().min(1).max(120),
  prompt: z.string().min(1).max(200),
})

export async function createCollectionPage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const parsed = CreatePageSchema.safeParse({
    slug: formData.get('slug'),
    title: formData.get('title'),
    prompt: formData.get('prompt'),
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { slug, title, prompt } = parsed.data
  // Checkbox: present (defaultChecked) → some value; unchecked → absent. Default to collecting.
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
  redirect('/app/pages')
}

export async function setCollectionPageRating(id: string, collectRating: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { error } = await supabase
    .from('collection_pages')
    .update({ collect_rating: collectRating })
    .eq('id', id)
    .eq('user_id', user.id)
  // Swallow only the "column missing" case (migration 0004 not yet applied) so the
  // toggle doesn't hard-fail; any other error should still surface.
  if (error && !error.message.includes('collect_rating')) throw new Error(error.message)
  revalidatePath('/app/pages')
}

export async function deleteCollectionPage(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  await supabase.from('collection_pages').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/app/pages')
}
