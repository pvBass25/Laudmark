import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight max-w-xl">
        Collect video + text testimonials with one link
      </h1>
      <p className="text-lg text-gray-500 max-w-lg">
        Show them in a fast widget that boosts your Google ranking instead of slowing your site.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Get started free
        </Link>
        <Link
          href="/pricing"
          className="rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Pricing
        </Link>
      </div>
    </main>
  )
}
