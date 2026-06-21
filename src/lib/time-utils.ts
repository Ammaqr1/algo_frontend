export const TIME_FIELDS = [
  'at_time_money',
  'start_time',
  'end_time',
  'end_entry_time',
] as const

export const TIME_FIELDS_WITH_SECONDS = [
  'at_time_money',
  'start_time',
  'end_time',
] as const

export type TimeField = (typeof TIME_FIELDS)[number]

export type TimeFieldWithSeconds = (typeof TIME_FIELDS_WITH_SECONDS)[number]

function parseTimeMatch(value: string) {
  return value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
}

/** Normalize stored time to HH:mm or HH:mm:ss (24-hour). */
export function toTimeInputValue(
  value: string | null | undefined,
  options?: { withSeconds?: boolean }
): string {
  if (!value) return ''
  const match = parseTimeMatch(value)
  if (!match) return ''

  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = match[3] !== undefined ? Number(match[3]) : null

  if (hours > 23 || minutes > 59) return ''
  if (seconds !== null && seconds > 59) return ''

  const hh = String(hours).padStart(2, '0')
  const mm = String(minutes).padStart(2, '0')

  if (options?.withSeconds) {
    const ss = String(seconds ?? 0).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
  }

  if (seconds !== null) return ''
  return `${hh}:${mm}`
}

/** Display time in 24-hour format; includes seconds when stored. */
export function formatTime24(value: string | null | undefined): string {
  if (!value) return '—'
  const withSeconds = parseTimeMatch(value)?.[3] !== undefined
  const normalized = toTimeInputValue(value, {
    withSeconds,
  })
  return normalized || '—'
}

export function parseTimeParts(
  value: string | null | undefined,
  options?: { withSeconds?: boolean }
): { hour: string; minute: string; second: string } {
  const normalized = toTimeInputValue(value, {
    withSeconds: options?.withSeconds,
  })
  if (!normalized) return { hour: '', minute: '', second: '' }

  const parts = normalized.split(':')
  if (options?.withSeconds) {
    const [hour, minute, second] = parts
    return { hour, minute, second: second ?? '00' }
  }

  const [hour, minute] = parts
  return { hour, minute, second: '' }
}

export function combineTimeParts(
  hour: string,
  minute: string,
  second?: string
): string {
  if (!hour || !minute) return ''
  if (second !== undefined) {
    return `${hour}:${minute}:${second || '00'}`
  }
  return `${hour}:${minute}`
}

export function timeFieldUsesSeconds(
  key: TimeField
): key is TimeFieldWithSeconds {
  return (TIME_FIELDS_WITH_SECONDS as readonly string[]).includes(key)
}
