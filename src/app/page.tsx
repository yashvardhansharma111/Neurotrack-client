"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Timer, Gauge, Cable, Video, BarChart3, Zap, TrendingUp, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border/60 bg-gradient-to-b from-background to-muted/20">
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
              {isAuthenticated && (
                <Button asChild size="lg">
                  <Link href="/questionnaire" className="gap-2">
                    Start Questionnaire
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button asChild size="lg" variant={isAuthenticated ? "outline" : "default"}>
                <Link href="/analyze" className="gap-2">
                  Try Analysis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {!isAuthenticated && (
                <Button variant="outline" size="lg" asChild>
                  <Link href="/login">Sign In to Dashboard</Link>
                </Button>
              )}
              {isAuthenticated && (
                <Button variant="outline" size="lg" asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              )}
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

        {/* Try Analysis Section */}
        <section className="border-b border-border/60 bg-gradient-to-b from-muted/20 to-background">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Core Feature</Badge>
              <h2 className="text-3xl font-semibold mb-4">Try Analysis Now</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience real-time emotion and stress analysis. Upload a video or record directly in your browser.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card className="rounded-2xl border-primary/20">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-center">Upload or Record</CardTitle>
                  <CardDescription className="text-center">
                    Choose to upload an existing video or record a new 20-second clip using your webcam.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="rounded-2xl border-primary/20">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-center">Real-Time Analysis</CardTitle>
                  <CardDescription className="text-center">
                    Get instant emotion detection and stress scoring with 2-second window granularity.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="rounded-2xl border-primary/20">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-center">Visualize Results</CardTitle>
                  <CardDescription className="text-center">
                    View detailed charts, heatmaps, and tables showing emotions, stress levels, and trends.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
            <div className="text-center">
              <Button asChild size="lg" className="gap-2">
                <Link href="/analyze">
                  Start Analysis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section>
          <div className="mx-auto max-w-6xl px-4 py-12">
            <Card className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="flex flex-col items-center gap-6 p-8 text-center md:flex-row md:text-left">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Ready to get started?</h3>
                  <p className="text-sm text-muted-foreground">
                    {isAuthenticated
                      ? "Access your dashboard to manage analyses and view insights."
                      : "Sign in to access your dashboard and track your analysis history."}
                  </p>
                </div>
                <div className="flex gap-3">
                  {!isAuthenticated ? (
                    <Button asChild variant="default">
                      <Link href="/login">Sign In</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="default">
                      <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                  )}
                  <Button asChild variant="outline">
                    <Link href="/analyze">Try Analysis</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
