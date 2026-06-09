'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Sidebar nav link that stays highlighted on the active route so the user
// always knows where they are. Active styling reuses the Harbor active-state
// tokens (bg-accent-soft + text-brand) from STYLEGUIDE.md §6.
// `also` lets one nav item own extra route subtrees (e.g. the combined
// "Testimonials & Walls" item stays active on /app/walls/* too).
export function NavLink({ href, children, also = [] }: { href: string; children: React.ReactNode; also?: string[] }) {
  const pathname = usePathname()
  // /app (Overview) must match exactly; deeper sections match their subtree.
  const isMatch = (p: string) => (p === '/app' ? pathname === '/app' : pathname === p || pathname.startsWith(p + '/'))
  const active = isMatch(href) || also.some(isMatch)

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? 'bg-accent-soft text-brand font-medium'
          : 'text-muted hover:bg-subtle hover:text-ink'
      }`}
    >
      {children}
    </Link>
  )
}
