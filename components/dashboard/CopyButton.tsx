'use client'
import { useState } from 'react'

// Pass `text` for an absolute value (e.g. embed code that lives on external sites),
// or `path` for a link to a page on THIS app (e.g. "/c/slug"). A `path` is resolved
// against the live browser origin at copy time, so it always points at wherever the
// app is actually served — independent of NEXT_PUBLIC_APP_URL / dev port.
export function CopyButton({ text, path, label = 'Copy link' }: { text?: string; path?: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const value = path ? `${window.location.origin}${path}` : (text ?? '')
    if (!value) return
    try {
      // navigator.clipboard only exists in secure contexts (https/localhost).
      // Over a LAN IP it's undefined, so fall back to a hidden textarea + execCommand.
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        const el = document.createElement('textarea')
        el.value = value
        el.style.position = 'fixed'
        el.style.opacity = '0'
        document.body.appendChild(el)
        el.focus()
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked — surface nothing destructive; the user can still select the text.
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-3 py-1.5 rounded-lg bg-subtle text-ink hover:bg-tertiary-soft transition-colors"
    >
      {copied ? '✓ Copied' : label}
    </button>
  )
}
