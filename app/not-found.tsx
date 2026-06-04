import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center px-6 py-20">
      <div className="text-center max-w-md">
        <p className="text-sm font-semibold text-brand mb-3">404</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink mb-3">
          This page doesn&apos;t exist
        </h1>
        <p className="text-muted leading-relaxed mb-8">
          The link may be broken or the page may have been moved. If you were trying to leave a
          testimonial, double-check the link you were given — the collection page you&apos;re looking
          for couldn&apos;t be found.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/"
            className="bg-brand text-on-brand px-6 py-3 rounded-xl font-semibold hover:bg-brand-strong transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/pricing"
            className="bg-subtle text-ink px-6 py-3 rounded-xl font-medium hover:bg-tertiary-soft transition-colors"
          >
            See pricing
          </Link>
        </div>
      </div>
    </main>
  )
}
