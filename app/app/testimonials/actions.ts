'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function setTestimonialStatus(id: string, status: 'approved' | 'hidden' | 'pending') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  await supabase
    .from('testimonials')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)
  revalidatePath('/app/testimonials')
  revalidatePath('/app')
}
