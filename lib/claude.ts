import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export const MODEL_QUALITY = 'claude-sonnet-4-6'
export const MODEL_FAST = 'claude-haiku-4-5-20251001'

async function jsonCall(model: string, system: string, user: string) {
  const msg = await anthropic.messages.create({
    model,
    max_tokens: 1024,
    system,
    messages: [
      { role: 'user', content: user },
      { role: 'assistant', content: '{' },
    ],
  })
  const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  return JSON.parse('{' + text)
}

export async function polishTestimonial(rawText: string) {
  try {
    return await jsonCall(
      MODEL_QUALITY,
      `You are a careful editor that lightly cleans customer testimonials.
RULES:
1. NEVER add praise, claims, facts, names, numbers, or sentiment not in the original.
2. Keep the customer's voice and first-person perspective.
3. Fix grammar; remove filler ("um","like","you know"), false starts, and repetition.
4. Do not change the meaning or strengthen the opinion.
5. If the input is too short or has no clear point, return it almost unchanged.
6. Output JSON only.`,
      rawText
    ) as { cleaned: string; pull_quote: string; was_edited: boolean }
  } catch {
    return { cleaned: rawText, pull_quote: rawText.slice(0, 80), was_edited: false }
  }
}

export async function extractAssets(transcript: string) {
  try {
    return await jsonCall(
      MODEL_FAST,
      'From this testimonial transcript, extract display assets. Invent nothing. Output JSON only.',
      transcript
    ) as {
      pull_quote: string
      summary: string
      themes: string[]
      suggested_title: string
      captions_vtt: string
    }
  } catch {
    return null
  }
}

export async function generateRequest(opts: {
  niche: string
  tone: string
  channel: string
  link: string
  name: string
}) {
  try {
    return await jsonCall(
      MODEL_FAST,
      `Write a short, warm testimonial request from a ${opts.niche} to a happy client named ${opts.name}.
Tone: ${opts.tone}. Channel: ${opts.channel}. Email body < 90 words; SMS < 2 sentences.
Exactly one clear CTA to ${opts.link}. No salesy fluff. Output JSON only.`,
      'Generate the request.'
    ) as { subject: string; body: string; variant_b: string }
  } catch {
    return null
  }
}

export async function tagTestimonial(text: string) {
  try {
    return await jsonCall(
      MODEL_FAST,
      'Classify this testimonial. Output JSON only.',
      text
    ) as {
      sentiment: 'positive' | 'neutral' | 'mixed'
      themes: string[]
      has_specific_result: boolean
      best_for: 'homepage' | 'pricing_page' | 'social'
    }
  } catch {
    return null
  }
}

export async function suggestFollowup(text: string) {
  try {
    return await jsonCall(
      MODEL_FAST,
      'This testimonial is vague. Suggest ONE specific follow-up question that would surface a concrete result or story. Friendly, one sentence. Output JSON only.',
      text
    ) as { question: string }
  } catch {
    return null
  }
}

export async function translate(text: string, lang: string) {
  try {
    return await jsonCall(
      MODEL_FAST,
      `Translate the testimonial into ${lang}. Preserve voice and meaning. Invent nothing. Output JSON only.`,
      text
    ) as { translated: string; machine_translated: true }
  } catch {
    return null
  }
}

export async function generateQuestions(niche: string) {
  try {
    return await jsonCall(
      MODEL_FAST,
      `For a ${niche}, generate 3 prompt questions that elicit specific, results-focused testimonials. <= 15 words each. Output JSON only.`,
      'Generate the questions.'
    ) as { questions: [string, string, string] }
  } catch {
    return null
  }
}
