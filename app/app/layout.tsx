import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavLink } from '@/components/dashboard/NavLink'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // New accounts go through the setup wizard first. `onboarded_at` is added in
  // migration 0005 — tolerate its absence (project convention) so the
  // dashboard never breaks or redirect-loops if that migration isn't applied.
  const { data: onboardRow, error: onboardError } = await supabase
    .from('profiles')
    .select('onboarded_at')
    .eq('id', user.id)
    .maybeSingle()
  if (!onboardError && onboardRow && !onboardRow.onboarded_at) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 w-56 bg-surface flex flex-col p-4 gap-1">
        <span className="text-lg font-bold mb-4 px-2">LaudMark</span>
        <NavLink href="/app/testimonials" also={['/app/walls']}>Walls &amp; Testimonials</NavLink>
        <NavLink href="/app/pages">Collection Pages</NavLink>
        <NavLink href="/app/settings">Settings</NavLink>
        <NavLink href="/app/account">Account</NavLink>
        <div className="mt-auto pt-4">
          <a
            href="/onboarding?preview=1"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-subtle hover:text-ink transition-colors"
          >
            Onboarding flow ↗
          </a>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-subtle hover:text-ink transition-colors"
          >
            View LM Marketing ↗
          </a>
          <a
            href="/demo"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-subtle hover:text-ink transition-colors"
          >
            Demo site ↗
          </a>
          <NavLink href="/app/styleguide">Style guide</NavLink>
          <form action="/auth/signout" method="post">
            <button className="w-full text-left px-3 py-2 text-sm text-muted hover:text-ink rounded-lg hover:bg-subtle transition-colors">
              Sign out
            </button>
          </form>
          <p className="px-3 pt-2 text-xs text-tertiary truncate">{user.email}</p>
        </div>
      </aside>
      <main className="ml-56 p-8">{children}</main>
    </div>
  )
}
