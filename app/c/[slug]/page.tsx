import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { CollectionForm } from '@/components/collection/CollectionForm'

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createServiceClient()

  // Include collect_rating, but fall back gracefully if migration 0004 hasn't
  // been applied yet (column missing) so the public page never hard-fails.
  let page: {
    id: string
    slug: string
    title: string
    prompt_questions: string[]
    user_id: string
    collect_rating: boolean
  } | null = null

  const withRating = await supabase
    .from('collection_pages')
    .select('id, slug, title, prompt_questions, user_id, collect_rating')
    .eq('slug', slug)
    .single()

  if (withRating.data) {
    page = withRating.data
  } else {
    const base = await supabase
      .from('collection_pages')
      .select('id, slug, title, prompt_questions, user_id')
      .eq('slug', slug)
      .single()
    if (base.data) page = { ...base.data, collect_rating: true }
  }

  if (!page) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('brand_name, brand_logo_url, brand_color')
    .eq('id', page.user_id)
    .single()

  return (
    <CollectionForm
      page={{
        id: page.id,
        slug: page.slug,
        title: page.title,
        prompt_questions: page.prompt_questions,
        collect_rating: page.collect_rating,
      }}
      brand={{
        brand_name: profile?.brand_name ?? null,
        brand_logo_url: profile?.brand_logo_url ?? null,
        brand_color: profile?.brand_color ?? '#111111',
      }}
    />
  )
}
