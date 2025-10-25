"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AnalyzeResponse } from "@/types/analyze"

export function WindowsTable({ data }: { data: AnalyzeResponse }) {
  const rows = data.windows || []
  const stressSeries = useMemo(() => rows.map((w) => w.stress_score), [rows])

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle>Windows</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[420px] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                <th>#</th>
                <th>t_start</th>
                <th>faces</th>
                <th>stress</th>
                <th>score</th>
                <th>entropy</th>
                <th>top_emotions</th>
              </tr>
            </thead>
            <tbody className="[&>tr>td]:px-3 [&>tr>td]:py-2">
              {rows.map((w) => (
                <tr key={w.window_index} className="border-t">
                  <td>{w.window_index}</td>
                  <td>{w.t_start?.toFixed?.(2) ?? w.t_start}</td>
                  <td>{w.faces}</td>
                  <td>
                    <Badge variant={w.stress ? "destructive" : "default"}>{w.stress ? "STRESS" : "OK"}</Badge>
                  </td>
                  <td>{w.stress_score.toFixed(3)}</td>
                  <td>{(w.entropy ?? 0).toFixed(3)}</td>
                  <td className="truncate">
                    {(w.top_emotions || []).map((e) => `${e.label} ${(e.probability * 100).toFixed(0)}%`).join(", ")}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                    No windows returned.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Optional tiny sparkline could go here; keeping lightweight per spec */}
      </CardContent>
    </Card>
  )
}
