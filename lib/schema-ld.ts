interface Testimonial {
  author_name: string
  rating?: number | null
  clean_text?: string | null
  raw_text?: string | null
}

export function buildJsonLd(brandName: string, items: Testimonial[]) {
  const rated = items.filter((i) => i.rating)
  const avg = rated.length
    ? (rated.reduce((s, i) => s + (i.rating ?? 0), 0) / rated.length).toFixed(1)
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: brandName,
    ...(avg && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avg,
        reviewCount: String(rated.length),
      },
    }),
    review: items.slice(0, 20).map((i) => ({
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: String(i.rating ?? 5) },
      author: { '@type': 'Person', name: i.author_name },
      reviewBody: i.clean_text ?? i.raw_text ?? '',
    })),
  }
}
