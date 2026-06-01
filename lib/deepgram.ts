import { DeepgramClient } from '@deepgram/sdk'

const dg = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY! })

export async function transcribe(videoUrl: string): Promise<string> {
  const response = await dg.listen.v1.media.transcribeUrl({
    url: videoUrl,
    model: 'nova-3',
    smart_format: true,
    punctuate: true,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = response as any
  return r?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? ''
}
