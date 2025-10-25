import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-semibold">About NeuroTrack</h1>
        <Card className="mt-6 rounded-2xl">
          <CardContent className="prose prose-invert max-w-none p-6">
            <p>
              NeuroTrack analyzes short face videos to estimate emotions every 2 seconds and compute an overall stress
              score. The app is privacy-focused, with on-device capture, and a simple API to integrate into your
              workflows.
            </p>
            <p className="text-muted-foreground">
              This page is a placeholder. Add more product, research, and team details here.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
