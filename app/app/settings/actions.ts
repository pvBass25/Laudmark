'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateBrandSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('profiles').update({
    brand_name: (formData.get('brand_name') as string)?.trim() || null,
    brand_color: (formData.get('brand_color') as string) || '#111111',
    niche: (formData.get('niche') as string)?.trim() || 'coach',
  }).eq('id', user.id)

  revalidatePath('/app/settings')
}
