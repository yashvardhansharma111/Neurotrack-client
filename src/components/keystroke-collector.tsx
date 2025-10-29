"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { KeystrokeEvent } from "@/types/questionnaire"

export function KeystrokeCollector({
  onEventsChange,
  onTextChange,
  disabled = false,
}: {
  onEventsChange: (events: KeystrokeEvent[]) => void
  onTextChange?: (text: string) => void
  disabled?: boolean
}) {
  const [events, setEvents] = useState<KeystrokeEvent[]>([])
  const [text, setText] = useState("")
  const [isActive, setIsActive] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const startTimeRef = useRef<number | null>(null)

  const recordEvent = useCallback(
    (eventType: "keydown" | "keyup", key: string) => {
      const timestamp_ms = Date.now()
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp_ms
        setIsActive(true)
      }

      const event: KeystrokeEvent = {
        timestamp_ms,
        event_type: eventType,
        key: key.length === 1 ? key : key, // Keep special keys like "Backspace", "Enter", etc.
      }

      setEvents((prev) => {
        const updated = [...prev, event]
        onEventsChange(updated)
        return updated
      })
    },
    [onEventsChange],
  )

  useEffect(() => {
    if (disabled || !textareaRef.current) return

    const handleKeyDown = (e: KeyboardEvent) => {
      recordEvent("keydown", e.key)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      recordEvent("keyup", e.key)
    }

    const textarea = textareaRef.current
    textarea.addEventListener("keydown", handleKeyDown)
    textarea.addEventListener("keyup", handleKeyUp)

    return () => {
      textarea.removeEventListener("keydown", handleKeyDown)
      textarea.removeEventListener("keyup", handleKeyUp)
    }
  }, [disabled, recordEvent])

  const reset = () => {
    setEvents([])
    setText("")
    setIsActive(false)
    startTimeRef.current = null
    onEventsChange([])
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Type Your Answer</CardTitle>
            <CardDescription>Your keystroke patterns will be analyzed for stress detection</CardDescription>
          </div>
          {isActive && (
            <Badge variant="outline" className="animate-pulse">
              Recording
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            const newText = e.target.value
            setText(newText)
            onTextChange?.(newText)
          }}
          placeholder="Type your answer here..."
          className="min-h-[150px] resize-none"
          disabled={disabled}
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{events.length} keystroke events recorded</span>
          {isActive && (
            <span>
              Duration: {startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0}s
            </span>
          )}
        </div>
        {events.length > 0 && !disabled && (
          <button
            onClick={reset}
            className="text-xs text-muted-foreground hover:text-foreground underline"
            type="button"
          >
            Reset
          </button>
        )}
      </CardContent>
    </Card>
  )
}

