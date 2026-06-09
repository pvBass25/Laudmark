'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const COOKIE_NAME = 'tw_consent'

function hasConsent(): boolean {
  return document.cookie.split('; ').some(c => c.startsWith(`${COOKIE_NAME}=`))
}

export function CookieBanner() {
  // Start hidden so SSR renders nothing — decide on the client after we can read
  // the cookie, which avoids a hydration flash and never shows it twice.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!hasConsent()) setVisible(true)
  }, [])

  function accept() {
    // 1 year, site-wide. Lax is fine — this isn't a cross-site cookie.
    document.cookie = `${COOKIE_NAME}=1; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie notice"
      className="fixed bottom-4 inset-x-4 z-50 mx-auto max-w-2xl rounded-2xl bg-surface shadow-card-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
    >
      <p className="text-sm text-muted leading-relaxed flex-1">
        We use essential cookies to keep you signed in and run the site. We don&apos;t use
        tracking or advertising cookies. See our{' '}
        <Link href="/privacy" className="text-brand font-medium hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
      <button
        onClick={accept}
        className="shrink-0 bg-brand text-on-brand text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-strong transition-colors"
      >
        Got it
      </button>
    </div>
  )
}
