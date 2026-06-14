'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteR2Objects } from '@/lib/r2'
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
  if (!z.string().uuid().safeParse(id).success) throw new Error('Invalid page id')

  // The FK cascade removes this page's testimonials with it — capture their
  // ids and stored files first so walls and R2 can be cleaned up afterwards.
  // Abort if this read fails: the page delete below is irreversible, and once
  // the cascade fires we can no longer recover these ids/urls for cleanup.
  const { data: doomed, error: doomedErr } = await supabase
    .from('testimonials')
    .select('id, video_url, author_photo_url')
    .eq('page_id', id)
    .eq('user_id', user.id)
  if (doomedErr) throw new Error(doomedErr.message)

  const { error } = await supabase
    .from('collection_pages')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)

  if (doomed?.length) {
    // walls.testimonial_ids has no FK — strip the deleted ids so wall counts
    // and the curator don't keep referencing testimonials that no longer exist.
    const deletedIds = new Set(doomed.map(t => t.id))
    const { data: walls } = await supabase
      .from('walls')
      .select('id, testimonial_ids')
      .eq('user_id', user.id)
    for (const w of walls ?? []) {
      const ids: string[] = w.testimonial_ids ?? []
      const kept = ids.filter(tid => !deletedIds.has(tid))
      if (kept.length !== ids.length) {
        await supabase.from('walls').update({ testimonial_ids: kept }).eq('id', w.id).eq('user_id', user.id)
      }
    }

    // Purge the deleted testimonials' videos AND author photos from R2 — both
    // are uploaded through the same presigned flow (best-effort, never throws).
    await deleteR2Objects(
      doomed.flatMap(t => [t.video_url, t.author_photo_url]).filter((u): u is string => !!u),
    )
  }

  revalidatePath('/app/pages')
}
