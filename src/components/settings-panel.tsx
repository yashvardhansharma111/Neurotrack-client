"use client"

import { useId } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export type SettingsState = {
  sampleEvery: number
  conf: number
  maxFaces: number
  returnBoxes: boolean
  smoothK: number
  topk: number
  minFaceSize: number
}

export function SettingsPanel({
  value,
  onChange,
}: {
  value: SettingsState
  onChange: (v: SettingsState) => void
}) {
  const ids = {
    sample: useId(),
    conf: useId(),
    maxFaces: useId(),
    boxes: useId(),
    smoothK: useId(),
    minSize: useId(),
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={ids.sample}>Sample Every (seconds)</Label>
        <Input
          id={ids.sample}
          type="number"
          min={1}
          step={1}
          value={value.sampleEvery}
          onChange={(e) => onChange({ ...value, sampleEvery: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.conf}>Confidence ({value.conf.toFixed(2)})</Label>
        <Slider
          id={ids.conf}
          min={0.05}
          max={0.5}
          step={0.01}
          value={[value.conf]}
          onValueChange={([v]) => onChange({ ...value, conf: v })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.maxFaces}>Max Faces</Label>
        <Select value={String(value.maxFaces)} onValueChange={(v) => onChange({ ...value, maxFaces: Number(v) })}>
          <SelectTrigger id={ids.maxFaces}>
            <SelectValue placeholder="Max faces" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 (default)</SelectItem>
            <SelectItem value="0">0 (all)</SelectItem>
            <SelectItem value="2">2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label htmlFor={ids.boxes}>Return Boxes</Label>
          <p className="text-xs text-muted-foreground">Include face bounding boxes</p>
        </div>
        <Switch
          id={ids.boxes}
          checked={value.returnBoxes}
          onCheckedChange={(v) => onChange({ ...value, returnBoxes: v })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.smoothK}>Smooth k</Label>
        <Input
          id={ids.smoothK}
          type="number"
          min={0}
          step={1}
          value={value.smoothK}
          onChange={(e) => onChange({ ...value, smoothK: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.minSize}>Min Face Size (px)</Label>
        <Input
          id={ids.minSize}
          type="number"
          min={1}
          step={1}
          value={value.minFaceSize}
          onChange={(e) => onChange({ ...value, minFaceSize: Number(e.target.value) })}
        />
      </div>
    </div>
  )
}
