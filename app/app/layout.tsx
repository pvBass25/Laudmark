import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavLink } from '@/components/dashboard/NavLink'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="h-screen bg-canvas flex overflow-hidden">
      <aside className="w-56 shrink-0 bg-surface flex flex-col p-4 gap-1 h-screen">
        <span className="text-lg font-bold mb-4 px-2">LaudMark</span>
        <NavLink href="/app">Overview</NavLink>
        <NavLink href="/app/testimonials" also={['/app/walls']}>Testimonials &amp; Walls</NavLink>
        <NavLink href="/app/pages">Collection pages</NavLink>
        <NavLink href="/app/settings">Settings</NavLink>
        <NavLink href="/app/account">Account</NavLink>
        <div className="mt-auto pt-4">
          <a
            href="https://trustwall-app-2026-1cztgala7-trustwall-projects.vercel.app"
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
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
