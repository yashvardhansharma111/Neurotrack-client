"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SimultaneousRecorder } from "@/components/simultaneous-recorder"
import { useAuth } from "@/contexts/auth-context"
import { saveSession, loadSession, clearSession } from "@/lib/questionnaire-storage"
import { calculateKeystrokeFeatures } from "@/lib/keystroke-features"
import { RealtimeAnalyzer, type RealtimeVideoAnalysis, type RealtimeKeystrokeAnalysis } from "@/lib/realtime-analyzer"
import { sendToLLM, type RAGResponse } from "@/lib/llm-service"
import { LLMInsights } from "@/components/llm-insights"
import type { QuestionnaireSession, QuestionnaireAnswer, KeystrokeEvent } from "@/types/questionnaire"
import { AlertCircle, CheckCircle2, Video, Keyboard, Loader2, Activity, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"

const QUESTIONS = [
  {
    id: 1,
    text: "Tell a short example of a recent class or college day that went well.",
    prompt_context: "Q1",
  },
  {
    id: 2,
    text: "Describe a time when you felt stressed or overwhelmed with your studies.",
    prompt_context: "Q2",
  },
  {
    id: 3,
    text: "What are your main concerns or worries about your academic performance?",
    prompt_context: "Q3",
  },
  {
    id: 4,
    text: "How do you usually manage your time and workload?",
    prompt_context: "Q4",
  },
  {
    id: 5,
    text: "What motivates you the most in your studies?",
    prompt_context: "Q5",
  },
]

export default function QuestionnairePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()

  const [session, setSession] = useState<QuestionnaireSession | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [keystrokeEvents, setKeystrokeEvents] = useState<KeystrokeEvent[]>([])
  const [answerText, setAnswerText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recording, setRecording] = useState(false) // Track recording state
  
  // Real-time analysis states
  const [realtimeVideoData, setRealtimeVideoData] = useState<RealtimeVideoAnalysis[]>([])
  const [realtimeKeystrokeData, setRealtimeKeystrokeData] = useState<RealtimeKeystrokeAnalysis[]>([])
  const [llmInsights, setLlmInsights] = useState<RAGResponse | null>(null)
  const [llmLoading, setLlmLoading] = useState(false)
  const [realtimeAnalyzer, setRealtimeAnalyzer] = useState<RealtimeAnalyzer | null>(null)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)

  // Initialize or load session
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const existingSession = loadSession()
    if (existingSession && existingSession.userId === user?.id) {
      setSession(existingSession)
      setCurrentQuestionIndex(existingSession.currentQuestionIndex)
    } else {
      // Create new session
      const newSession: QuestionnaireSession = {
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user?.id || "unknown",
        startedAt: Date.now(),
        answers: [],
        currentQuestionIndex: 0,
      }
      setSession(newSession)
      saveSession(newSession)
    }
  }, [isAuthenticated, user, router])

  const currentQuestion = QUESTIONS[currentQuestionIndex]

  const handleVideoRecorded = useCallback((blob: Blob) => {
    setVideoBlob(blob)
    // Video recording is complete, trigger final analysis
    if (keystrokeEvents.length > 0) {
      triggerLLMAnalysis()
    }
  }, [keystrokeEvents])

  const handleSimultaneousRecorded = useCallback((blob: Blob, events: KeystrokeEvent[], text: string) => {
    setVideoBlob(blob)
    setKeystrokeEvents(events)
    setAnswerText(text)
    
    // Real-time keystroke analysis
    if (realtimeAnalyzer && events.length > 0) {
      realtimeAnalyzer.analyzeKeystrokeEvent(events)
    }
    
    // Get video stream for real-time analysis if available
    if (videoStream && realtimeAnalyzer) {
      realtimeAnalyzer.startVideoAnalysis(videoStream, 2000)
    }
  }, [realtimeAnalyzer, videoStream])

  const handleKeystrokeEventsChange = useCallback((events: KeystrokeEvent[]) => {
    setKeystrokeEvents(events)
    
    // Real-time keystroke analysis
    if (realtimeAnalyzer && events.length > 0) {
      realtimeAnalyzer.analyzeKeystrokeEvent(events)
    }
  }, [realtimeAnalyzer])
  
  // Trigger LLM analysis with current data - defined first to avoid reference error
  const triggerLLMAnalysis = useCallback(async () => {
    const currentQ = QUESTIONS[currentQuestionIndex]
    if (!session || !currentQ || realtimeVideoData.length === 0 || realtimeKeystrokeData.length === 0 || keystrokeEvents.length < 10) {
      return
    }
    
    setLlmLoading(true)
    
    try {
      // Aggregate real-time data
      const avgVideoStress = realtimeVideoData.reduce((sum, d) => sum + d.stress_score, 0) / realtimeVideoData.length
      const avgKeystrokeStress = realtimeKeystrokeData.reduce((sum, d) => sum + d.stress_score, 0) / realtimeKeystrokeData.length
      const latestVideo = realtimeVideoData[realtimeVideoData.length - 1]
      
      const features = calculateKeystrokeFeatures(
        keystrokeEvents,
        keystrokeEvents[0]?.timestamp_ms || Date.now(),
        keystrokeEvents[keystrokeEvents.length - 1]?.timestamp_ms || Date.now(),
      )
      
      const combinedData = {
        questionId: currentQ.id,
        questionText: currentQ.text,
        answerText: answerText,
        videoAnalysis: {
          overall: {
            stress_score: avgVideoStress,
            stress: avgVideoStress > 0.5,
            top_emotions: latestVideo?.top_emotions || [],
            valence: latestVideo?.valence,
            arousal: latestVideo?.arousal,
          },
          windows: realtimeVideoData.map(d => ({
            stress_score: d.stress_score,
            stress: d.stress,
            top_emotions: d.top_emotions,
          })),
        },
        keystrokeAnalysis: {
          stress_score: avgKeystrokeStress,
          stress_probability: avgKeystrokeStress,
          stress_label: avgKeystrokeStress > 0.66 ? "High" : avgKeystrokeStress > 0.33 ? "Medium" : "Low",
        },
        keystrokeFeatures: features,
        timestamp: Date.now(),
      }
      
      const insights = await sendToLLM(combinedData)
      setLlmInsights(insights)
    } catch (error) {
      console.error("LLM analysis error:", error)
    } finally {
      setLlmLoading(false)
    }
  }, [session, currentQuestionIndex, realtimeVideoData, realtimeKeystrokeData, keystrokeEvents, answerText])

  // Initialize real-time analyzer when component mounts - moved after triggerLLMAnalysis
  useEffect(() => {
    if (!isAuthenticated) return
    
    const onVideoAnalysis = (analysis: RealtimeVideoAnalysis) => {
      setRealtimeVideoData(prev => [...prev, analysis])
    }
    
    const onKeystrokeAnalysis = (analysis: RealtimeKeystrokeAnalysis) => {
      setRealtimeKeystrokeData(prev => {
        const updated = [...prev, analysis]
        // Trigger LLM analysis periodically (every 5 keystroke analyses)
        if (updated.length % 5 === 0 && updated.length > 0) {
          // Use setTimeout to avoid calling during state update
          setTimeout(() => {
            triggerLLMAnalysis()
          }, 100)
        }
        return updated
      })
    }
    
    const analyzer = new RealtimeAnalyzer(onVideoAnalysis, onKeystrokeAnalysis)
    setRealtimeAnalyzer(analyzer)
    
    return () => {
      analyzer.reset()
    }
  }, [isAuthenticated, triggerLLMAnalysis])

  const analyzeVideo = async (blob: Blob): Promise<any> => {
    const formData = new FormData()
    formData.append("file", blob, "recording.webm")
    // According to README.md - 20 second video should be analyzed with these params
    formData.append("sample_every_s", "2.0") // Analyze every 2 seconds
    formData.append("conf", "0.25") // Confidence threshold
    formData.append("maxFaces", "1") // Track largest face
    formData.append("return_boxes", "0") // Don't return bounding boxes
    formData.append("smooth_k", "1") // Smoothing window
    formData.append("topk", "3") // Top 3 emotions per window
    formData.append("min_face_size", "20") // Minimum face size

    const response = await fetch(`${API_BASE}/analyze-video`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Video analysis error:", errorText)
      throw new Error(`Video analysis failed: ${response.statusText}`)
    }

    return await response.json()
  }

  const analyzeKeystroke = async (
    features: any,
    questionId: number,
    questionText: string,
    windowStart: number,
    windowEnd: number,
  ): Promise<any> => {
    // According to keystroke.md - send all required fields
    const payload = {
      session_id: session?.sessionId || "",
      user_id: session?.userId || "",
      age: 21, // Default, can be collected from user profile
      gender: "Male", // Default, can be collected from user profile
      year_of_study: 3, // Default, can be collected from user profile
      question_id: questionId,
      question_text: questionText,
      window_start_ts: windowStart,
      window_end_ts: windowEnd,
      features, // All keystroke features calculated from events
    }

    // Try /keystroke first, fallback to /keystrokes
    let endpoint = `${API_BASE}/keystroke`
    let response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok && response.status === 404) {
      // Try alternative endpoint
      endpoint = `${API_BASE}/keystrokes`
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }

    if (!response.ok) {
      throw new Error("Keystroke analysis failed")
    }

    return await response.json()
  }

  const handleNext = async () => {
    if (!session || !currentQuestion) return

    if (!videoBlob) {
      setError("Please record a video first")
      return
    }

    if (keystrokeEvents.length === 0 || answerText.trim().length === 0) {
      setError("Please type an answer")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const windowStart = keystrokeEvents[0]?.timestamp_ms || Date.now()
      const windowEnd = keystrokeEvents[keystrokeEvents.length - 1]?.timestamp_ms || Date.now()

      // Calculate keystroke features
      const features = calculateKeystrokeFeatures(keystrokeEvents, windowStart, windowEnd)

      // Analyze video
      const videoAnalysis = await analyzeVideo(videoBlob)

      // Analyze keystroke (with error handling - may not be available)
      let keystrokeAnalysis = null
      try {
        keystrokeAnalysis = await analyzeKeystroke(features, currentQuestion.id, currentQuestion.text, windowStart, windowEnd)
      } catch (e) {
        console.warn("Keystroke analysis failed:", e)
        // Continue without keystroke analysis
      }

      // Get final LLM insights if available
      let finalLLMInsights = llmInsights
      if (!finalLLMInsights && realtimeVideoData.length > 0 && realtimeKeystrokeData.length > 0) {
        // Trigger one final LLM analysis
        const combinedData = {
          questionId: currentQuestion.id,
          questionText: currentQuestion.text,
          answerText: answerText.trim(),
          videoAnalysis,
          keystrokeAnalysis,
          keystrokeFeatures: features,
          timestamp: Date.now(),
        }
        try {
          finalLLMInsights = await sendToLLM(combinedData)
        } catch (e) {
          console.warn("Final LLM analysis failed:", e)
        }
      }

      // Save answer
      const answer: QuestionnaireAnswer = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        answerText: answerText.trim(),
        videoBlob,
        videoAnalysis,
        keystrokeEvents,
        keystrokeFeatures: features,
        keystrokeAnalysis,
        timestamp: Date.now(),
        window_start_ts: windowStart,
        window_end_ts: windowEnd,
        // @ts-ignore - Add LLM insights to answer
        llmInsights: finalLLMInsights,
        realtimeVideoData,
        realtimeKeystrokeData,
      }

      const updatedSession: QuestionnaireSession = {
        ...session,
        answers: [...session.answers, answer],
        currentQuestionIndex: currentQuestionIndex + 1,
      }

      setSession(updatedSession)
      saveSession(updatedSession)

      // Move to next question or complete
      if (currentQuestionIndex < QUESTIONS.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setVideoBlob(null)
        setKeystrokeEvents([])
        setAnswerText("")
        setRealtimeVideoData([])
        setRealtimeKeystrokeData([])
        setLlmInsights(null)
        setRecording(false)
        realtimeAnalyzer?.reset()
        addToast({
          title: "Question saved",
          description: `Question ${currentQuestionIndex + 1} of ${QUESTIONS.length} completed. Moving to next question...`,
        })
      } else {
        // Complete session
        const completedSession: QuestionnaireSession = {
          ...updatedSession,
          completedAt: Date.now(),
        }
        saveSession(completedSession)
        router.push("/questionnaire/results")
      }
    } catch (e: any) {
      setError(e?.message || "Failed to save answer")
      addToast({
        title: "Error",
        description: e?.message || "Failed to analyze and save answer",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the questionnaire? All progress will be lost.")) {
      clearSession()
      setSession(null)
      setCurrentQuestionIndex(0)
      setVideoBlob(null)
      setKeystrokeEvents([])
      setAnswerText("")
      setError(null)
    }
  }

  if (!session || !isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100
  const isCompleted = session.answers.length === QUESTIONS.length

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:py-12">
        {/* Header with enhanced styling */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Emotion & Stress Analysis
              </h1>
              <p className="text-muted-foreground">
                Question <span className="font-semibold text-foreground">{currentQuestionIndex + 1}</span> of <span className="font-semibold text-foreground">{QUESTIONS.length}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1.5">
                Session: {session.sessionId.substring(0, 8)}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3 bg-muted/50" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{currentQuestionIndex + 1} of {QUESTIONS.length} completed</span>
              <span>{QUESTIONS.length - currentQuestionIndex - 1} remaining</span>
            </div>
          </div>
        </div>

        {/* Current Question with enhanced design */}
        <Card className="mb-8 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card to-card/80 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="rounded-full bg-primary/20 p-2.5 mt-1">
                <span className="text-lg font-bold text-primary">{currentQuestion.id}</span>
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl mb-3">Question {currentQuestion.id}</CardTitle>
                <CardDescription className="text-base leading-relaxed text-foreground/80">
                  {currentQuestion.text}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Instructions Card */}
        {!videoBlob && !recording && (
          <Card className="mb-6 rounded-2xl border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-blue-500/20 p-3 flex-shrink-0">
                  <Video className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-lg font-semibold">Ready to Start?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You'll record a 20-second video while typing your answer. Both your facial expressions and typing patterns will be analyzed together for comprehensive insights.
                  </p>
                  <div className="rounded-lg bg-background/50 p-4 space-y-2 border border-border/50">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <span className="rounded-full bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center font-bold">1</span>
                      Click "Start Recording & Typing"
                    </p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <span className="rounded-full bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center font-bold">2</span>
                      Keep your face visible in the camera
                    </p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <span className="rounded-full bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center font-bold">3</span>
                      Type your answer while recording (20 seconds)
                    </p>
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                      💡 Tip: Speak naturally and type at your normal pace. The system analyzes both your emotions and typing behavior.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {videoBlob && keystrokeEvents.length > 0 && (
          <Card className="mb-6 rounded-2xl border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">Recording Complete!</p>
                  <p className="text-xs text-muted-foreground mt-1">Video and keystroke data captured. Click "Next Question" to proceed.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Simultaneous Video Recording & Keystroke Collection */}
        <div className="mb-8">
          <SimultaneousRecorder
            seconds={20}
            onRecorded={(blob) => {
              setVideoBlob(blob)
              setRecording(false)
              // Trigger final analysis when recording completes
              if (keystrokeEvents.length > 0 && answerText.trim().length > 0) {
                setTimeout(() => triggerLLMAnalysis(), 500)
              }
            }}
            onKeystrokeEventsChange={(events) => {
              setKeystrokeEvents(events)
              // Real-time keystroke analysis
              if (realtimeAnalyzer && events.length > 0) {
                realtimeAnalyzer.analyzeKeystrokeEvent(events)
              }
            }}
            onAnswerTextChange={(text) => {
              setAnswerText(text)
            }}
            onRecordingChange={(isRecording) => {
              setRecording(isRecording)
            }}
            disabled={isSubmitting}
          />
        </div>

        {/* Real-time Analysis Status */}
        {(realtimeVideoData.length > 0 || realtimeKeystrokeData.length > 0) && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              Real-Time Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="rounded-2xl border-2 border-border/50 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-blue-500/20 p-1.5">
                        <Video className="h-4 w-4 text-blue-500" />
                      </div>
                      <span className="text-sm font-semibold">Video Analysis</span>
                    </div>
                    <Badge variant="secondary">{realtimeVideoData.length} frames</Badge>
                  </div>
                  {realtimeVideoData.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Avg Stress:</span>
                        <span className="font-semibold">{((realtimeVideoData.reduce((sum, d) => sum + d.stress_score, 0) / realtimeVideoData.length) * 100).toFixed(1)}%</span>
                      </div>
                      {realtimeVideoData[realtimeVideoData.length - 1]?.top_emotions?.[0] && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Top Emotion:</span>
                          <span className="font-semibold capitalize">{realtimeVideoData[realtimeVideoData.length - 1].top_emotions[0].label}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-2 border-border/50 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-purple-500/20 p-1.5">
                        <Keyboard className="h-4 w-4 text-purple-500" />
                      </div>
                      <span className="text-sm font-semibold">Keystroke Patterns</span>
                    </div>
                    <Badge variant="secondary">{realtimeKeystrokeData.length} analyses</Badge>
                  </div>
                  {realtimeKeystrokeData.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Avg Stress:</span>
                        <span className="font-semibold">{((realtimeKeystrokeData.reduce((sum, d) => sum + d.stress_score, 0) / realtimeKeystrokeData.length) * 100).toFixed(1)}%</span>
                      </div>
                      {realtimeKeystrokeData[realtimeKeystrokeData.length - 1] && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Typing Speed:</span>
                          <span className="font-semibold">{realtimeKeystrokeData[realtimeKeystrokeData.length - 1].typing_speed.toFixed(2)} chars/s</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* LLM Insights */}
        {(llmInsights || llmLoading) && (
          <div className="mb-6">
            <LLMInsights insights={llmInsights} loading={llmLoading} />
          </div>
        )}

        {/* Answer Summary */}
        {answerText !== "" && (
          <Card className="mb-8 rounded-2xl border border-border/50 bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Answer Prepared</p>
                    <p className="text-xs text-muted-foreground">{answerText.length} characters • {keystrokeEvents.length} keystroke events</p>
                  </div>
                </div>
                {answerText.length < 20 && (
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    Consider adding more detail
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions with improved design */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-8">
          <Button 
            variant="ghost" 
            onClick={handleReset} 
            disabled={isSubmitting}
            className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Reset Session
          </Button>
          <div className="flex gap-3 justify-end">
            {currentQuestionIndex > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentQuestionIndex(currentQuestionIndex - 1)
                  setVideoBlob(null)
                  setKeystrokeEvents([])
                  setAnswerText("")
                  setRealtimeVideoData([])
                  setRealtimeKeystrokeData([])
                  setLlmInsights(null)
                }}
                disabled={isSubmitting}
                size="lg"
              >
                ← Previous
              </Button>
            )}
            <Button 
              onClick={handleNext} 
              disabled={isSubmitting || !videoBlob || keystrokeEvents.length === 0 || answerText.trim().length === 0}
              size="lg"
              className="min-w-[180px] shadow-lg hover:shadow-xl transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : currentQuestionIndex === QUESTIONS.length - 1 ? (
                <>
                  Complete
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next Question
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

