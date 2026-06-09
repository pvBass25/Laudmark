import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!)
  return _resend
}
const FROM = () => process.env.RESEND_FROM ?? 'LaudMark <hello@trustwall.app>'
// CAN-SPAM / EU law require a valid physical postal address in marketing email.
const POSTAL_ADDRESS = () => process.env.COMPANY_ADDRESS ?? 'LaudMark · [your business postal address]'

function baseHtml(body: string, unsubscribeNote?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F4F0;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F0;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:32px;max-width:600px;width:100%;box-shadow:0 1px 2px rgba(28,32,31,.05), 0 4px 12px rgba(28,32,31,.06);">
        <tr><td style="color:#565B56;font-size:15px;line-height:1.7;">
          ${body}
        </td></tr>
        ${unsubscribeNote ? `
        <tr><td style="padding-top:24px;margin-top:24px;font-size:12px;color:#5F635D;">
          ${unsubscribeNote}
        </td></tr>` : ''}
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendRequestEmail(opts: {
  to: string
  subject: string
  bodyText: string
  link: string
  unsubscribeUrl: string
}) {
  const bodyHtml = opts.bodyText
    .split('\n')
    .map(line => line.trim() ? `<p style="margin:0 0 12px;">${line}</p>` : '')
    .join('')

  const html = baseHtml(
    `${bodyHtml}
     <p style="margin:16px 0 0;">
       <a href="${opts.link}" style="display:inline-block;background:#3C5A54;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
         Leave a testimonial →
       </a>
     </p>`,
    `You received this because you\'re a customer.
     <a href="${opts.unsubscribeUrl}" style="color:#3C5A54;">Unsubscribe</a> to stop these reminders.
     <br/><span style="color:#5F635D;">${POSTAL_ADDRESS()}</span>`
  )

  return getResend().emails.send({
    from: FROM(),
    to: opts.to,
    subject: opts.subject,
    html,
    text:
      opts.bodyText +
      `\n\nLeave a testimonial: ${opts.link}` +
      `\n\n—\nUnsubscribe from these reminders: ${opts.unsubscribeUrl}\n${POSTAL_ADDRESS()}`,
    headers: {
      // One-click unsubscribe support for Gmail/Apple Mail (RFC 8058 / 2369).
      'List-Unsubscribe': `<${opts.unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  })
}

export async function sendApprovedEmail(opts: {
  to: string
  authorName: string
  brandName: string
}) {
  const html = baseHtml(`
    <h2 style="margin:0 0 16px;font-size:20px;color:#1C201F;">Thank you, ${opts.authorName}! 🙏</h2>
    <p style="margin:0 0 12px;">Your testimonial for <strong>${opts.brandName}</strong> has been approved and is now live.</p>
    <p style="margin:0;color:#565B56;font-size:14px;">We really appreciate you taking the time to share your experience.</p>
  `)

  return getResend().emails.send({
    from: FROM(),
    to: opts.to,
    subject: `Your testimonial is live! 🎉`,
    html,
  })
}
