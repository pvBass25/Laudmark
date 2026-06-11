import { redirect } from 'next/navigation'

// Overview has been merged into the combined Walls & Testimonials page
// (its stat cards now sit above the tabs there). Land users on that page.
export default function DashboardPage() {
  redirect('/app/testimonials')
}
