import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000"

export default function DocsPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-semibold">API Docs</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Endpoint: POST {API_BASE}/analyze-video (multipart/form-data)
        </p>

        <Card className="mt-6 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle>Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Required: <code className="rounded bg-muted px-1 py-0.5">file</code>
            </p>
            <p>
              Optional: <code className="rounded bg-muted px-1 py-0.5">sample_every_s</code>,{" "}
              <code className="rounded bg-muted px-1 py-0.5">conf</code>,{" "}
              <code className="rounded bg-muted px-1 py-0.5">maxFaces</code>,{" "}
              <code className="rounded bg-muted px-1 py-0.5">return_boxes</code>,{" "}
              <code className="rounded bg-muted px-1 py-0.5">smooth_k</code>,{" "}
              <code className="rounded bg-muted px-1 py-0.5">topk</code>,{" "}
              <code className="rounded bg-muted px-1 py-0.5">min_face_size</code>
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle>Curl Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">Git Bash / macOS / Linux</p>
              <pre className="overflow-auto rounded bg-muted p-3 text-xs">
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
              <p className="mb-2 text-sm font-medium">Windows PowerShell</p>
              <pre className="overflow-auto rounded bg-muted p-3 text-xs">
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
