import { toTimeInputValue, timeFieldUsesSeconds } from '@/lib/time-utils'
import type { StrategyConfigInput } from '@/lib/strategies-api'

export const REQUIRED_TIME_FIELDS = [
  'at_time_money',
  'start_time',
  'end_time',
  'end_entry_time',
] as const satisfies readonly (keyof StrategyConfigInput)[]

export type RequiredTimeField = (typeof REQUIRED_TIME_FIELDS)[number]

export type StrategyConfigFormErrorKey =
  | NumericConfigField
  | RequiredTimeField

export const NUMERIC_CONFIG_FIELDS = [
  'target_price',
  'stop_loss_price',
  'target_trigger_price_percentage',
  'stoploss_trigger_price_percentage',
  'can_p',
  'd_n_s_trigger',
  'd_n_s_target',
] as const satisfies readonly (keyof StrategyConfigInput)[]

export type NumericConfigField = (typeof NUMERIC_CONFIG_FIELDS)[number]

/** Strip invalid characters; allow at most one decimal point. */
export function sanitizeNumericInput(raw: string): string {
  let next = raw.replace(/[^\d.]/g, '')
  const dot = next.indexOf('.')
  if (dot !== -1) {
    next =
      next.slice(0, dot + 1) + next.slice(dot + 1).replace(/\./g, '')
  }
  return next
}

export function isCompleteNumber(value: string): boolean {
  const v = value.trim()
  return v !== '' && /^\d+(\.\d+)?$/.test(v)
}

/**
 * @param allowPartial — while typing, permit "", "12", and "12." without error
 */
export function numericFieldError(
  value: string,
  options?: { required?: boolean; allowPartial?: boolean }
): string | null {
  const v = value.trim()
  const required = options?.required !== false

  if (!v) {
    return required ? 'Required' : null
  }

  if (/^\d+(\.\d+)?$/.test(v)) {
    return null
  }

  if (options?.allowPartial && /^\d+\.$/.test(v)) {
    return null
  }

  if (options?.allowPartial && /^\d*\.?\d*$/.test(v)) {
    return null
  }

  return 'Enter a valid number'
}

export function validateAllNumericFields(
  form: Pick<StrategyConfigInput, NumericConfigField>
): Partial<Record<NumericConfigField, string>> {
  const errors: Partial<Record<NumericConfigField, string>> = {}
  for (const key of NUMERIC_CONFIG_FIELDS) {
    const err = numericFieldError(form[key] ?? '', { allowPartial: false })
    if (err) errors[key] = err
  }
  return errors
}

export function hasFieldErrors(
  errors: Partial<Record<string, string>>
): boolean {
  return Object.keys(errors).length > 0
}

export function timeFieldError(
  value: string,
  options?: { required?: boolean; withSeconds?: boolean }
): string | null {
  const trimmed = value.trim()
  const required = options?.required !== false
  const withSeconds = options?.withSeconds === true

  if (!trimmed) {
    return required ? 'Required' : null
  }

  if (!toTimeInputValue(trimmed, { withSeconds })) {
    return withSeconds
      ? 'Enter a valid time (HH:mm:ss)'
      : 'Enter a valid time (HH:mm)'
  }

  return null
}

export function validateRequiredTimeFields(
  form: Pick<StrategyConfigInput, RequiredTimeField>
): Partial<Record<RequiredTimeField, string>> {
  const errors: Partial<Record<RequiredTimeField, string>> = {}
  for (const key of REQUIRED_TIME_FIELDS) {
    const withSeconds = timeFieldUsesSeconds(key)
    const err = timeFieldError(form[key] ?? '', { required: true, withSeconds })
    if (err) errors[key] = err
  }
  return errors
}

export function validateStrategyConfigForm(
  form: Pick<StrategyConfigInput, NumericConfigField | RequiredTimeField>
): Partial<Record<StrategyConfigFormErrorKey, string>> {
  return {
    ...validateAllNumericFields(form),
    ...validateRequiredTimeFields(form),
  }
}
