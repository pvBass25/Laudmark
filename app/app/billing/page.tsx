import { redirect } from 'next/navigation'

// Billing now lives in the combined Settings page (Profile · Brand · Plan & billing).
// Keep this route as a redirect so old links, bookmarks, and Stripe return URLs work.
export default function BillingPage() {
  redirect('/app/settings')
}
