export const TIME_FIELDS = [
  'at_time_money',
  'start_time',
  'end_time',
  'end_entry_time',
] as const

export type TimeField = (typeof TIME_FIELDS)[number]

/** Normalize stored time (e.g. "9:17") to HH:mm (24-hour). */
export function toTimeInputValue(value: string | null | undefined): string {
  if (!value) return ''
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
  if (!match) return ''
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return ''
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/** Display time in 24-hour HH:mm format. */
export function formatTime24(value: string | null | undefined): string {
  const normalized = toTimeInputValue(value)
  return normalized || '—'
}

export function parseTimeParts(value: string | null | undefined): {
  hour: string
  minute: string
} {
  const normalized = toTimeInputValue(value)
  if (!normalized) return { hour: '', minute: '' }
  const [hour, minute] = normalized.split(':')
  return { hour, minute }
}

export function combineTimeParts(hour: string, minute: string): string {
  if (!hour || !minute) return ''
  return `${hour}:${minute}`
}
