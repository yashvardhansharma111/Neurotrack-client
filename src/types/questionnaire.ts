export type KeystrokeEvent = {
  timestamp_ms: number
  event_type: "keydown" | "keyup"
  key: string
}

export type KeystrokeFeatures = {
  duration_ms: number
  n_keydowns: number
  n_keyups: number
  chars_per_sec: number
  dwell_mean_ms: number
  dwell_std_ms: number
  dwell_median_ms: number
  dwell_p10_ms: number
  dwell_p90_ms: number
  dd_mean_ms: number
  dd_std_ms: number
  dd_median_ms: number
  pauses_gt_200: number
  pauses_gt_500: number
  pauses_gt_1000: number
  longest_pause_ms: number
  backspace_count: number
  cv_dwell: number
  cv_dd: number
  hist_bin_0: number
  hist_bin_1: number
  hist_bin_2: number
  hist_bin_3: number
  hist_bin_4: number
  hist_bin_5: number
  inter_entropy: number
}

export type QuestionnaireAnswer = {
  questionId: number
  questionText: string
  answerText: string
  videoBlob: Blob | null
  videoAnalysis: any | null // AnalyzeResponse from /analyze-video
  keystrokeEvents: KeystrokeEvent[]
  keystrokeFeatures: KeystrokeFeatures | null
  keystrokeAnalysis: any | null // Response from /keystroke
  timestamp: number
  window_start_ts: number
  window_end_ts: number
}

export type QuestionnaireSession = {
  sessionId: string
  userId: string
  age?: number
  gender?: string
  year_of_study?: number
  startedAt: number
  completedAt?: number
  answers: QuestionnaireAnswer[]
  currentQuestionIndex: number
}

