import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyzeResponse } from "@/types/analyze"

export function TopEmotions({ data }: { data: AnalyzeResponse }) {
  const tops = (data.overall.top_emotions || []).slice(0, 3)

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle>Top Emotions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {tops.map((t, i) => (
          <div key={i} className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium capitalize">{t.label}</p>
              <p className="text-xs text-muted-foreground">{(t.probability * 100).toFixed(0)}%</p>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded bg-muted">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min(100, Math.max(0, t.probability * 100))}%` }}
              />
            </div>
          </div>
        ))}
        {tops.length === 0 && <p className="text-sm text-muted-foreground">No emotions returned.</p>}
      </CardContent>
    </Card>
  )
}
