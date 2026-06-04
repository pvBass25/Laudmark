import Link from 'next/link'

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <Link href="/" className="text-sm text-brand hover:underline mb-8 block">← Trustwall</Link>
      <h1 className="text-3xl font-bold text-ink mb-2">Terms of Service</h1>
      <p className="text-sm text-tertiary mb-8">Last updated: June 2026</p>

      <div className="space-y-6 text-sm text-muted leading-relaxed">
        <section>
          <h2 className="font-semibold text-ink text-base mb-2">1. Acceptance</h2>
          <p>By using Trustwall you agree to these terms. If you do not agree, do not use the service.</p>
        </section>

        <section>
          <h2 className="font-semibold text-ink text-base mb-2">2. Service</h2>
          <p>Trustwall provides tools for collecting, managing, and displaying customer testimonials. We reserve the right to modify or discontinue the service with reasonable notice.</p>
        </section>

        <section>
          <h2 className="font-semibold text-ink text-base mb-2">3. Your responsibilities</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>You must obtain valid consent from testimonial submitters before publishing their content.</li>
            <li>You may not use Trustwall to publish fabricated, incentivised (without disclosure), or deceptive reviews. This is a violation of FTC guidelines and these terms.</li>
            <li>You are responsible for complying with applicable laws in your jurisdiction.</li>
            <li>You may not use the service for spam or unsolicited commercial email.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-ink text-base mb-2">4. AI-generated content</h2>
          <p>Trustwall uses AI to clean and summarise testimonial text. Our system is designed with anti-fabrication rules: the AI may not add praise, facts, or sentiment not present in the original. You remain responsible for reviewing and approving published content.</p>
        </section>

        <section>
          <h2 className="font-semibold text-ink text-base mb-2">5. Billing</h2>
          <p>Paid plans are billed monthly via Stripe. You may cancel at any time; access continues until the end of the billing period. Refunds are handled on a case-by-case basis — contact support@trustwall.app.</p>
        </section>

        <section>
          <h2 className="font-semibold text-ink text-base mb-2">6. Limitation of liability</h2>
          <p>Trustwall is provided "as is". We are not liable for indirect, incidental, or consequential damages. Our total liability is limited to the fees paid in the last 3 months.</p>
        </section>

        <section>
          <h2 className="font-semibold text-ink text-base mb-2">7. Termination</h2>
          <p>We may terminate accounts that violate these terms. You may delete your account at any time, which will permanently delete your data.</p>
        </section>

        <section>
          <h2 className="font-semibold text-ink text-base mb-2">8. Contact</h2>
          <p>Questions? <a href="mailto:support@trustwall.app" className="text-brand hover:underline">support@trustwall.app</a></p>
        </section>
      </div>
    </main>
  )
}
