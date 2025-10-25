import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { AnalyzeResponse } from "@/types/analyze"

export function ResultsSummary({ data }: { data: AnalyzeResponse }) {
  const verdict = data.overall.stress ? "STRESSED" : "NOT STRESSED"
  const score = Math.max(0, Math.min(1, data.overall.stress_score))
  const valence = Math.max(0, Math.min(1, data.overall.valence ?? 0.5))
  const arousal = Math.max(0, Math.min(1, data.overall.arousal ?? 0.5))

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        <div>
          <p className="text-sm text-muted-foreground">Overall Verdict</p>
          <Badge variant={data.overall.stress ? "destructive" : "default"} className="mt-1">
            {verdict}
          </Badge>
          <div className="mt-4">
            <p className="text-sm font-medium">Stress Score</p>
            <div className="mt-1 flex items-center gap-3">
              <Progress value={score * 100} className="h-2 flex-1" />
              <span className="text-xs text-muted-foreground">{(score * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium">Valence</p>
          <div className="mt-1 flex items-center gap-3">
            <Progress value={valence * 100} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground">{(valence * 100).toFixed(0)}%</span>
          </div>
          <p className="mt-4 text-sm font-medium">Arousal</p>
          <div className="mt-1 flex items-center gap-3">
            <Progress value={arousal * 100} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground">{(arousal * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Windows</p>
          <div className="mt-1 text-sm">
            Returned:{" "}
            <span className="font-medium">{data.meta?.windowing?.returned_windows ?? data.windows.length}</span>
          </div>
          <div className="text-sm">
            Expected: <span className="font-medium">{data.meta?.windowing?.expected_windows ?? "—"}</span>
          </div>
          <div className="text-sm">
            Duration: <span className="font-medium">{data.meta?.video?.duration_s?.toFixed?.(2) ?? "—"}s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
