import type { QuestionnaireSession } from "@/types/questionnaire"

const STORAGE_KEY = "neurotrack_questionnaire_session"

export function saveSession(session: QuestionnaireSession): void {
  try {
    // Convert Blob to a serializable format
    const serializedSession = {
      ...session,
      answers: session.answers.map((answer) => ({
        ...answer,
        videoBlob: answer.videoBlob ? "blob_placeholder" : null, // Can't serialize Blob, store separately if needed
      })),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedSession))
  } catch (error) {
    console.error("Failed to save session:", error)
  }
}

export function loadSession(): QuestionnaireSession | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as QuestionnaireSession
  } catch (error) {
    console.error("Failed to load session:", error)
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getSessionId(): string {
  const session = loadSession()
  return session?.sessionId || ""
}

