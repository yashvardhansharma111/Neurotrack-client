"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, FileText, Terminal } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

export default function DocsPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-black">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            API Documentation
          </h1>
          <p className="text-slate-300 text-lg">
            Endpoint: <code className="px-2 py-1 rounded bg-white/10 text-blue-400">POST {API_BASE}/analyze-video</code>
          </p>
          <p className="text-slate-400 text-sm mt-2">multipart/form-data</p>
        </div>

        <Card className="glass-card rounded-2xl border-white/10 mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-blue-400" />
              <CardTitle className="text-white">Request Parameters</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-white mb-2">
                <span className="text-green-400">Required:</span>{" "}
                <code className="rounded bg-white/10 px-2 py-1 text-blue-400">file</code>
              </p>
            </div>
            <div>
              <p className="text-white mb-2">
                <span className="text-purple-400">Optional:</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {["sample_every_s", "conf", "maxFaces", "return_boxes", "smooth_k", "topk", "min_face_size"].map(
                  (param) => (
                    <code key={param} className="rounded bg-white/10 px-2 py-1 text-purple-400 text-xs">
                      {param}
                    </code>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-2xl border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Terminal className="size-5 text-pink-400" />
              <CardTitle className="text-white">Code Examples</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-medium text-white flex items-center gap-2">
                <Code className="size-4" />
                Git Bash / macOS / Linux
              </p>
              <pre className="overflow-auto rounded-lg bg-black/50 border border-white/10 p-4 text-xs text-slate-300">
                <code>{`curl -X POST "${API_BASE}/analyze-video" \\
  -H "accept: application/json" \\
  -F "file=@/path/to/video.mp4" \\
  -F "sample_every_s=2" \\
  -F "conf=0.25" \\
  -F "maxFaces=1" \\
  -F "return_boxes=0" \\
  -F "smooth_k=1" \\
  -F "topk=3" \\
  -F "min_face_size=20"`}</code>
              </pre>
            </div>
            <div>
              <p className="mb-3 text-sm font-medium text-white flex items-center gap-2">
                <Code className="size-4" />
                Windows PowerShell
              </p>
              <pre className="overflow-auto rounded-lg bg-black/50 border border-white/10 p-4 text-xs text-slate-300">
                <code>{`$form = @{
  file = Get-Item "C:\\path\\to\\video.mp4"
  sample_every_s = 2
  conf = 0.25
  maxFaces = 1
  return_boxes = 0
  smooth_k = 1
  topk = 3
  min_face_size = 20
}
Invoke-RestMethod -Method Post -Uri "${API_BASE}/analyze-video" -Form $form`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
