"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { KeystrokeEvent } from "@/types/questionnaire";
import { Video, Keyboard, Loader2 } from "lucide-react";

export function SimultaneousRecorder({
  seconds = 20,
  onRecorded,
  onKeystrokeEventsChange,
  onAnswerTextChange,
  onRecordingChange,
  disabled = false,
}: {
  seconds?: number;
  onRecorded: (blob: Blob) => void;
  onKeystrokeEventsChange: (events: KeystrokeEvent[]) => void;
  onAnswerTextChange?: (text: string) => void;
  onRecordingChange?: (recording: boolean) => void;
  disabled?: boolean;
}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [count, setCount] = useState(seconds);
  const [keystrokeEvents, setKeystrokeEvents] = useState<KeystrokeEvent[]>([]);
  const [answerText, setAnswerText] = useState("");
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const callbackRef = useRef(onKeystrokeEventsChange);
  const prevEventsLengthRef = useRef(0);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = onKeystrokeEventsChange;
  }, [onKeystrokeEventsChange]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  // Sync keystroke events to parent via useEffect to avoid setState during render
  // Only call if events actually changed (length or content)
  useEffect(() => {
    // Only sync if we have events and the length changed (new event added)
    if (
      keystrokeEvents.length !== prevEventsLengthRef.current &&
      keystrokeEvents.length > 0
    ) {
      prevEventsLengthRef.current = keystrokeEvents.length;
      // Defer to next tick to avoid setState during render
      const timeoutId = setTimeout(() => {
        callbackRef.current(keystrokeEvents);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [keystrokeEvents]);

  // Record keystroke events
  useEffect(() => {
    if (disabled || !textareaRef.current || !recording) return;

    const recordEvent = (eventType: "keydown" | "keyup", key: string) => {
      const timestamp_ms = Date.now();
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp_ms;
        setIsActive(true);
      }

      const event: KeystrokeEvent = {
        timestamp_ms,
        event_type: eventType,
        key: key.length === 1 ? key : key,
      };

      setKeystrokeEvents((prev) => [...prev, event]);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      recordEvent("keydown", e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      recordEvent("keyup", e.key);
    };

    const textarea = textareaRef.current;
    textarea.addEventListener("keydown", handleKeyDown);
    textarea.addEventListener("keyup", handleKeyUp);

    return () => {
      textarea.removeEventListener("keydown", handleKeyDown);
      textarea.removeEventListener("keyup", handleKeyUp);
    };
  }, [disabled, recording]);

  async function start() {
    setPermissionError(null);
    setAnswerText("");
    setKeystrokeEvents([]);
    setIsActive(false);
    startTimeRef.current = null;
    prevEventsLengthRef.current = 0; // Reset event counter

    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
        await videoRef.current.play();
      }
      const rec = new MediaRecorder(media, {
        mimeType: "video/webm;codecs=vp9",
      });
      recorderRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        onRecorded(blob);
        // Notify parent of final answer text
        if (onAnswerTextChange) {
          onAnswerTextChange(answerText);
        }
        media.getTracks().forEach((t) => t.stop());
        setStream(null);
      };
      rec.start();
      setRecording(true);
      if (onRecordingChange) onRecordingChange(true);
      setCount(seconds);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setCount((c) => {
          if (c <= 1) {
            if (recorderRef.current?.state === "recording")
              recorderRef.current.stop();
            if (timerRef.current) window.clearInterval(timerRef.current);
            setRecording(false);
            if (onRecordingChange) onRecordingChange(false);
            setIsActive(false);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (e: any) {
      setPermissionError("Camera permission denied or not available.");
    }
  }

  function cancel() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (recorderRef.current && recorderRef.current.state === "recording")
      recorderRef.current.stop();
    stream?.getTracks().forEach((t) => t.stop());
    setRecording(false);
    if (onRecordingChange) onRecordingChange(false);
    setIsActive(false);
    startTimeRef.current = null;
    prevEventsLengthRef.current = 0; // Reset event counter
  }

  return (
    <Card className="rounded-2xl border-2 border-border/50 shadow-lg">
      <CardContent className="p-4 space-y-4">
        {/* Video Preview - user-friendly with clear instructions */}
        <div className="relative overflow-hidden rounded-xl border-2 border-border/60 bg-gradient-to-br from-black/40 to-black/20 shadow-inner">
          <video
            ref={videoRef}
            className="w-full aspect-video object-cover"
            muted
            playsInline
          />

          {/* Face alignment guide - circular and properly sized */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className={`rounded-full border-2 ${
                recording ? "border-white/40" : "border-blue-400/60"
              } ${
                recording ? "h-32 w-32" : "h-36 w-36"
              } transition-all duration-300`}
              aria-hidden
            />
          </div>

          {/* Instructions overlay when not recording */}
          {!recording && !stream && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="text-center px-4 py-2">
                <Video className="h-6 w-6 mx-auto mb-2 text-white/80" />
                <p className="text-white text-sm font-medium mb-1">
                  Camera Preview
                </p>
                <p className="text-white/70 text-xs">
                  Position your face in the circle
                </p>
              </div>
            </div>
          )}

          {/* Live preview indicator when streaming but not recording */}
          {!recording && stream && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Live Preview
            </div>
          )}

          {/* Timer overlay - larger and more visible */}
          {recording && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-xl animate-pulse flex items-center gap-2 backdrop-blur-sm border border-white/20">
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              <span className="min-w-[2rem] text-center">{count}s</span>
            </div>
          )}

          {/* Recording indicator - more prominent */}
          {recording && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl border border-white/20">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              REC
            </div>
          )}
        </div>

        {/* Typing Area - more compact */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Keyboard className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-sm font-semibold">Type Your Answer</span>
              </div>
            </div>
            {isActive && (
              <Badge variant="default" className="animate-pulse bg-green-600">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-ping" />
                Recording keystrokes
              </Badge>
            )}
          </div>
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={answerText}
              onChange={(e) => {
                const newText = e.target.value;
                setAnswerText(newText);
                // Notify parent of text changes - defer to avoid render issues
                if (onAnswerTextChange) {
                  setTimeout(() => {
                    onAnswerTextChange(newText);
                  }, 0);
                }
              }}
              placeholder={
                recording
                  ? "Start typing your answer here...\n\nExpress your thoughts naturally. Your typing patterns and facial expressions will be analyzed together."
                  : "Click 'Start Recording & Typing' to begin. The text area will become active once recording starts."
              }
              className="min-h-[140px] resize-none text-sm leading-relaxed border-2 focus:border-primary/50 transition-colors bg-background/50 backdrop-blur-sm"
              disabled={disabled || !recording}
            />
            {!recording && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/40 rounded-lg border-2 border-dashed border-primary/30 pointer-events-none backdrop-blur-[1px]">
                <div className="text-center p-3">
                  <Keyboard className="h-5 w-5 mx-auto mb-2 text-primary/60" />
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Ready to Type
                  </p>
                  <p className="text-[10px] text-muted-foreground/80">
                    Start recording to begin
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-muted/50 p-2.5 border border-border/50">
              <p className="text-muted-foreground mb-0.5 text-[10px]">
                Characters
              </p>
              <p className="text-base font-bold text-foreground">
                {answerText.length}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2.5 border border-border/50">
              <p className="text-muted-foreground mb-0.5 text-[10px]">
                Keystroke Events
              </p>
              <p className="text-base font-bold text-foreground">
                {keystrokeEvents.length}
              </p>
            </div>
          </div>
        </div>

        {/* Controls with enhanced design */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          {!recording ? (
            <Button
              onClick={start}
              className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/90"
              disabled={disabled}
              size="lg"
            >
              <Video className="h-5 w-5 mr-2" />
              Start Recording & Typing
            </Button>
          ) : (
            <>
              <Button
                variant="destructive"
                onClick={cancel}
                className="w-full h-12 text-base font-semibold shadow-lg"
                disabled={disabled}
                size="lg"
              >
                ⏹ Stop Recording
              </Button>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">Recording Progress</span>
                  <span className="text-muted-foreground">
                    {count}s remaining
                  </span>
                </div>
                <Progress
                  value={((seconds - count) / seconds) * 100}
                  className="h-3 bg-muted/50"
                />
                <p
                  className="text-xs text-center text-muted-foreground"
                  aria-live="polite"
                >
                  🎥 Recording video • ⌨️ Tracking keystrokes • {count}s
                  remaining
                </p>
              </div>
            </>
          )}
        </div>

        {permissionError && (
          <Alert variant="destructive">
            <AlertTitle>Camera Error</AlertTitle>
            <AlertDescription>{permissionError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
