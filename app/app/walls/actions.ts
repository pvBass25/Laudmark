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

// Like createWall, but returns the new id instead of redirecting — used by the
// combined Testimonials & Walls page so it can create a wall and select it
// inline without leaving the page.
export async function createWallNamed(name: string, layout: string): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const trimmed = name.trim()
  if (!trimmed) throw new Error('Name is required')

  const { data, error } = await supabase.from('walls').insert({
    user_id: user.id,
    name: trimmed,
    layout,
  }).select('id').single()

  if (error) throw new Error(error.message)
  revalidatePath('/app/testimonials')
  return data.id
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
  revalidatePath(`/wall/${id}`)
  revalidatePath('/app/testimonials')
  revalidatePath('/demo')
}

// Layout-only update — used by the owner's auto-save layout switcher on the
// public wall preview page. Owner-scoped (eq user_id); revalidates the preview
// page and the dashboard so the change is applied everywhere.
export async function setWallLayout(id: string, layout: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('walls')
    .update({ layout })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath(`/wall/${id}`)
  revalidatePath(`/app/walls/${id}`)
  revalidatePath('/app/testimonials')
}

export async function deleteWall(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  await supabase.from('walls').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/app/walls')
  redirect('/app/walls')
}
