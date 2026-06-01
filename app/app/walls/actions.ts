'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createWall(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const name = (formData.get('name') as string)?.trim()
  const layout = (formData.get('layout') as string) || 'grid'
  if (!name) throw new Error('Name is required')

  const { data, error } = await supabase.from('walls').insert({
    user_id: user.id,
    name,
    layout,
  }).select('id').single()

  if (error) throw new Error(error.message)
  revalidatePath('/app/walls')
  redirect(`/app/walls/${data.id}`)
}

export async function updateWall(id: string, testimonialIds: string[], layout: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('walls')
    .update({ testimonial_ids: testimonialIds, layout })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath(`/app/walls/${id}`)
}

export async function deleteWall(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  await supabase.from('walls').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/app/walls')
  redirect('/app/walls')
}
