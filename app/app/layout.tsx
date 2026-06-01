import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col p-4 gap-1">
        <span className="text-lg font-bold mb-4 px-2">Trustwall</span>
        <NavLink href="/app">Overview</NavLink>
        <NavLink href="/app/testimonials">Testimonials</NavLink>
        <NavLink href="/app/pages">Collection pages</NavLink>
        <NavLink href="/app/walls">Walls</NavLink>
        <NavLink href="/app/settings">Settings</NavLink>
        <NavLink href="/app/billing">Billing</NavLink>
        <div className="mt-auto pt-4 border-t border-gray-100">
          <form action="/auth/signout" method="post">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
              Sign out
            </button>
          </form>
          <p className="px-3 pt-2 text-xs text-gray-300 truncate">{user.email}</p>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
    >
      {children}
    </Link>
  )
}
