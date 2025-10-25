"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function Recorder({
  seconds = 20,
  onRecorded,
}: {
  seconds?: number
  onRecorded: (blob: Blob) => void
}) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recording, setRecording] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [count, setCount] = useState(seconds)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [stream])

  async function start() {
    setPermissionError(null)
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      setStream(media)
      if (videoRef.current) {
        videoRef.current.srcObject = media
        await videoRef.current.play()
      }
      const rec = new MediaRecorder(media, { mimeType: "video/webm;codecs=vp9" })
      recorderRef.current = rec
      chunksRef.current = []
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" })
        const url = URL.createObjectURL(blob)
        setBlobUrl(url)
        onRecorded(blob)
        media.getTracks().forEach((t) => t.stop())
        setStream(null)
      }
      rec.start()
      setRecording(true)
      setCount(seconds)
      timerRef.current = window.setInterval(() => {
        setCount((c) => {
          if (c <= 1) {
            if (recorderRef.current?.state === "recording") recorderRef.current.stop()
            if (timerRef.current) window.clearInterval(timerRef.current)
            setRecording(false)
            return 0
          }
          return c - 1
        })
      }, 1000)
    } catch (e: any) {
      setPermissionError("Camera permission denied or not available.")
    }
  }

  function cancel() {
    if (timerRef.current) window.clearInterval(timerRef.current)
    if (recorderRef.current && recorderRef.current.state === "recording") recorderRef.current.stop()
    stream?.getTracks().forEach((t) => t.stop())
    setRecording(false)
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="grid gap-4 p-6 md:grid-cols-[2fr_1fr]">
        <div className="relative overflow-hidden rounded-lg border">
          <video ref={videoRef} className="aspect-video w-full bg-black/30" muted playsInline />
          {/* Circular face guide */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-40 w-40 rounded-full border border-white/30" aria-hidden />
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            Record for {seconds} seconds while keeping your face centered in the frame.
          </p>

          <div className="mt-3 flex items-center gap-3">
            {!recording ? (
              <Button onClick={start}>Record</Button>
            ) : (
              <Button variant="destructive" onClick={cancel}>
                Cancel
              </Button>
            )}
            <div className="flex-1">
              <Progress value={((seconds - count) / seconds) * 100} className="h-2" />
              <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">
                {recording ? `Recording… ${count}s remaining` : "Ready"}
              </p>
            </div>
          </div>

          {permissionError && (
            <Alert variant="destructive" className="mt-3">
              <AlertTitle>Camera Error</AlertTitle>
              <AlertDescription>{permissionError}</AlertDescription>
            </Alert>
          )}

          {blobUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium">Preview</p>
              <video className="mt-2 aspect-video w-full rounded border" src={blobUrl} controls />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
