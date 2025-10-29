/**
 * LLM Service for sending combined video and keystroke data to LLM API
 * Supports OpenAI, Anthropic, or custom endpoints
 */

const LLM_API_BASE = process.env.NEXT_PUBLIC_LLM_API_BASE || ""
const LLM_API_KEY = process.env.NEXT_PUBLIC_LLM_API_KEY || ""
const LLM_PROVIDER = process.env.NEXT_PUBLIC_LLM_PROVIDER || "openai" // openai, anthropic, custom

export type CombinedAnalysisData = {
  questionId: number
  questionText: string
  answerText: string
  videoAnalysis?: {
    overall?: {
      stress_score?: number
      stress?: boolean
      top_emotions?: Array<{ label: string; prob: number }>
      valence?: number
      arousal?: number
    }
    windows?: Array<{
      stress_score: number
      stress: boolean
      top_emotions?: Array<{ label: string; prob: number }>
    }>
  }
  keystrokeAnalysis?: {
    stress_score?: number
    stress_probability?: number
    stress_label?: string
  }
  keystrokeFeatures?: {
    chars_per_sec?: number
    dwell_mean_ms?: number
    pauses_gt_1000?: number
    longest_pause_ms?: number
  }
  timestamp: number
}

export type RAGResponse = {
  insights: string
  emotion_summary: string
  behavior_patterns: string
  stress_indicators: string[]
  recommendations?: string[]
  confidence_score?: number
}

export async function sendToLLM(data: CombinedAnalysisData): Promise<RAGResponse> {
  // If no LLM API is configured, return default analysis
  if (!LLM_API_BASE && !LLM_API_KEY) {
    return generateLocalAnalysis(data)
  }

  try {
    const prompt = buildRAGPrompt(data)
    
    if (LLM_PROVIDER === "openai") {
      return await callOpenAI(prompt)
    } else if (LLM_PROVIDER === "anthropic") {
      return await callAnthropic(prompt)
    } else {
      return await callCustomLLM(prompt)
    }
  } catch (error) {
    console.error("LLM API error:", error)
    // Fallback to local analysis
    return generateLocalAnalysis(data)
  }
}

function buildRAGPrompt(data: CombinedAnalysisData): string {
  const videoStress = data.videoAnalysis?.overall?.stress_score || 0
  const keystrokeStress = data.keystrokeAnalysis?.stress_score || data.keystrokeAnalysis?.stress_probability || 0
  const topEmotions = data.videoAnalysis?.overall?.top_emotions?.map(e => `${e.label} (${(e.prob * 100).toFixed(1)}%)`).join(", ") || "N/A"
  const typingSpeed = data.keystrokeFeatures?.chars_per_sec || 0
  const pauses = data.keystrokeFeatures?.pauses_gt_1000 || 0

  return `You are an expert psychologist and behavioral analyst. Analyze the following combined video emotion and keystroke pattern data:

QUESTION: ${data.questionText}
ANSWER: ${data.answerText}

VIDEO ANALYSIS:
- Overall Stress Score: ${(videoStress * 100).toFixed(1)}%
- Stress Detected: ${data.videoAnalysis?.overall?.stress ? "YES" : "NO"}
- Top Emotions: ${topEmotions}
- Valence (positive/negative): ${data.videoAnalysis?.overall?.valence?.toFixed(2) || "N/A"}
- Arousal (energy level): ${data.videoAnalysis?.overall?.arousal?.toFixed(2) || "N/A"}
${data.videoAnalysis?.windows ? `- Analysis Windows: ${data.videoAnalysis.windows.length} time segments analyzed` : ""}

KEYSTROKE PATTERN ANALYSIS:
- Keystroke Stress Score: ${(keystrokeStress * 100).toFixed(1)}%
- Stress Label: ${data.keystrokeAnalysis?.stress_label || "Unknown"}
- Typing Speed: ${typingSpeed.toFixed(2)} characters/second
- Long Pauses (>1s): ${pauses} pauses detected
- Average Dwell Time: ${data.keystrokeFeatures?.dwell_mean_ms?.toFixed(1) || "N/A"}ms
- Longest Pause: ${data.keystrokeFeatures?.longest_pause_ms || 0}ms

Provide a comprehensive RAG analysis in JSON format:
{
  "insights": "Overall psychological and behavioral insights combining video emotions and typing patterns",
  "emotion_summary": "Summary of emotional state based on video analysis",
  "behavior_patterns": "Analysis of typing behavior and its correlation with stress/emotions",
  "stress_indicators": ["indicator1", "indicator2", "indicator3"],
  "recommendations": ["recommendation1", "recommendation2"],
  "confidence_score": 0.85
}

Focus on:
1. Correlation between facial emotions and typing patterns
2. Stress indicators from both modalities
3. Behavioral consistency or discrepancies
4. Actionable insights for emotional well-being`
}

async function callOpenAI(prompt: string): Promise<RAGResponse> {
  const response = await fetch(`${LLM_API_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // or gpt-4, gpt-3.5-turbo
      messages: [
        {
          role: "system",
          content:
            "You are an expert behavioral psychologist analyzing combined video emotion and keystroke pattern data. Always respond with valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content || "{}"
  return JSON.parse(content) as RAGResponse
}

async function callAnthropic(prompt: string): Promise<RAGResponse> {
  const response = await fetch(`${LLM_API_BASE}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": LLM_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307", // or claude-3-opus, claude-3-sonnet
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`)
  }

  const data = await response.json()
  const content = data.content[0]?.text || "{}"
  
  // Extract JSON from response (may include markdown code blocks)
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content
  
  return JSON.parse(jsonStr) as RAGResponse
}

async function callCustomLLM(prompt: string): Promise<RAGResponse> {
  const response = await fetch(LLM_API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(LLM_API_KEY && { Authorization: `Bearer ${LLM_API_KEY}` }),
    },
    body: JSON.stringify({
      prompt,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    throw new Error(`Custom LLM API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data as RAGResponse
}

function generateLocalAnalysis(data: CombinedAnalysisData): RAGResponse {
  const videoStress = data.videoAnalysis?.overall?.stress_score || 0
  const keystrokeStress = data.keystrokeAnalysis?.stress_score || data.keystrokeAnalysis?.stress_probability || 0
  const avgStress = (videoStress + keystrokeStress) / 2
  
  const topEmotion = data.videoAnalysis?.overall?.top_emotions?.[0]?.label || "neutral"
  const typingSpeed = data.keystrokeFeatures?.chars_per_sec || 0
  const isStressed = avgStress > 0.5

  return {
    insights: `Combined analysis shows ${isStressed ? "elevated" : "normal"} stress levels. Video analysis indicates ${topEmotion} as the primary emotion, while keystroke patterns show ${typingSpeed < 1 ? "slow" : typingSpeed > 3 ? "fast" : "moderate"} typing speed.`,
    emotion_summary: `Primary emotion detected: ${topEmotion}. Stress level: ${(avgStress * 100).toFixed(1)}%. ${data.videoAnalysis?.overall?.valence && data.videoAnalysis.overall.valence > 0.5 ? "Positive" : "Negative"} valence, ${data.videoAnalysis?.overall?.arousal && data.videoAnalysis.overall.arousal > 0.5 ? "high" : "low"} arousal.`,
    behavior_patterns: `Typing speed of ${typingSpeed.toFixed(2)} chars/sec indicates ${typingSpeed < 1 ? "careful deliberation or stress" : typingSpeed > 3 ? "confident typing" : "normal pacing"}. ${data.keystrokeFeatures?.pauses_gt_1000 && data.keystrokeFeatures.pauses_gt_1000 > 3 ? "Multiple long pauses suggest hesitation or thoughtfulness." : "Smooth typing pattern observed."}`,
    stress_indicators: [
      avgStress > 0.6 ? "Elevated stress detected in both modalities" : "Stress levels within normal range",
      data.keystrokeFeatures?.pauses_gt_1000 && data.keystrokeFeatures.pauses_gt_1000 > 2 ? "Frequent typing pauses" : "Consistent typing rhythm",
      data.videoAnalysis?.overall?.stress ? "Facial stress indicators present" : "No significant facial stress",
    ],
    recommendations: [
      isStressed ? "Consider stress management techniques" : "Maintain current stress management approach",
      typingSpeed < 1 ? "Typing pace may indicate difficulty with question - consider support" : "Typing patterns appear normal",
    ],
    confidence_score: 0.75,
  }
}

