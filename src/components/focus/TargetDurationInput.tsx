'use client'

// HIG: Clarity — ユーザーが迷わず時間を選択できる。プリセット優先・カスタムも可
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { minutesToSeconds } from '@/lib/time/duration'
import { DURATION_PRESETS_MINUTES } from '@/lib/constants/duration'

type Props = {
  value: number // seconds
  onChange: (seconds: number) => void
  disabled?: boolean
}

export function TargetDurationInput({ value, onChange, disabled }: Props) {
  const [customMinutes, setCustomMinutes] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const currentMinutes = Math.floor(value / 60)
  const isPreset = DURATION_PRESETS_MINUTES.includes(
    currentMinutes as (typeof DURATION_PRESETS_MINUTES)[number]
  )

  function handlePreset(minutes: number) {
    setShowCustom(false)
    setCustomMinutes('')
    onChange(minutesToSeconds(minutes))
  }

  function handleCustomSubmit() {
    const mins = parseInt(customMinutes, 10)
    if (!isNaN(mins) && mins >= 1 && mins <= 720) {
      onChange(minutesToSeconds(mins))
    }
  }

  return (
    <div data-tutorial="duration-input" className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        目標時間
      </p>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {DURATION_PRESETS_MINUTES.map((minutes) => {
          const isSelected = !showCustom && currentMinutes === minutes
          return (
            <Button
              key={minutes}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              className="min-h-[44px] px-4 rounded-lg"
              onClick={() => handlePreset(minutes)}
              disabled={disabled}
              aria-pressed={isSelected}
            >
              {minutes}分
            </Button>
          )
        })}
        <Button
          variant={showCustom || (!isPreset && value > 0) ? 'default' : 'outline'}
          size="sm"
          className="min-h-[44px] px-4 rounded-lg"
          onClick={() => setShowCustom(!showCustom)}
          disabled={disabled}
        >
          カスタム
        </Button>
      </div>

      {/* Custom input */}
      {showCustom && (
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="custom-duration" className="text-xs text-muted-foreground">
              分数（1〜720）
            </Label>
            <Input
              id="custom-duration"
              type="number"
              min={1}
              max={720}
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
              placeholder="例: 45"
              className="rounded-lg"
              disabled={disabled}
            />
          </div>
          <Button
            onClick={handleCustomSubmit}
            className="min-h-[44px] rounded-lg"
            disabled={disabled || !customMinutes}
          >
            設定
          </Button>
        </div>
      )}
    </div>
  )
}
