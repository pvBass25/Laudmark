import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect(next ?? '/app')

  return (
    <div className="min-h-screen flex items-center justify-center bg-subtle">
      <div className="w-full max-w-sm space-y-6 p-8 bg-surface rounded-2xl shadow-sm border border-line">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight leading-[48px]">Trustwall</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in with your email — we&apos;ll send a magic link.</p>
        </div>
        <LoginForm next={next} />
      </div>
    </div>
  )
}
