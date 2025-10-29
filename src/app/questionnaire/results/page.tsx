"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { loadSession, clearSession } from "@/lib/questionnaire-storage"
import type { QuestionnaireSession } from "@/types/questionnaire"
import { CheckCircle2, Video, Keyboard, BarChart3, Download, Home, Brain, TrendingUp, Activity } from "lucide-react"

export default function QuestionnaireResultsPage() {
  const router = useRouter()
  const [session, setSession] = useState<QuestionnaireSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedSession = loadSession()
    if (!savedSession) {
      router.push("/questionnaire")
      return
    }
    setSession(savedSession)
    setLoading(false)
  }, [router])

  const handleReset = () => {
    if (confirm("Are you sure you want to clear this session?")) {
      clearSession()
      router.push("/questionnaire")
    }
  }

  const exportSession = () => {
    if (!session) return

    const exportData = {
      sessionId: session.sessionId,
      userId: session.userId,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      answers: session.answers.map((answer) => ({
        questionId: answer.questionId,
        questionText: answer.questionText,
        answerText: answer.answerText,
        timestamp: answer.timestamp,
        videoAnalysis: answer.videoAnalysis,
        keystrokeFeatures: answer.keystrokeFeatures,
        keystrokeAnalysis: answer.keystrokeAnalysis,
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `neurotrack_session_${session.sessionId}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading || !session) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  const totalQuestions = session.answers.length
  
  // Calculate averages across all 5 questions
  const avgVideoStress = totalQuestions > 0 ? session.answers.reduce((sum, ans) => {
    return sum + (ans.videoAnalysis?.overall?.stress_score || 0)
  }, 0) / totalQuestions : 0

  const avgKeystrokeStress = totalQuestions > 0 ? session.answers.reduce((sum, ans) => {
    return sum + (ans.keystrokeAnalysis?.stress_score || ans.keystrokeAnalysis?.stress_probability || 0)
  }, 0) / totalQuestions : 0

  // Combined analysis - aggregate all 5 questions
  const allVideoWindows = session.answers.flatMap(ans => ans.videoAnalysis?.windows || [])
  const allTopEmotions = session.answers
    .flatMap(ans => ans.videoAnalysis?.overall?.top_emotions || [])
    .reduce((acc: any, emotion: any) => {
      const existing = acc.find((e: any) => e.label === emotion.label)
      if (existing) {
        existing.prob = (existing.prob + emotion.prob) / 2
      } else {
        acc.push({ label: emotion.label, prob: emotion.prob })
      }
      return acc
    }, [])
    .sort((a: any, b: any) => b.prob - a.prob)
    .slice(0, 3)

  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Combined Analysis Results
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                All 5 questions analyzed • Completed on {session.completedAt ? new Date(session.completedAt).toLocaleString() : "N/A"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportSession}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" onClick={handleReset}>
                New Session
              </Button>
            </div>
          </div>

          {/* Combined Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="rounded-2xl border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Questions Completed</p>
                    <p className="text-3xl font-bold">{totalQuestions} / 5</p>
                    {totalQuestions === 5 && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ All complete</p>
                    )}
                  </div>
                  <div className="rounded-xl bg-green-500/20 p-3">
                    <CheckCircle2 className="h-7 w-7 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Avg Video Stress</p>
                    <p className="text-3xl font-bold">{(avgVideoStress * 100).toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">{allVideoWindows.length} analysis windows</p>
                  </div>
                  <div className="rounded-xl bg-blue-500/20 p-3">
                    <Video className="h-7 w-7 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Avg Keystroke Stress</p>
                    <p className="text-3xl font-bold">{(avgKeystrokeStress * 100).toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Based on typing patterns</p>
                  </div>
                  <div className="rounded-xl bg-purple-500/20 p-3">
                    <Keyboard className="h-7 w-7 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Combined Analytics Overview */}
          <Card className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Brain className="h-6 w-6 text-primary" />
                Combined Analytics Across All 5 Questions
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Aggregated insights from video emotion analysis and keystroke pattern analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg border p-4 bg-background/50">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video Analysis Summary
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Analysis Windows:</span>
                      <span className="font-semibold">{allVideoWindows.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Stress Score:</span>
                      <span className="font-semibold">{(avgVideoStress * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stress Detected:</span>
                      <Badge variant={avgVideoStress > 0.5 ? "destructive" : "default"}>
                        {avgVideoStress > 0.5 ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4 bg-background/50">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Keyboard className="h-4 w-4" />
                    Keystroke Analysis Summary
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Stress Score:</span>
                      <span className="font-semibold">{(avgKeystrokeStress * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Keystroke Events:</span>
                      <span className="font-semibold">
                        {session.answers.reduce((sum, ans) => sum + ans.keystrokeEvents.length, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Typing Speed:</span>
                      <span className="font-semibold">
                        {session.answers.length > 0 
                          ? (session.answers.reduce((sum, ans) => sum + (ans.keystrokeFeatures?.chars_per_sec || 0), 0) / session.answers.length).toFixed(2)
                          : "0.00"} chars/s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {allTopEmotions.length > 0 && (
                <div className="rounded-lg border p-4 bg-background/50">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Overall Top Emotions (Across All Questions)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {allTopEmotions.map((emotion: any, idx: number) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1">
                        <span className="capitalize">{emotion.label}</span>
                        <span className="ml-2 text-xs">({(emotion.prob * 100).toFixed(0)}%)</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Answers */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Question Responses</h2>
          {session.answers.map((answer, index) => (
            <Card key={index} className="rounded-2xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      Question {answer.questionId}
                      <Badge variant="outline">#{index + 1}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">{answer.questionText}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="answer" className="w-full">
                  <TabsList>
                    <TabsTrigger value="answer">Answer</TabsTrigger>
                    <TabsTrigger value="video">Video Analysis</TabsTrigger>
                    <TabsTrigger value="keystroke">Keystroke Analysis</TabsTrigger>
                    {(answer as any).llmInsights && (
                      <TabsTrigger value="llm">AI Insights</TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="answer" className="space-y-4">
                    <div className="rounded-lg border p-4 bg-muted/50">
                      <p className="text-sm font-medium mb-2">Your Answer:</p>
                      <p className="text-sm whitespace-pre-wrap">{answer.answerText}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Answered on {new Date(answer.timestamp).toLocaleString()}
                    </div>
                  </TabsContent>

                  <TabsContent value="video" className="space-y-4">
                    {answer.videoAnalysis ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Stress Score</p>
                            <p className="text-lg font-semibold">
                              {(answer.videoAnalysis.overall?.stress_score * 100 || 0).toFixed(1)}%
                            </p>
                            <Badge variant={answer.videoAnalysis.overall?.stress ? "destructive" : "default"} className="mt-1">
                              {answer.videoAnalysis.overall?.stress ? "STRESSED" : "NOT STRESSED"}
                            </Badge>
                          </div>
                          <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Top Emotion</p>
                            <p className="text-lg font-semibold capitalize">
                              {answer.videoAnalysis.overall?.top_emotions?.[0]?.label || "N/A"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {(answer.videoAnalysis.overall?.top_emotions?.[0]?.prob * 100 || 0).toFixed(1)}% confidence
                            </p>
                          </div>
                        </div>
                        {answer.videoAnalysis.windows && (
                          <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground mb-2">Analysis Windows</p>
                            <p className="text-sm">{answer.videoAnalysis.windows.length} windows analyzed</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Video analysis not available</p>
                    )}
                  </TabsContent>

                  <TabsContent value="keystroke" className="space-y-4">
                    {answer.keystrokeAnalysis ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Stress Score</p>
                            <p className="text-lg font-semibold">
                              {(
                                (answer.keystrokeAnalysis.stress_score ||
                                  answer.keystrokeAnalysis.stress_probability ||
                                  0) * 100
                              ).toFixed(1)}
                              %
                            </p>
                            <Badge
                              variant={
                                answer.keystrokeAnalysis.stress_label === "High" ||
                                (answer.keystrokeAnalysis.stress_score || 0) > 0.66
                                  ? "destructive"
                                  : answer.keystrokeAnalysis.stress_label === "Medium" ||
                                    ((answer.keystrokeAnalysis.stress_score || 0) > 0.33 && (answer.keystrokeAnalysis.stress_score || 0) <= 0.66)
                                  ? "default"
                                  : "outline"
                              }
                              className="mt-1"
                            >
                              {answer.keystrokeAnalysis.stress_label || "Low"}
                            </Badge>
                          </div>
                          <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Keystroke Events</p>
                            <p className="text-lg font-semibold">{answer.keystrokeEvents.length} events</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {answer.keystrokeFeatures?.chars_per_sec?.toFixed(2) || 0} chars/sec
                            </p>
                          </div>
                        </div>
                        {answer.keystrokeFeatures && (
                          <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground mb-2">Features</p>
                            <div className="text-xs space-y-1">
                              <p>Duration: {(answer.keystrokeFeatures.duration_ms / 1000).toFixed(1)}s</p>
                              <p>Dwell Mean: {answer.keystrokeFeatures.dwell_mean_ms.toFixed(1)}ms</p>
                              <p>Pauses &gt; 1s: {answer.keystrokeFeatures.pauses_gt_1000}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Keystroke analysis not available</p>
                    )}
                  </TabsContent>

                  {/* LLM Insights Tab */}
                  {(answer as any).llmInsights && (
                    <TabsContent value="llm" className="space-y-4">
                      <div className="rounded-lg border p-4 bg-gradient-to-br from-primary/5 to-primary/10">
                        <h4 className="text-sm font-semibold mb-3">AI-Generated Insights</h4>
                        <div className="space-y-4 text-sm">
                          <div>
                            <p className="font-medium mb-1">Key Insights:</p>
                            <p className="text-muted-foreground whitespace-pre-wrap">{(answer as any).llmInsights.insights}</p>
                          </div>
                          <div>
                            <p className="font-medium mb-1">Emotion Summary:</p>
                            <p className="text-muted-foreground whitespace-pre-wrap">{(answer as any).llmInsights.emotion_summary}</p>
                          </div>
                          <div>
                            <p className="font-medium mb-1">Behavior Patterns:</p>
                            <p className="text-muted-foreground whitespace-pre-wrap">{(answer as any).llmInsights.behavior_patterns}</p>
                          </div>
                          {(answer as any).llmInsights.stress_indicators && (answer as any).llmInsights.stress_indicators.length > 0 && (
                            <div>
                              <p className="font-medium mb-2">Stress Indicators:</p>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {(answer as any).llmInsights.stress_indicators.map((indicator: string, idx: number) => (
                                  <li key={idx}>{indicator}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {(answer as any).llmInsights.recommendations && (answer as any).llmInsights.recommendations.length > 0 && (
                            <div>
                              <p className="font-medium mb-2">Recommendations:</p>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {(answer as any).llmInsights.recommendations.map((rec: string, idx: number) => (
                                  <li key={idx}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <Button asChild>
            <Link href="/questionnaire">Start New Session</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

