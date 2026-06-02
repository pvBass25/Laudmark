'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendApprovedEmail } from '@/lib/email'

export async function setTestimonialStatus(id: string, status: 'approved' | 'hidden' | 'pending') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Read current row first so we can (a) detect a real pending→approved transition
  // and (b) get the author's email/name for the thank-you notification.
  const { data: before } = await supabase
    .from('testimonials')
    .select('status, author_name, author_email')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  await supabase
    .from('testimonials')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)

  // Fire the "your testimonial is live" email only on the first approval, and only
  // if the author left an email. Best-effort — a mail failure must never block approval.
  if (status === 'approved' && before && before.status !== 'approved' && before.author_email) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('brand_name')
        .eq('id', user.id)
        .single()
      await sendApprovedEmail({
        to: before.author_email,
        authorName: before.author_name,
        brandName: profile?.brand_name ?? 'us',
      })
    } catch (err) {
      console.error('approved email failed for', id, err)
    }
  }

  revalidatePath('/app/testimonials')
  revalidatePath('/app')
}

export async function updateTestimonial(
  id: string,
  fields: { clean_text: string; pull_quote: string },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  await supabase
    .from('testimonials')
    .update({
      clean_text: fields.clean_text.trim() || null,
      pull_quote: fields.pull_quote.trim() || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
  revalidatePath('/app/testimonials')
  revalidatePath('/app')
}
