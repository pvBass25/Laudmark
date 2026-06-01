import { NextRequest } from 'next/server'

export function captureConsent(req: NextRequest) {
  return {
    consent: true as const,
    consent_ts: new Date().toISOString(),
    consent_ip:
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown',
  }
}
