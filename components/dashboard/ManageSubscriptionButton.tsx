'use client'
import { useState } from 'react'
import { createPortalUrl } from '@/app/app/billing/actions'

// Opens the Stripe Billing Portal in a NEW tab. We open a blank tab
// synchronously inside the click (so popup blockers allow it), then point it at
// the portal URL once the server creates the session. Falls back to same-tab if
// the popup was blocked.
export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (loading) return
    setLoading(true)
    const tab = window.open('', '_blank')
    try {
      const url = await createPortalUrl()
      if (tab) tab.location.href = url
      else window.location.href = url
    } catch {
      tab?.close()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 rounded-lg bg-subtle text-ink text-sm hover:bg-tertiary-soft disabled:opacity-50 transition-colors"
    >
      {loading ? 'Opening…' : 'Manage subscription'}
    </button>
  )
}
