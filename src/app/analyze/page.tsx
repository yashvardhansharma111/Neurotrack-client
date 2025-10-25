"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Recorder } from "@/components/recorder"
import { SettingsPanel, type SettingsState } from "@/components/settings-panel"
import { ResultsSummary } from "@/components/results-summary"
import { TopEmotions } from "@/components/top-emotions"
import { WindowsTable } from "@/components/windows-table"
import { EmotionHeat } from "@/components/emotion-heat"
import type { AnalyzeResponse } from "@/types/analyze"
import { Info } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000"
const MAX_FILE_MB = 100

export default function AnalyzePage() {
  const { addToast } = useToast()

  const [settings, setSettings] = useState<SettingsState>({
    sampleEvery: 2,
    conf: 0.25,
    maxFaces: 1,
    returnBoxes: false,
    smoothK: 1,
    topk: 3,
    minFaceSize: 20,
  })

  const [file, setFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [rawJsonOpen, setRawJsonOpen] = useState(false)

  const onFileSelected = useCallback((f: File | null) => {
    setFile(f)
    setUploadError(null)
    setResult(null)
  }, [])

  const validateFile = (f: File | null) => {
    if (!f) return "Please choose a video file."
    if (!f.type.startsWith("video/")) return "Only video files are allowed."
    const sizeMB = f.size / (1024 * 1024)
    if (sizeMB > MAX_FILE_MB) return `File too large. Max ${MAX_FILE_MB}MB.`
    return null
  }

  const runAnalysis = useCallback(
    async (inputFile: File | null) => {
      const err = validateFile(inputFile)
      if (err) {
        setUploadError(err)
        addToast({ title: "Invalid file", description: err, type: "error" })
        return
      }

      if (!inputFile) return
      setLoading(true)
      setUploadProgress(0)
      setResult(null)

      const fd = new FormData()
      fd.append("file", inputFile)
      fd.append("sample_every_s", String(settings.sampleEvery))
      fd.append("conf", String(settings.conf))
      fd.append("maxFaces", String(settings.maxFaces))
      fd.append("return_boxes", settings.returnBoxes ? "1" : "0")
      fd.append("smooth_k", String(settings.smoothK))
      fd.append("topk", String(settings.topk))
      fd.append("min_face_size", String(settings.minFaceSize))

      try {
        const resJson = await new Promise<AnalyzeResponse>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open("POST", `${API_BASE}/analyze-video`)
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100))
            }
          }
          xhr.onload = () => {
            try {
              const data = JSON.parse(xhr.responseText)
              if (xhr.status >= 200 && xhr.status < 300) resolve(data)
              else reject(new Error(data?.message || "Analysis failed"))
            } catch (e) {
              reject(new Error("Invalid JSON response"))
            }
          }
          xhr.onerror = () => reject(new Error("Network error"))
          xhr.send(fd)
        })

        setResult(resJson)
        addToast({ title: "Analysis complete", description: "Results ready." })
      } catch (e: any) {
        const msg = e?.message || "Failed to analyze video"
        setUploadError(msg)
        addToast({ title: "Error", description: msg, type: "error" })
      } finally {
        setLoading(false)
        setUploadProgress(0)
      }
    },
    [settings, addToast],
  )

  // For Record tab: receive blob and auto-run
  const onRecorded = useCallback(
    (blob: Blob) => {
      const f = new File([blob], "recording.webm", { type: blob.type || "video/webm" })
      setFile(f)
      runAnalysis(f)
    },
    [runAnalysis],
  )

  const envBadge = useMemo(
    () =>
      API_BASE.startsWith("http://127.0.0.1") || API_BASE.startsWith("http://localhost") ? "Local API" : "Remote API",
    [],
  )

  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Analyze</h1>
            <p className="text-sm text-muted-foreground">Upload a 20s face video or record directly in the browser.</p>
          </div>
          <Badge variant="outline" title={`API Base: ${API_BASE}`}>
            {envBadge}
          </Badge>
        </div>

        <Card className="mb-6 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle>Analysis Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsPanel value={settings} onChange={setSettings} />
            <p className="mt-2 text-xs text-muted-foreground">
              Base URL: {API_BASE} • Change via NEXT_PUBLIC_API_BASE environment variable.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="upload" className="mb-6">
          <TabsList>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="record">Record</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <UploadCard
              file={file}
              onFileSelected={onFileSelected}
              onRun={() => runAnalysis(file)}
              loading={loading}
              progress={uploadProgress}
            />
          </TabsContent>

          <TabsContent value="record" className="mt-4">
            <Recorder seconds={20} onRecorded={onRecorded} />
          </TabsContent>
        </Tabs>

        {uploadError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Upload Error</AlertTitle>
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <Card className="mb-6 rounded-2xl">
            <CardContent className="p-6">
              <div className="mb-2 flex items-center gap-2">
                <Info className="size-4" />
                <p className="text-sm">Uploading and analyzing...</p>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-6">
            <ResultsSummary data={result} />
            <TopEmotions data={result} />
            <WindowsTable data={result} />
            <EmotionHeat data={result} />
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle>Raw JSON</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <Button variant="outline" onClick={() => setRawJsonOpen((v) => !v)}>
                    {rawJsonOpen ? "Hide JSON" : "View JSON"}
                  </Button>
                </div>
                {rawJsonOpen && (
                  <pre className="max-h-[400px] overflow-auto rounded-lg bg-muted p-3 text-xs">
                    <code>{JSON.stringify(result, null, 2)}</code>
                  </pre>
                )}
              </CardContent>
            </Card>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => runAnalysis(file)} disabled={!file || loading}>
                Rerun
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null)
                  setResult(null)
                  setUploadError(null)
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

function UploadCard({
  file,
  onFileSelected,
  onRun,
  loading,
  progress,
}: {
  file: File | null
  onFileSelected: (f: File | null) => void
  onRun: () => void
  loading: boolean
  progress: number
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (file && videoRef.current) {
      const url = URL.createObjectURL(file)
      videoRef.current.src = url
      videoRef.current.onloadeddata = () => URL.revokeObjectURL(url)
    }
  }, [file])

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-6">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const f = e.dataTransfer.files?.[0]
            onFileSelected(f ?? null)
          }}
          className={[
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center",
            dragOver ? "border-primary" : "border-border",
          ].join(" ")}
          onClick={() => inputRef.current?.click()}
          role="button"
          aria-label="Upload video"
        >
          <p className="text-sm">
            Drag & drop your video here, or <span className="text-primary">choose a file</span>
          </p>
          <p className="text-xs text-muted-foreground">We accept video/* up to {MAX_FILE_MB}MB.</p>
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
          />
        </div>

        {file && (
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_2fr]">
            <div>
              <p className="text-sm font-medium">Selected File</p>
              <p className="text-xs text-muted-foreground break-all">
                {file.name} • {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <div className="mt-2">
                <Button variant="outline" onClick={() => onFileSelected(null)} disabled={loading}>
                  Remove
                </Button>
              </div>
            </div>
            <div className="rounded-lg border p-2">
              <video ref={videoRef} className="h-40 w-full rounded object-contain" controls />
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <Button onClick={onRun} disabled={!file || loading}>
            Run Analysis
          </Button>
          {loading && (
            <div className="flex min-w-40 items-center gap-2">
              <Progress value={progress} className="h-2 w-40" />
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
