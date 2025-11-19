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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"
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
      API_BASE.startsWith("http://127.0.0.1") || API_BASE.startsWith("http://localhost:8000") ? "Local API" : "Remote API",
    [],
  )

  return (
    <div className="min-h-dvh flex flex-col bg-black">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Video Analysis
            </h1>
            <p className="text-slate-300">Upload a 20s face video or record directly in the browser.</p>
          </div>
          <Badge variant="outline" className="border-white/20 text-white bg-white/5" title={`API Base: ${API_BASE}`}>
            {envBadge}
          </Badge>
        </div>

        <Card className="glass-card mb-6 rounded-2xl border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white">Analysis Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsPanel value={settings} onChange={setSettings} />
            <p className="mt-4 text-xs text-slate-400">
              Base URL: <code className="px-1.5 py-0.5 rounded bg-white/10 text-blue-400">{API_BASE}</code> • Change via NEXT_PUBLIC_API_BASE environment variable.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="upload" className="mb-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="upload" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-300">
              Upload
            </TabsTrigger>
            <TabsTrigger value="record" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-300">
              Record
            </TabsTrigger>
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
          <Alert variant="destructive" className="mb-6 border-red-500/50 bg-red-500/10">
            <AlertTitle className="text-red-300">Upload Error</AlertTitle>
            <AlertDescription className="text-red-200">{uploadError}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <Card className="glass-card mb-6 rounded-2xl border-white/10">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <Info className="size-4 text-blue-400" />
                <p className="text-sm text-white">Uploading and analyzing...</p>
              </div>
              <Progress value={uploadProgress} className="h-2 bg-white/10" />
              <p className="mt-2 text-xs text-slate-400">{uploadProgress}% complete</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-6">
            <ResultsSummary data={result} />
            <TopEmotions data={result} />
            <WindowsTable data={result} />
            <EmotionHeat data={result} />
            <Card className="glass-card rounded-2xl border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white">Raw JSON</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setRawJsonOpen((v) => !v)}
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    {rawJsonOpen ? "Hide JSON" : "View JSON"}
                  </Button>
                </div>
                {rawJsonOpen && (
                  <pre className="max-h-[400px] overflow-auto rounded-lg bg-black/50 border border-white/10 p-4 text-xs text-slate-300">
                    <code>{JSON.stringify(result, null, 2)}</code>
                  </pre>
                )}
              </CardContent>
            </Card>
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                onClick={() => runAnalysis(file)} 
                disabled={!file || loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                Rerun Analysis
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null)
                  setResult(null)
                  setUploadError(null)
                }}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
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
    <Card className="glass-card rounded-2xl border-white/10">
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
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
            dragOver ? "border-blue-500 bg-blue-500/10" : "border-white/20 bg-white/5",
          ].join(" ")}
          onClick={() => inputRef.current?.click()}
          role="button"
          aria-label="Upload video"
        >
          <p className="text-sm text-white">
            Drag & drop your video here, or <span className="text-blue-400 font-medium">choose a file</span>
          </p>
          <p className="text-xs text-slate-400">We accept video/* up to {MAX_FILE_MB}MB.</p>
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
              <p className="text-sm font-medium text-white">Selected File</p>
              <p className="text-xs text-slate-400 break-all">
                {file.name} • {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  onClick={() => onFileSelected(null)} 
                  disabled={loading}
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  Remove
                </Button>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-2">
              <video ref={videoRef} className="h-40 w-full rounded object-contain" controls />
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <Button 
            onClick={onRun} 
            disabled={!file || loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            Run Analysis
          </Button>
          {loading && (
            <div className="flex min-w-40 items-center gap-2">
              <Progress value={progress} className="h-2 w-40 bg-white/10" />
              <span className="text-xs text-slate-400">{progress}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
