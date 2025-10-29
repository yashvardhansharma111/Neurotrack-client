Keystroke Stress Detection API

Base URL: https://<your-backend-domain>/keystrokes
Method: POST
Content-Type: application/json

🔹 Overview

This endpoint analyzes keystroke timing data from the typing session and predicts the user’s stress level based on a trained Random Forest model.

The frontend sends extracted typing features (as collected in Collector.tsx) — the backend returns:

A numeric stress probability or score (0–1)

A discrete stress label (Low / Medium / High)

📤 Request Body (JSON)

Each request corresponds to one typing session (one question answered).
You must send the same features that were used for training your model.

Example:
{
  "session_id": "c4cc4737-989d-41c2-8bc7-40b17fbdbddc",
  "user_id": "395139bb-64ab-4d70-a75a-82e8935ba156",
  "age": 20,
  "gender": "Male",
  "year_of_study": 4,
  "question_id": 1,
  "question_text": "Tell a short example of a recent class or college day that went well.",
  "window_start_ts": 1761586678544,
  "window_end_ts": 1761586700353,
  "features": {
    "duration_ms": 21809,
    "n_keydowns": 18,
    "n_keyups": 18,
    "chars_per_sec": 0.8253,
    "dwell_mean_ms": 130.5,
    "dwell_std_ms": 59.953,
    "dwell_median_ms": 123,
    "dwell_p10_ms": 73,
    "dwell_p90_ms": 178,
    "dd_mean_ms": 503.706,
    "dd_std_ms": 864.272,
    "dd_median_ms": 233,
    "pauses_gt_200": 6,
    "pauses_gt_500": 4,
    "pauses_gt_1000": 1,
    "longest_pause_ms": 3733,
    "backspace_count": 0,
    "cv_dwell": 0.4594,
    "cv_dd": 1.7158,
    "hist_bin_0": 5,
    "hist_bin_1": 10,
    "hist_bin_2": 14,
    "hist_bin_3": 2,
    "hist_bin_4": 3,
    "hist_bin_5": 1,
    "inter_entropy": 1.4781
  }
}

⚙️ Backend (ML) Flow Summary

Backend receives JSON payload.

Extracts the features dictionary.

Converts it into a model-ready vector (same feature order as training).

Runs prediction using Random Forest.

Returns the stress level classification + probability.

📥 Response Body (JSON)
Example:
{
  "ok": true,
  "session_id": "c4cc4737-989d-41c2-8bc7-40b17fbdbddc",
  "user_id": "395139bb-64ab-4d70-a75a-82e8935ba156",
  "stress_label": "High",
  "stress_score": 0.83,
  "stress_class": 4,
  "model_version": "rf_v1.0",
  "timestamp": "2025-10-29T23:45:00Z",
  "feature_importance": {
    "dwell_mean_ms": 0.22,
    "dd_mean_ms": 0.18,
    "inter_entropy": 0.12,
    "chars_per_sec": 0.10,
    "pauses_gt_500": 0.08
  }
}

📊 Response Fields Explained
Field	Type	Description
ok	boolean	True if prediction succeeded
session_id	string	Unique typing session ID
user_id	string	User identifier
stress_label	string	Human-readable stress classification (Low, Medium, or High)
stress_score	float	Model confidence in stress (0–1, where 1 = very stressed)
stress_class	integer	Encoded class (e.g., 0=Low, 1=Medium, 2=High)
model_version	string	Version of the deployed Random Forest model
timestamp	string	UTC time when prediction was made
feature_importance	object	Optional — relative importance of top features influencing the prediction
📈 Stress Label Mapping
stress_score range	stress_label	Description
0.00–0.33	Low	Calm, normal typing behavior
0.34–0.66	Medium	Slight tension or moderate stress
0.67–1.00	High	High stress, irregular typing rhythm
🧩 Error Responses
Example 1: Missing features
{
  "ok": false,
  "error": "Missing or invalid 'features' field."
}

Example 2: Model failure
{
  "ok": false,
  "error": "Model inference error: input shape mismatch"
}

🔒 Optional Headers

For internal or protected APIs:

Authorization: Bearer <your_api_key>
Content-Type: application/json

🧑‍💻 Frontend Usage Example
await fetch("https://api.yourdomain.com/keystrokes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(sessionPayload),
})
.then(res => res.json())
.then(data => {
  console.log("Predicted stress level:", data.stress_label, "Score:", data.stress_score);
});

✅ Summary
Action	Endpoint	Method	Input	Output
Predict stress level from typing	/keystrokes	POST	Keystroke features JSON	Stress label, score, and metadata