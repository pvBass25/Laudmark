import { redirect } from 'next/navigation'

// Walls now live on the combined "Testimonials & Walls" page. Keep this route as
// a redirect so old links and bookmarks still work.
export default function WallsPage() {
  redirect('/app/testimonials')
}
