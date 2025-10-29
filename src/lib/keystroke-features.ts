import type { KeystrokeEvent, KeystrokeFeatures } from "@/types/questionnaire"

export function calculateKeystrokeFeatures(
  events: KeystrokeEvent[],
  startTime: number,
  endTime: number,
): KeystrokeFeatures {
  if (events.length === 0) {
    return createEmptyFeatures(endTime - startTime)
  }

  const duration_ms = endTime - startTime

  // Separate keydowns and keyups
  const keydowns = events.filter((e) => e.event_type === "keydown")
  const keyups = events.filter((e) => e.event_type === "keyup")
  const n_keydowns = keydowns.length
  const n_keyups = keyups.length

  // Match keydowns with keyups to calculate dwell times
  const dwellTimes: number[] = []
  const keydownMap = new Map<string, KeystrokeEvent>()

  for (const event of events) {
    if (event.event_type === "keydown") {
      keydownMap.set(event.key, event)
    } else if (event.event_type === "keyup") {
      const keydown = keydownMap.get(event.key)
      if (keydown) {
        const dwell = event.timestamp_ms - keydown.timestamp_ms
        if (dwell > 0 && dwell < 5000) {
          // Filter out unrealistic values
          dwellTimes.push(dwell)
        }
        keydownMap.delete(event.key)
      }
    }
  }

  // Calculate digraph times (time between keyup and next keydown)
  const digraphTimes: number[] = []
  for (let i = 0; i < events.length - 1; i++) {
    if (events[i].event_type === "keyup" && events[i + 1].event_type === "keydown") {
      const dd = events[i + 1].timestamp_ms - events[i].timestamp_ms
      if (dd > 0 && dd < 10000) {
        // Filter unrealistic values
        digraphTimes.push(dd)
      }
    }
  }

  // Calculate pauses (between keyups)
  const pauses: number[] = []
  for (let i = 0; i < events.length - 1; i++) {
    if (events[i].event_type === "keyup" && events[i + 1].event_type === "keydown") {
      pauses.push(events[i + 1].timestamp_ms - events[i].timestamp_ms)
    }
  }

  // Helper functions for statistics
  const mean = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)
  const std = (arr: number[]) => {
    if (arr.length === 0) return 0
    const m = mean(arr)
    const variance = arr.reduce((acc, val) => acc + Math.pow(val - m, 2), 0) / arr.length
    return Math.sqrt(variance)
  }
  const median = (arr: number[]) => {
    if (arr.length === 0) return 0
    const sorted = [...arr].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  }
  const percentile = (arr: number[], p: number) => {
    if (arr.length === 0) return 0
    const sorted = [...arr].sort((a, b) => a - b)
    const idx = Math.floor((sorted.length - 1) * p)
    return sorted[idx]
  }

  const dwell_mean_ms = mean(dwellTimes)
  const dwell_std_ms = std(dwellTimes)
  const dwell_median_ms = median(dwellTimes)
  const dwell_p10_ms = percentile(dwellTimes, 0.1)
  const dwell_p90_ms = percentile(dwellTimes, 0.9)

  const dd_mean_ms = mean(digraphTimes)
  const dd_std_ms = std(digraphTimes)
  const dd_median_ms = median(digraphTimes)

  const pauses_gt_200 = pauses.filter((p) => p > 200).length
  const pauses_gt_500 = pauses.filter((p) => p > 500).length
  const pauses_gt_1000 = pauses.filter((p) => p > 1000).length
  const longest_pause_ms = pauses.length > 0 ? Math.max(...pauses) : 0

  const backspace_count = events.filter((e) => e.key === "Backspace").length

  const cv_dwell = dwell_mean_ms > 0 ? dwell_std_ms / dwell_mean_ms : 0
  const cv_dd = dd_mean_ms > 0 ? dd_std_ms / dd_mean_ms : 0

  // Histogram bins for dwell times (bins: 0-100, 100-150, 150-200, 200-250, 250-300, 300+)
  const hist_bins = [0, 0, 0, 0, 0, 0]
  for (const dwell of dwellTimes) {
    if (dwell < 100) hist_bins[0]++
    else if (dwell < 150) hist_bins[1]++
    else if (dwell < 200) hist_bins[2]++
    else if (dwell < 250) hist_bins[3]++
    else if (dwell < 300) hist_bins[4]++
    else hist_bins[5]++
  }

  // Inter-entropy (simplified - based on key diversity)
  const uniqueKeys = new Set(events.map((e) => e.key)).size
  const totalKeys = events.length
  const inter_entropy = totalKeys > 0 ? -Math.log(uniqueKeys / totalKeys) : 0

  const chars_per_sec = duration_ms > 0 ? (n_keydowns / duration_ms) * 1000 : 0

  return {
    duration_ms,
    n_keydowns,
    n_keyups,
    chars_per_sec,
    dwell_mean_ms,
    dwell_std_ms,
    dwell_median_ms,
    dwell_p10_ms,
    dwell_p90_ms,
    dd_mean_ms,
    dd_std_ms,
    dd_median_ms,
    pauses_gt_200,
    pauses_gt_500,
    pauses_gt_1000,
    longest_pause_ms,
    backspace_count,
    cv_dwell,
    cv_dd,
    hist_bin_0: hist_bins[0],
    hist_bin_1: hist_bins[1],
    hist_bin_2: hist_bins[2],
    hist_bin_3: hist_bins[3],
    hist_bin_4: hist_bins[4],
    hist_bin_5: hist_bins[5],
    inter_entropy,
  }
}

function createEmptyFeatures(duration_ms: number): KeystrokeFeatures {
  return {
    duration_ms,
    n_keydowns: 0,
    n_keyups: 0,
    chars_per_sec: 0,
    dwell_mean_ms: 0,
    dwell_std_ms: 0,
    dwell_median_ms: 0,
    dwell_p10_ms: 0,
    dwell_p90_ms: 0,
    dd_mean_ms: 0,
    dd_std_ms: 0,
    dd_median_ms: 0,
    pauses_gt_200: 0,
    pauses_gt_500: 0,
    pauses_gt_1000: 0,
    longest_pause_ms: 0,
    backspace_count: 0,
    cv_dwell: 0,
    cv_dd: 0,
    hist_bin_0: 0,
    hist_bin_1: 0,
    hist_bin_2: 0,
    hist_bin_3: 0,
    hist_bin_4: 0,
    hist_bin_5: 0,
    inter_entropy: 0,
  }
}

