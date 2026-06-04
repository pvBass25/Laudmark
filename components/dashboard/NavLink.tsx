'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  // Overview ("/app") must match exactly; section links match the section + its subpages.
  const active = href === '/app' ? pathname === '/app' : pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={
        active
          ? 'block rounded-lg px-3 py-2 text-sm font-medium bg-brand/10 text-brand'
          : 'block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors'
      }
    >
      {children}
    </Link>
  )
}
