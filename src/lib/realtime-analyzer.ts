/**
 * Real-time analyzer for processing video frames and keystroke patterns
 * Captures data continuously while user is answering
 */

import { calculateKeystrokeFeatures } from "./keystroke-features"
import type { KeystrokeEvent } from "@/types/questionnaire"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"

export type RealtimeVideoAnalysis = {
  stress_score: number
  stress: boolean
  top_emotions: Array<{ label: string; prob: number }>
  valence?: number
  arousal?: number
  timestamp: number
}

export type RealtimeKeystrokeAnalysis = {
  stress_score: number
  typing_speed: number
  pause_frequency: number
  consistency_score: number
  timestamp: number
}

export class RealtimeAnalyzer {
  private videoInterval: ReturnType<typeof setInterval> | null = null
  private keystrokeBuffer: KeystrokeEvent[] = []
  private videoAnalysisHistory: RealtimeVideoAnalysis[] = []
  private keystrokeAnalysisHistory: RealtimeKeystrokeAnalysis[] = []

  constructor(
    private onVideoAnalysis: (analysis: RealtimeVideoAnalysis) => void,
    private onKeystrokeAnalysis: (analysis: RealtimeKeystrokeAnalysis) => void,
    private videoStream: MediaStream | null = null,
  ) {}

  // Start analyzing video stream in real-time
  startVideoAnalysis(stream: MediaStream, intervalMs: number = 2000) {
    this.videoStream = stream
    
    this.videoInterval = setInterval(async () => {
      try {
        const analysis = await this.captureAndAnalyzeFrame(stream)
        if (analysis) {
          this.videoAnalysisHistory.push(analysis)
          this.onVideoAnalysis(analysis)
        }
      } catch (error) {
        console.error("Real-time video analysis error:", error)
      }
    }, intervalMs)
  }

  stopVideoAnalysis() {
    if (this.videoInterval) {
      clearInterval(this.videoInterval)
      this.videoInterval = null
    }
  }

  // Analyze keystroke events as they come in
  analyzeKeystrokeEvent(events: KeystrokeEvent[]) {
    if (events.length < 10) return // Need minimum events for meaningful analysis

    this.keystrokeBuffer = [...events]
    const analysis = this.processKeystrokeEvents(events)
    
    if (analysis) {
      this.keystrokeAnalysisHistory.push(analysis)
      this.onKeystrokeAnalysis(analysis)
    }
  }

  // Capture frame from video stream and analyze
  private async captureAndAnalyzeFrame(stream: MediaStream): Promise<RealtimeVideoAnalysis | null> {
    try {
      const video = document.createElement("video")
      video.srcObject = stream
      video.muted = true
      await video.play()

      // Capture frame to canvas
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      const ctx = canvas.getContext("2d")
      if (!ctx) return null

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert to blob
      return new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            resolve(null)
            return
          }

          try {
            // Send to analyze-image endpoint
            const formData = new FormData()
            formData.append("file", blob, "frame.jpg")
            formData.append("conf", "0.25")
            formData.append("maxFaces", "1")
            formData.append("topk", "3")

            const response = await fetch(`${API_BASE}/analyze-image`, {
              method: "POST",
              body: formData,
            })

            if (!response.ok) {
              resolve(null)
              return
            }

            const data = await response.json()

            resolve({
              stress_score: data.stress_score || 0,
              stress: data.stress || false,
              top_emotions: (data.top_emotions || []).map((e: any) => ({
                label: e.label,
                prob: e.prob || e.probability || 0,
              })),
              valence: data.valence,
              arousal: data.arousal,
              timestamp: Date.now(),
            })
          } catch (error) {
            console.error("Frame analysis error:", error)
            resolve(null)
          }
        }, "image/jpeg", 0.8)
      })
    } catch (error) {
      console.error("Frame capture error:", error)
      return null
    }
  }

  // Process keystroke events for real-time analysis
  private processKeystrokeEvents(events: KeystrokeEvent[]): RealtimeKeystrokeAnalysis | null {
    if (events.length < 2) return null

    const startTime = events[0].timestamp_ms
    const endTime = events[events.length - 1].timestamp_ms
    const features = calculateKeystrokeFeatures(events, startTime, endTime)

    // Calculate real-time stress indicators
    const charsPerSec = features.chars_per_sec
    const pauseFrequency = features.pauses_gt_1000 / (features.duration_ms / 1000) // pauses per second
    const dwellVariability = features.cv_dwell

    // Simple stress scoring based on patterns
    let stressScore = 0
    if (charsPerSec < 0.5) stressScore += 0.3 // Very slow typing
    if (pauseFrequency > 0.5) stressScore += 0.3 // Many pauses
    if (dwellVariability > 0.8) stressScore += 0.2 // Inconsistent typing
    if (features.longest_pause_ms > 3000) stressScore += 0.2 // Very long pause

    // Consistency score (inverse of variability)
    const consistencyScore = Math.max(0, Math.min(1, 1 - dwellVariability))

    return {
      stress_score: Math.min(1, stressScore),
      typing_speed: charsPerSec,
      pause_frequency: pauseFrequency,
      consistency_score: consistencyScore,
      timestamp: Date.now(),
    }
  }

  // Get aggregated history
  getVideoHistory(): RealtimeVideoAnalysis[] {
    return [...this.videoAnalysisHistory]
  }

  getKeystrokeHistory(): RealtimeKeystrokeAnalysis[] {
    return [...this.keystrokeAnalysisHistory]
  }

  // Get average stress over time
  getAverageVideoStress(): number {
    if (this.videoAnalysisHistory.length === 0) return 0
    const sum = this.videoAnalysisHistory.reduce((acc, a) => acc + a.stress_score, 0)
    return sum / this.videoAnalysisHistory.length
  }

  getAverageKeystrokeStress(): number {
    if (this.keystrokeAnalysisHistory.length === 0) return 0
    const sum = this.keystrokeAnalysisHistory.reduce((acc, a) => acc + a.stress_score, 0)
    return sum / this.keystrokeAnalysisHistory.length
  }

  reset() {
    this.stopVideoAnalysis()
    this.videoAnalysisHistory = []
    this.keystrokeAnalysisHistory = []
    this.keystrokeBuffer = []
  }
}

