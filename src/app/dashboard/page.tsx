"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { Video, BarChart3, Zap, Shield, TrendingUp, Activity, CheckCircle2, ArrowRight, Brain, Sparkles, Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Give auth context time to initialize
    const timer = setTimeout(() => {
      setIsChecking(false)
      if (!isAuthenticated) {
        router.push("/login")
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [isAuthenticated, router])

  // Show loading state while checking authentication
  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          )}
        </div>
      </div>
    )
  }

  const features = [
    {
      icon: Video,
      title: "Simultaneous Recording",
      description: "Record 20-second video responses while typing answers. Real-time video emotion and keystroke pattern analysis.",
      action: "Start Questionnaire",
      href: "/questionnaire",
    },
    {
      icon: BarChart3,
      title: "Combined Analysis",
      description: "AI-powered RAG agent analyzes combined video emotions and typing behavior patterns together.",
      action: "View Results",
      href: "/questionnaire",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Insights",
      description: "See emotion and stress indicators update in real-time as you answer questions.",
      action: "Try Now",
      href: "/questionnaire",
    },
  ]

  const stats = [
    { label: "Total Analyses", value: "0", icon: Activity },
    { label: "Stress Detections", value: "0", icon: TrendingUp },
    { label: "Avg Stress Score", value: "—", icon: BarChart3 },
  ]

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:py-12">
        {/* Header with gradient */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Welcome back, {user?.username}! 👋
                </h1>
              </div>
              <p className="text-muted-foreground text-lg ml-12">
                Your personalized emotion and stress analysis dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm px-4 py-2 rounded-full">
                <CheckCircle2 className="h-3 w-3 mr-2" />
                Active Session
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats with enhanced styling */}
        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((stat, i) => (
            <Card key={i} className="rounded-2xl border-2 border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-4 shadow-sm">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Core Features with enhanced cards */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Core Features</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, i) => (
              <Card 
                key={i} 
                className="rounded-2xl border-2 border-border/50 bg-gradient-to-br from-card to-card/80 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group"
              >
                <CardHeader className="pb-3">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-3 group-hover:from-primary/30 group-hover:to-primary/20 transition-all shadow-sm">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl leading-tight">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="default" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Link href={feature.href} className="flex items-center justify-center gap-2">
                      {feature.action}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions with enhanced design */}
        <Card className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 mb-10 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="rounded-xl bg-primary/20 p-2">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              Quick Actions
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Get started with your analysis journey
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="flex-1 min-w-[200px] shadow-md hover:shadow-lg transition-all">
              <Link href="/questionnaire" className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Start Questionnaire
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="flex-1 min-w-[200px]">
              <Link href="/analyze" className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Try Video Analysis
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1 min-w-[200px] border-2">
              <Link href="/docs" className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                View API Docs
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Info Cards with enhanced design */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl border-2 border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 p-3">
                  <Shield className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-xl">Privacy First</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your videos are processed securely and never stored. All analysis happens in real-time with no data retention. Your privacy is our top priority.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 p-3">
                  <Activity className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-xl">Real-Time Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get instant insights with 2-second window analysis. See emotions and stress levels as they unfold with AI-powered RAG analysis.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Welcome message for first-time users */}
        {stats[0].value === "0" && (
          <Card className="mt-8 rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ready to Get Started?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start your first questionnaire session to analyze your emotions and stress patterns through combined video and keystroke analysis.
              </p>
              <Button asChild size="lg">
                <Link href="/questionnaire" className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Start Your First Analysis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
}

