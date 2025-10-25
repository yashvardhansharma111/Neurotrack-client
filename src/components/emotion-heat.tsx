"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyzeResponse } from "@/types/analyze"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"

export function EmotionHeat({ data }: { data: AnalyzeResponse }) {
  const stats = data.overall.per_label_stats || []
  if (!stats.length) {
    return (
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle>Emotion Heat</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No aggregate emotion stats available.</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = stats.map((s) => ({
    name: s.label,
    mean: s.mean ?? 0,
  }))

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle>Emotion Heat</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="mean" fill="oklch(var(--chart-2))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
