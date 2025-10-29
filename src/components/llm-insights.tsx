"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Brain, TrendingUp, AlertTriangle } from "lucide-react"
import type { RAGResponse } from "@/lib/llm-service"

export function LLMInsights({ 
  insights, 
  loading = false 
}: { 
  insights: RAGResponse | null
  loading: boolean 
}) {
  if (loading) {
    return (
      <Card className="rounded-2xl border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Analysis (RAG Agent)
          </CardTitle>
          <CardDescription>Analyzing combined video and keystroke patterns...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Processing with LLM...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!insights) {
    return null
  }

  return (
    <Card className="rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Insights (RAG Agent)
          {insights.confidence_score && (
            <Badge variant="outline" className="ml-auto">
              Confidence: {(insights.confidence_score * 100).toFixed(0)}%
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Combined analysis of emotions and typing behavior</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Insights */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Key Insights
          </h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{insights.insights}</p>
        </div>

        {/* Emotion Summary */}
        <div className="rounded-lg border p-4 bg-background/50">
          <h4 className="text-sm font-semibold mb-2">Emotion Summary</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{insights.emotion_summary}</p>
        </div>

        {/* Behavior Patterns */}
        <div className="rounded-lg border p-4 bg-background/50">
          <h4 className="text-sm font-semibold mb-2">Behavior Patterns</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{insights.behavior_patterns}</p>
        </div>

        {/* Stress Indicators */}
        {insights.stress_indicators && insights.stress_indicators.length > 0 && (
          <div className="rounded-lg border p-4 bg-background/50">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Stress Indicators
            </h4>
            <ul className="space-y-2">
              {insights.stress_indicators.map((indicator, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{indicator}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations && insights.recommendations.length > 0 && (
          <div className="rounded-lg border border-primary/20 p-4 bg-primary/5">
            <h4 className="text-sm font-semibold mb-3">Recommendations</h4>
            <ul className="space-y-2">
              {insights.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

