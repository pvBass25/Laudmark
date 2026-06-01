import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <Link href="/" className="text-sm text-indigo-600 hover:underline mb-8 block">← Trustwall</Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: June 2026</p>

      <div className="prose prose-gray max-w-none space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">What we collect</h2>
          <p>We collect the information you provide when signing up (email address) and the testimonials submitted by your customers (name, text, video, photo, star rating). We also record consent metadata (boolean, timestamp, IP address) for every testimonial submission, as required by applicable law.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">How we use it</h2>
          <p>Your data is used solely to operate the Trustwall service — storing and displaying testimonials you collect, processing payments, and sending request emails on your behalf. We do not sell or share your data with third parties for marketing purposes.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Third-party processors</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Supabase</strong> — database and authentication (EU region)</li>
            <li><strong>Cloudflare R2</strong> — video and image storage</li>
            <li><strong>Stripe</strong> — payment processing</li>
            <li><strong>Resend</strong> — transactional email</li>
            <li><strong>Anthropic</strong> — AI text processing (server-side only)</li>
            <li><strong>Deepgram</strong> — speech-to-text transcription</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Testimonial submitters (your customers)</h2>
          <p>Testimonials are only published when explicit consent is given at submission time. Consent is stored with a timestamp and IP address. A submitter may request deletion of their testimonial by contacting the business that collected it, or by emailing us at privacy@trustwall.app.</p>
          <p className="mt-2">Deleting a testimonial from Trustwall permanently removes the associated video from storage.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Cookies</h2>
          <p>We use only a session cookie required for authentication. We do not use tracking or advertising cookies.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Your rights (GDPR)</h2>
          <p>If you are located in the EU/EEA, you have the right to access, rectify, or erase your personal data; restrict or object to processing; and data portability. To exercise these rights, email privacy@trustwall.app.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Contact</h2>
          <p>Questions? Email us at <a href="mailto:privacy@trustwall.app" className="text-indigo-600 hover:underline">privacy@trustwall.app</a></p>
        </section>
      </div>
    </main>
  )
}
