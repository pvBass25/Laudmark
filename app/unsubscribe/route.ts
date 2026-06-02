import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Stop every active request sequence to the recipient identified by `token`.
 * The token is the request row's v4 uuid (unguessable), so possession of the
 * link is proof enough to opt out. Idempotent.
 */
async function stopSequence(token: string | null): Promise<'ok' | 'invalid'> {
  if (!token || !UUID.test(token)) return 'invalid'

  const supabase = createServiceClient()
  const { data: row } = await supabase
    .from('requests')
    .select('user_id, recipient_email')
    .eq('id', token)
    .single()

  if (!row) return 'invalid'

  // Full opt-out: stop all active sequences to this recipient from this sender.
  await supabase
    .from('requests')
    .update({ status: 'stopped' })
    .eq('user_id', row.user_id)
    .eq('recipient_email', row.recipient_email)
    .eq('status', 'active')

  return 'ok'
}

// One-click unsubscribe (RFC 8058) — mail clients POST here automatically.
export async function POST(req: NextRequest) {
  await stopSequence(req.nextUrl.searchParams.get('token'))
  return new NextResponse(null, { status: 200 })
}

// Human clicks the link in the email.
export async function GET(req: NextRequest) {
  const result = await stopSequence(req.nextUrl.searchParams.get('token'))
  return new NextResponse(renderPage(result), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function renderPage(result: 'ok' | 'invalid'): string {
  const ok = result === 'ok'
  const heading = ok ? "You're unsubscribed" : 'Link not recognized'
  const message = ok
    ? "You won't receive any more testimonial reminders from this sender."
    : 'This unsubscribe link is invalid or has already been used — you can safely ignore it.'
  const icon = ok ? '✓' : '!'
  const iconBg = ok ? '#F6E8D4' : '#fef2f2'
  const iconColor = ok ? '#A8531B' : '#dc2626'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>${heading} · Trustwall</title>
</head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#FBF8F2;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;">
  <main style="background:#fff;border:1px solid #E9DECB;border-radius:16px;padding:40px;max-width:420px;width:calc(100% - 32px);text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.04);">
    <div style="width:48px;height:48px;border-radius:50%;background:${iconBg};color:${iconColor};font-size:24px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">${icon}</div>
    <h1 style="margin:0 0 10px;font-size:20px;color:#211C16;">${heading}</h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#5E5341;">${message}</p>
  </main>
</body>
</html>`
}
