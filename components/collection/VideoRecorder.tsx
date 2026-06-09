'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
  slug: string
  brandColor: string
  onComplete: (videoUrl: string) => void
}

type RecorderState = 'init' | 'idle' | 'recording' | 'preview' | 'uploading' | 'error'

function getSupportedMimeType() {
  const candidates = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4']
  return candidates.find(t => MediaRecorder.isTypeSupported(t)) ?? 'video/mp4'
}

export function VideoRecorder({ slug, brandColor, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [recorderState, setRecorderState] = useState<RecorderState>('init')
  const [countdown, setCountdown] = useState(60)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const stopTick = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
  }, [])

  const attachStreamToVideo = useCallback((stream: MediaStream) => {
    if (!videoRef.current) return
    videoRef.current.srcObject = stream
    videoRef.current.src = ''
    videoRef.current.muted = true
    videoRef.current.controls = false
  }, [])

  const startStream = useCallback(async () => {
    setRecorderState('init')
    setErrorMsg(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      })
      streamRef.current = stream
      attachStreamToVideo(stream)
      setRecorderState('idle')
    } catch {
      setErrorMsg('Camera access was denied. Please allow camera access and try again.')
      setRecorderState('error')
    }
  }, [attachStreamToVideo])

  useEffect(() => {
    startStream()
    return () => {
      stopTick()
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startRecording = useCallback(() => {
    const stream = streamRef.current
    if (!stream) return
    chunksRef.current = []
    const mimeType = getSupportedMimeType()
    const mr = new MediaRecorder(stream, { mimeType })
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType })
      const url = URL.createObjectURL(blob)
      setRecordedBlob(blob)
      setPreviewUrl(url)
      if (videoRef.current) {
        videoRef.current.srcObject = null
        videoRef.current.src = url
        videoRef.current.muted = false
        videoRef.current.controls = true
      }
      setRecorderState('preview')
    }
    mr.start()
    mediaRecorderRef.current = mr
    setCountdown(60)
    setRecorderState('recording')
    tickRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          stopTick()
          mr.stop()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [stopTick])

  const stopRecording = useCallback(() => {
    stopTick()
    mediaRecorderRef.current?.stop()
  }, [stopTick])

  const reRecord = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setRecordedBlob(null)
    const stream = streamRef.current
    if (stream) {
      attachStreamToVideo(stream)
    }
    setRecorderState('idle')
  }, [previewUrl, attachStreamToVideo])

  const upload = useCallback(async () => {
    if (!recordedBlob) return
    setRecorderState('uploading')
    setErrorMsg(null)
    const mimeType = recordedBlob.type
    try {
      const urlRes = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, contentType: mimeType }),
      })
      if (!urlRes.ok) throw new Error('Failed to get upload URL')
      const { uploadUrl, publicUrl } = await urlRes.json() as { uploadUrl: string; publicUrl: string }
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': mimeType },
        body: recordedBlob,
      })
      if (!putRes.ok) throw new Error('Upload failed')
      streamRef.current?.getTracks().forEach(t => t.stop())
      onComplete(publicUrl)
    } catch {
      setErrorMsg('Upload failed. Please try again.')
      setRecorderState('preview')
    }
  }, [recordedBlob, slug, onComplete])

  if (recorderState === 'error') {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-red-700 text-sm">{errorMsg}</p>
        <button onClick={startStream} className="px-4 py-2 rounded-lg bg-subtle text-ink text-sm hover:bg-tertiary-soft transition-colors">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: '4/3', maxHeight: '320px' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {recorderState === 'recording' && (
          <>
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-xs font-medium">REC</span>
            </div>
            <div className="absolute top-3 right-3 bg-black/60 text-white text-sm px-2 py-1 rounded-full tabular-nums">
              {countdown}s
            </div>
          </>
        )}
        {recorderState === 'init' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/60 text-sm">Starting camera…</span>
          </div>
        )}
      </div>

      {recorderState === 'idle' && (
        <button
          onClick={startRecording}
          style={{ backgroundColor: brandColor }}
          className="w-full py-3 rounded-lg text-on-brand font-semibold text-base"
        >
          Start recording
        </button>
      )}

      {recorderState === 'recording' && (
        <button
          onClick={stopRecording}
          className="w-full py-3 rounded-lg bg-red-500 text-white font-semibold text-base"
        >
          Stop recording
        </button>
      )}

      {recorderState === 'preview' && (
        <div className="space-y-2">
          {errorMsg && <p className="text-red-700 text-sm text-center">{errorMsg}</p>}
          <div className="flex gap-3">
            <button
              onClick={reRecord}
              className="flex-1 py-3 rounded-lg bg-subtle text-ink font-medium hover:bg-tertiary-soft transition-colors"
            >
              Re-record
            </button>
            <button
              onClick={upload}
              style={{ backgroundColor: brandColor }}
              className="flex-1 py-3 rounded-lg text-on-brand font-semibold"
            >
              Use this
            </button>
          </div>
        </div>
      )}

      {recorderState === 'uploading' && (
        <div className="w-full py-3 rounded-xl bg-gray-100 text-gray-500 text-center text-sm">
          Uploading…
        </div>
      )}
    </div>
  )
}
