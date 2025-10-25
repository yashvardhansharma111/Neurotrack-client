import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Timer, Gauge, Cable } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <Badge className="mb-4">Private by Design</Badge>
            <h1 className="text-pretty text-3xl font-semibold leading-tight md:text-5xl">
              AI Emotion & Stress Analysis—Fast, Private, On-Device Capture
            </h1>
            <p className="mt-4 max-w-2xl text-balance text-muted-foreground">
              Detect faces, compute emotions every 2 seconds, and score stress—all via our simple API. No storage, just
              analysis.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/analyze">Try Analysis</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/docs">Read Docs</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-border/60">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <Timer className="size-5 text-primary" />
                <CardTitle>2-Second Windows</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Granular insights at 2s intervals for short clips.
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <ShieldCheck className="size-5 text-primary" />
                <CardTitle>Privacy First</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                No storage—videos only stream to your device and our analyzer.
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <Gauge className="size-5 text-primary" />
                <CardTitle>Actionable Metrics</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Overall stress verdict + valence/arousal + top emotions.
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <Cable className="size-5 text-primary" />
                <CardTitle>Simple API</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                POST /analyze-video with a file; get JSON.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="text-2xl font-semibold">How it works</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle>1) Capture or Upload</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Record 20 seconds with your camera or upload a short face video.
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle>2) We Analyze</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Our API extracts emotions per 2s window and computes stress.
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle>3) View Insights</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  See stress score, trend, top emotions, and raw JSON for your app.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Social proof placeholder */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <div className="flex items-center justify-between gap-6">
              <div className="h-8 w-24 rounded bg-muted" />
              <div className="h-8 w-24 rounded bg-muted" />
              <div className="h-8 w-24 rounded bg-muted" />
              <div className="h-8 w-24 rounded bg-muted" />
              <div className="h-8 w-24 rounded bg-muted" />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section>
          <div className="mx-auto max-w-6xl px-4 py-12">
            <Card className="rounded-2xl">
              <CardContent className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Ready to analyze your video?</h3>
                  <p className="text-sm text-muted-foreground">Try the analyzer now and get instant insights.</p>
                </div>
                <Button asChild>
                  <Link href="/analyze">Go to Analyze</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
