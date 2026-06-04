'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next ?? '/app')}`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-ink">Check your inbox</p>
        <p className="text-sm text-muted">We sent a magic link to <strong>{email}</strong>.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg bg-grey10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand text-on-brand text-sm font-medium py-2.5 hover:bg-brand-strong disabled:opacity-50 transition-colors"
      >
        {loading ? 'Sending…' : 'Send magic link'}
      </button>
    </form>
  )
}
