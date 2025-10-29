NeuroTrack — API README (frontend developer)

Short, implementation-ready README for frontend developers.
This describes how to call the inference API endpoints, what requests to send, and what JSON responses to expect. It does not explain model internals — only the request/response contract your frontend needs.

Table of contents

Overview

Base URL

Endpoints

GET /health

POST /analyze-video (video file → windowed emotion & stress analysis)

POST /analyze-image (single image → emotion & stress analysis)

POST /keystroke (keystroke model — JSON)

Response shape (example)

Frontend examples (fetch)

Error handling & timeouts

Practical tips & limits

Overview

The NeuroTrack API accepts video or image uploads and returns per-window emotion probabilities, stress scores, and overall summary statistics. It also exposes a keystroke route to send typing-session features and receive a keystroke-based stress prediction (JSON).

All endpoints are standard HTTP endpoints; video/image endpoints expect multipart/form-data file uploads. Responses are JSON.

Base URL

Use whichever base URL your server is hosted at, e.g.:

https://your-server.example.com


Example full endpoints:

https://your-server.example.com/health

https://your-server.example.com/analyze-video

https://your-server.example.com/analyze-image

https://your-server.example.com/keystroke

(Adjust host/port in development: http://localhost:8000.)

GET /health

Quick service check.

Request

GET /health


Response (200 OK) — JSON

{
  "ok": true,
  "device": "cuda",
  "labels": ["angry","disgust","fear","happy","neutral","sad","surprise"],
  "models_path": "/app/models",
  "server_time": "2025-10-28 12:00:00"
}

POST /analyze-video

Send a video file; the service analyzes frames at fixed windows and returns per-window emotion probabilities, stress scores, and overall summary.

Request (multipart/form-data)

file — video file (mp4, mov, webm...)

sample_every_s (optional, number) — seconds between sampled frames (default 2.0)

conf (optional, number) — detector confidence threshold (default 0.25)

maxFaces (optional, integer) — 0 = all faces, otherwise largest N faces (default 1)

return_boxes (optional, 0/1) — include face box coordinates in response (default 0)

smooth_k (optional, integer) — smoothing window for temporal averaging (default 1)

topk (optional, integer) — how many top emotions to include per window/overall (default 3)

min_face_size (optional, integer) — ignore tiny detections (default 20)

Example form fields:

file: <video.mp4>
sample_every_s: 2.0
conf: 0.25
maxFaces: 1
return_boxes: 0
smooth_k: 1
topk: 3
min_face_size: 20


Response (200 OK) — JSON (high-level)

{
  "meta": { /* meta info: device, labels, video metadata, windowing, stress config */ },
  "windows": [
    {
      "window_index": 0,
      "t_start": 0,
      "t_center": 1,
      "faces": 1,
      "entropy": 1.11,
      "emotion_probs": [0.43, 0.001, 0.057, 0.45, 0.012, 0.041, 0.006],
      "top_emotions": [{"label":"happy","prob":0.45}, {"label":"angry","prob":0.43}],
      "stress_score": 0.445,
      "stress": false
    },
    /* ... per-window items ... */
  ],
  "overall": {
    "top_emotions": [{"label":"angry","prob":0.47}, {"label":"happy","prob":0.396}],
    "per_label_stats": [ /* mean/std/min/max per label */ ],
    "stress_score": 0.551,
    "stress": true,
    "valence": -0.153,
    "arousal": 0.689
  }
}


Notes

windows is an array of time-ordered results (one item per sampled window).

emotion_probs aligns positionally with meta.labels.

stress is a boolean (true if stress score ≥ threshold).

entropy is informational (higher = more uncertainty across emotions).

POST /analyze-image

For single-image testing.

Request (multipart/form-data)

file — image file (jpg/png)

conf, maxFaces, return_boxes, min_face_size, topk — same meanings as above

Response (200 OK) — JSON (single-window style)

{
  "labels": ["angry","disgust","fear","happy","neutral","sad","surprise"],
  "faces": 1,
  "entropy": 0.53,
  "emotion_probs": [0.1, 0.01, 0.02, 0.8, 0.03, 0.03, 0.01],
  "top_emotions": [{"label":"happy","prob":0.8}, {"label":"angry","prob":0.1}],
  "stress_score": 0.02,
  "stress": false,
  "valence": 0.6,
  "arousal": 0.4
}

POST /keystroke

Keystroke-based stress model endpoint. Send one typing-session (extracted features and optionally raw events); get a prediction and metadata back.

Request (JSON) — Content-Type: application/json

{
  "session_id": "uuid-v4",
  "user_id": "uuid-v4",
  "age": 21,
  "gender": "Male",
  "year_of_study": 3,
  "question_id": 1,
  "question_text": "Tell a short example...",
  "prompt_context": "Q1",
  "window_start_ts": 1698500000000,
  "window_end_ts": 1698500020000,
  "features": {
    "duration_ms": 20000,
    "n_keydowns": 40,
    "n_keyups": 40,
    "chars_per_sec": 2.0,
    "dwell_mean_ms": 120.5,
    "dwell_std_ms": 30.2,
    "dd_mean_ms": 200.1,
    "pauses_gt_200": 3,
    "longest_pause_ms": 1200,
    "hist_bin_0": 5,
    "hist_bin_1": 10
    /* ... other features as per CSV schema ... */
  },
  "raw_events": [
    {"timestamp_ms": 1698500000234, "event_type": "keydown", "key": "T"},
    {"timestamp_ms": 1698500000290, "event_type": "keyup", "key": "T"}
    /* ... */
  ]
}


Response (200 OK) — JSON

{
  "session_id": "uuid-v4",
  "user_id": "uuid-v4",
  "keystroke_prediction": {
    "stress_probability": 0.72,
    "stress_label": "high",      // low / medium / high (example categorical)
    "score": 0.72
  },
  "explanation": {
    "top_features": [
      {"feature": "chars_per_sec", "value": 2.0, "impact": 0.12},
      {"feature": "pauses_gt_1000", "value": 1, "impact": 0.08}
    ]
  },
  "received_at": "2025-10-28T12:34:56Z"
}


Notes

keystroke_prediction.score is a float (0–1). stress_label is a convenience categorical label.

explanation.top_features is optional — present if the model can provide lightweight feature-level signals for debugging.

Frontend examples
A. Upload video (browser fetch, multipart/form-data)
async function analyzeVideo(file) {
  const url = "https://your-server.example.com/analyze-video";
  const form = new FormData();
  form.append("file", file);
  form.append("sample_every_s", "2.0");
  form.append("conf", "0.25");
  form.append("maxFaces", "1");
  form.append("return_boxes", "0");
  form.append("smooth_k", "1");
  form.append("topk", "3");

  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) throw new Error("Video analysis failed");
  const json = await res.json();
  return json;
}

// Usage: pass a File object from <input type="file" />

B. Upload image
async function analyzeImage(file) {
  const form = new FormData();
  form.append("file", file);
  form.append("conf", "0.25");
  form.append("maxFaces", "1");
  const res = await fetch("https://your-server.example.com/analyze-image", { method: "POST", body: form });
  return await res.json();
}

C. Send keystroke session (JSON)
async function sendKeystroke(sessionPayload) {
  const res = await fetch("https://your-server.example.com/keystroke", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sessionPayload),
  });
  if (!res.ok) throw new Error("Keystroke API error");
  return await res.json();
}

Error handling & timeouts

Video analysis can be CPU-heavy — set a client-side timeout large enough (e.g. 60–120s) for longer uploads.

Check for non-200 responses and inspect response.status and JSON error message.

Server may return 400 for malformed requests or 500 for internal errors. Handle gracefully with retry/backoff if appropriate.

Practical tips

Send sample_every_s ≈ 1.0–3.0 for reasonable temporal resolution. Smaller → more windows → longer processing time.

For real-time or many concurrent uploads, run the API on a GPU-enabled server (if available) or reduce sample_every_s.

Always test on sample videos first to confirm the expected number of windows (duration // sample_every_s).

For UI presentation: map windows to a timeline (time → emotion distribution + stress flag). Show per-window top emotion + stress indicator.

Appendix — quick response glossary

meta.labels — ordered list of emotion labels; emotion_probs arrays align with this order.

windows — per-time-window analysis (time offset, face count, emotion probs, stress score/flag).

overall — aggregated statistics across windows (top emotions, per-label stats, averaged stress score).

entropy — uncertainty measure for a given window (informational).

stress_score — float in [0,1]; stress boolean derived from threshold.