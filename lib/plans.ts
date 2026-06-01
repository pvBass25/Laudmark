export const PLANS = {
  free: {
    maxTestimonials: 20,
    brandingFooter: true,
    seoEmbed: false,
    automation: false,
    aiEditing: false,
    brands: 1,
  },
  pro: {
    maxTestimonials: Infinity,
    brandingFooter: false,
    seoEmbed: true,
    automation: true,
    aiEditing: false,
    brands: 1,
  },
  studio: {
    maxTestimonials: Infinity,
    brandingFooter: false,
    seoEmbed: true,
    automation: true,
    aiEditing: true,
    brands: 5,
  },
} as const

export type Plan = keyof typeof PLANS
