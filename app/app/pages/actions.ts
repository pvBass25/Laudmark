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
  const { error } = await supabase.from('collection_pages').insert({
    user_id: user.id,
    slug,
    title,
    prompt_questions: [prompt],
  })
  if (error) throw new Error(error.message.includes('unique') ? 'That slug is already taken' : error.message)
  revalidatePath('/app/pages')
  redirect('/app/pages')
}

export async function deleteCollectionPage(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  await supabase.from('collection_pages').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/app/pages')
}
