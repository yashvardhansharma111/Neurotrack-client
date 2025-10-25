export type TopEmotion = {
  label: string
  probability: number
}

export type PerLabelStat = {
  label: string
  mean?: number
  std?: number
}

export type WindowEntry = {
  window_index: number
  t_start: number
  t_center?: number
  faces: number
  entropy?: number
  emotion_probs?: number[]
  top_emotions?: TopEmotion[]
  stress_score: number
  stress: boolean
  boxes?: Array<{ x: number; y: number; w: number; h: number }>
}

export type AnalyzeResponse = {
  meta?: {
    device?: string
    labels?: string[]
    video?: { fps?: number; frames?: number; duration_s?: number }
    windowing?: { sample_every_s?: number; expected_windows?: number; returned_windows?: number }
    stress?: { weights?: any; threshold?: number }
  }
  windows: WindowEntry[]
  overall: {
    top_emotions: TopEmotion[]
    per_label_stats?: PerLabelStat[]
    stress_score: number
    stress: boolean
    valence?: number
    arousal?: number
  }
}
