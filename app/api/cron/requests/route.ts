import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateRequest } from '@/lib/claude'
import { sendRequestEmail } from '@/lib/email'
import { PLANS } from '@/lib/plans'

// Vercel Cron (see vercel.json). Daily at 14:00 UTC — the Hobby plan allows
// once-daily cron, which is plenty since request steps are spaced 3 and 7 days
// apart. On Pro you can raise this to hourly ("0 * * * *") for faster first nudges.

const STEP_DELAYS_DAYS = [3, 7] // after step 0 → +3d; after step 1 → +7d

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const { data: due, error } = await supabase
    .from('requests')
    .select(`
      id, user_id, page_id, recipient_email, recipient_name, sequence_step,
      collection_pages!inner(slug, prompt_questions),
      profiles!inner(niche, brand_name, plan)
    `)
    .eq('status', 'active')
    .lte('scheduled_at', new Date().toISOString())
    .limit(50)

  if (error) {
    console.error('cron fetch error', error)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  if (!due?.length) return NextResponse.json({ processed: 0 })

  let processed = 0
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://trustwall.app'

  for (const req_item of due) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = req_item.profiles as any
    const page = req_item.collection_pages as any
    const plan = (profile?.plan ?? 'free') as keyof typeof PLANS

    if (!PLANS[plan].automation) {
      // Downgraded — stop the sequence
      await supabase.from('requests').update({ status: 'stopped' }).eq('id', req_item.id)
      continue
    }

    const link = `${appUrl}/c/${page.slug}`
    const name = req_item.recipient_name ?? 'there'

    try {
      // Generate email copy via Claude
      const generated = await generateRequest({
        niche: profile?.niche ?? 'coach',
        tone: 'warm',
        channel: 'email',
        link,
        name,
      })

      const subject = generated?.subject ?? `Could you share a quick testimonial?`
      const bodyText = generated?.body ?? `Hi ${name},\n\nWould you be willing to share a quick testimonial? It would mean a lot.\n\n${link}\n\nThank you!`

      // The request id is an unguessable v4 uuid → safe to use as the opt-out token.
      const unsubscribeUrl = `${appUrl}/unsubscribe?token=${req_item.id}`

      await sendRequestEmail({ to: req_item.recipient_email, subject, bodyText, link, unsubscribeUrl })

      // Advance or complete the sequence
      const nextStep = req_item.sequence_step + 1
      if (nextStep > 2) {
        await supabase.from('requests').update({ status: 'done' }).eq('id', req_item.id)
      } else {
        const delayDays = STEP_DELAYS_DAYS[req_item.sequence_step] ?? 7
        const nextDate = new Date()
        nextDate.setDate(nextDate.getDate() + delayDays)
        await supabase.from('requests').update({
          sequence_step: nextStep,
          scheduled_at: nextDate.toISOString(),
        }).eq('id', req_item.id)
      }

      processed++
    } catch (err) {
      console.error('cron: failed to process request', req_item.id, err)
    }
  }

  return NextResponse.json({ processed })
}
