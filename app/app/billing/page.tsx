import { redirect } from 'next/navigation'

// Billing now lives on the Account page (Profile · Plan & billing · Session).
// Keep this route as a redirect so old links, bookmarks, and Stripe return URLs work.
export default function BillingPage() {
  redirect('/app/account')
}
