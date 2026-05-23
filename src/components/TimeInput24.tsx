import { combineTimeParts, parseTimeParts } from '@/lib/time-utils'

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

const selectClassName =
  'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 min-w-0 flex-1 rounded-lg border px-2 text-sm outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50'

type TimeInput24Props = {
  id: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function TimeInput24({
  id,
  value,
  onChange,
  disabled = false,
}: TimeInput24Props) {
  const { hour, minute } = parseTimeParts(value)

  function handleHourChange(nextHour: string) {
    if (!nextHour) {
      onChange('')
      return
    }
    onChange(combineTimeParts(nextHour, minute || '00'))
  }

  function handleMinuteChange(nextMinute: string) {
    if (!nextMinute) {
      onChange(hour ? combineTimeParts(hour, '00') : '')
      return
    }
    if (!hour) {
      onChange(combineTimeParts('00', nextMinute))
      return
    }
    onChange(combineTimeParts(hour, nextMinute))
  }

  return (
    <div className="flex items-center gap-1.5" id={id}>
      <select
        aria-label="Hour (24-hour)"
        value={hour}
        onChange={(e) => handleHourChange(e.target.value)}
        disabled={disabled}
        className={selectClassName}
      >
        <option value="">HH</option>
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-muted-foreground shrink-0 text-sm font-medium">:</span>
      <select
        aria-label="Minute"
        value={minute}
        onChange={(e) => handleMinuteChange(e.target.value)}
        disabled={disabled}
        className={selectClassName}
      >
        <option value="">mm</option>
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  )
}
