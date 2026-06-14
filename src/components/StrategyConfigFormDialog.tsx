import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RunToggle, isRunOn, runFromChecked } from '@/components/RunToggle'
import { TimeInput24 } from '@/components/TimeInput24'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  REQUIRED_TIME_FIELDS,
  hasFieldErrors,
  numericFieldError,
  sanitizeNumericInput,
  timeFieldError,
  validateStrategyConfigForm,
  type NumericConfigField,
  type RequiredTimeField,
  type StrategyConfigFormErrorKey,
} from '@/lib/strategy-config-validation'
import { TIME_FIELDS, toTimeInputValue } from '@/lib/time-utils'
import { cn } from '@/lib/utils'
import type { StrategyConfig, StrategyConfigInput } from '@/lib/strategies-api'

export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
] as const

export const EXCHANGES = ['NSE', 'BSE'] as const

export type Exchange = (typeof EXCHANGES)[number]

const COMMON_DEFAULTS: Pick<
  StrategyConfigInput,
  | 'run'
  | 'c_a_n'
  | 'd_n_s'
  | 'd_n_s_trigger'
  | 'd_n_s_target'
  | 'run_today'
  | 'paper_trade'
  | 'can_p'
> = {
  run: 'on',
  c_a_n: 'on',
  d_n_s: 'off',
  d_n_s_trigger: '10',
  d_n_s_target: '5',
  run_today: 'off',
  paper_trade: 'off',
  can_p: '10',
}

const EXCHANGE_DEFAULTS: Record<
  Exchange,
  Pick<
    StrategyConfigInput,
    | 'target_price'
    | 'stop_loss_price'
    | 'target_trigger_price_percentage'
    | 'stoploss_trigger_price_percentage'
  >
> = {
  BSE: {
    target_price: '20',
    stop_loss_price: '5',
    target_trigger_price_percentage: '19.9',
    stoploss_trigger_price_percentage: '4.9',
  },
  NSE: {
    target_price: '12.5',
    stop_loss_price: '5',
    target_trigger_price_percentage: '12.4',
    stoploss_trigger_price_percentage: '4.9',
  },
}

export function defaultStrategyConfigForm(
  exchange: Exchange = 'NSE'
): StrategyConfigInput {
  const ex: Exchange = exchange === 'BSE' ? 'BSE' : 'NSE'
  return {
    week_day: '',
    at_time_money: '',
    start_time: '',
    end_time: '',
    end_entry_time: '',
    exchange: ex,
    ...COMMON_DEFAULTS,
    ...EXCHANGE_DEFAULTS[ex],
  }
}

export const EMPTY_STRATEGY_CONFIG_FORM: StrategyConfigInput =
  defaultStrategyConfigForm('NSE')

const NUMERIC_FIELDS: {
  key: NumericConfigField
  label: string
  placeholder?: string
}[] = [
  { key: 'target_price', label: 'Target price', placeholder: '20 / 12.5' },
  { key: 'stop_loss_price', label: 'Stop loss', placeholder: '5' },
  {
    key: 'target_trigger_price_percentage',
    label: 'Target trigger %',
    placeholder: '19.9 / 12.4',
  },
  {
    key: 'stoploss_trigger_price_percentage',
    label: 'Stoploss trigger %',
    placeholder: '4.9',
  },
  { key: 'can_p', label: 'CAN %', placeholder: '10' },
  { key: 'd_n_s_trigger', label: 'DNS trigger', placeholder: '10' },
  { key: 'd_n_s_target', label: 'DNS target', placeholder: '5' },
]

const BOOL_FIELDS: {
  key: 'run' | 'run_today' | 'c_a_n' | 'd_n_s' | 'paper_trade'
  label: string
}[] = [
  { key: 'run', label: 'Active' },
  { key: 'run_today', label: 'Run today' },
  { key: 'c_a_n', label: 'Capital allocation (CAN)' },
  { key: 'd_n_s', label: 'Dynamic stop loss' },
  { key: 'paper_trade', label: 'Paper trade' },
]

const TIME_FIELD_LABELS: Record<(typeof TIME_FIELDS)[number], string> = {
  at_time_money: 'ATM time',
  start_time: 'Start time',
  end_time: 'End time',
  end_entry_time: 'Entry end',
}

const REQUIRED_TIME_FIELD_SET = new Set<string>(REQUIRED_TIME_FIELDS)

const selectClassName =
  'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50'

function configToForm(config: StrategyConfig): StrategyConfigInput {
  return {
    week_day: config.week_day ?? '',
    at_time_money: toTimeInputValue(config.at_time_money),
    start_time: toTimeInputValue(config.start_time),
    end_time: toTimeInputValue(config.end_time),
    end_entry_time: toTimeInputValue(config.end_entry_time),
    exchange:
      EXCHANGES.find(
        (ex) => ex === (config.exchange ?? '').trim().toUpperCase()
      ) ?? '',
    target_price: config.target_price ?? '',
    stop_loss_price: config.stop_loss_price ?? '',
    target_trigger_price_percentage:
      config.target_trigger_price_percentage ?? '',
    stoploss_trigger_price_percentage:
      config.stoploss_trigger_price_percentage ?? '',
    run: isRunOn(config.run ?? 'on') ? 'on' : 'off',
    run_today: isRunOn(config.run_today) ? 'on' : 'off',
    c_a_n: isRunOn(config.c_a_n ?? 'on') ? 'on' : 'off',
    can_p: config.can_p ?? COMMON_DEFAULTS.can_p,
    d_n_s: isRunOn(config.d_n_s) ? 'on' : 'off',
    d_n_s_trigger: config.d_n_s_trigger ?? COMMON_DEFAULTS.d_n_s_trigger,
    d_n_s_target: config.d_n_s_target ?? COMMON_DEFAULTS.d_n_s_target,
    paper_trade: config.paper_trade ?? 'off',
  }
}

type StrategyConfigFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  initial?: StrategyConfig | null
  saving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: StrategyConfigInput) => void | Promise<void>
}

export function StrategyConfigFormDialog({
  open,
  mode,
  initial,
  saving,
  onOpenChange,
  onSubmit,
}: StrategyConfigFormDialogProps) {
  const [form, setForm] = useState<StrategyConfigInput>(EMPTY_STRATEGY_CONFIG_FORM)
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<StrategyConfigFormErrorKey, string>>
  >({})

  useEffect(() => {
    if (open) {
      const nextForm =
        mode === 'edit' && initial
          ? configToForm(initial)
          : defaultStrategyConfigForm('NSE')
      setForm(nextForm)
      setFieldErrors(validateStrategyConfigForm(nextForm))
    }
  }, [open, mode, initial])

  function setField(key: keyof StrategyConfigInput, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setNumericField(key: NumericConfigField, raw: string) {
    const value = sanitizeNumericInput(raw)
    const err = numericFieldError(value, { allowPartial: true })
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((errs) => ({
      ...errs,
      [key]: err ?? undefined,
    }))
  }

  function handleNumericBlur(key: NumericConfigField) {
    const value = form[key] ?? ''
    setFieldErrors((errs) => ({
      ...errs,
      [key]: numericFieldError(value, { allowPartial: false }) ?? undefined,
    }))
  }

  function setTimeField(
    key: (typeof TIME_FIELDS)[number],
    value: string,
    required: boolean
  ) {
    const normalized = toTimeInputValue(value)
    setForm((prev) => ({ ...prev, [key]: normalized }))
    if (required) {
      const err = timeFieldError(normalized, { required: true })
      setFieldErrors((errs) => ({
        ...errs,
        [key as RequiredTimeField]: err ?? undefined,
      }))
    }
  }

  function handleTimeBlur(key: RequiredTimeField) {
    const value = form[key] ?? ''
    setFieldErrors((errs) => ({
      ...errs,
      [key]: timeFieldError(value, { required: true }) ?? undefined,
    }))
  }

  function handleExchangeChange(value: string) {
    setForm((prev) => {
      const next: StrategyConfigInput = { ...prev, exchange: value }
      if (mode === 'create' && (value === 'NSE' || value === 'BSE')) {
        Object.assign(next, EXCHANGE_DEFAULTS[value])
      }
      setFieldErrors(validateStrategyConfigForm(next))
      return next
    })
  }

  const formErrors = validateStrategyConfigForm(form)
  const formHasErrors = hasFieldErrors(formErrors)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errors = validateStrategyConfigForm(form)
    setFieldErrors(errors)
    if (hasFieldErrors(errors)) return

    const payload: StrategyConfigInput = { ...form }
    if (mode === 'edit' && initial?.strategy_name) {
      payload.strategy_name = initial.strategy_name
    }
    void onSubmit(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add config row' : 'Edit config row'}
          </DialogTitle>
          <DialogDescription>
            Schedule and parameters for this strategy group.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="config-week_day">Week day</Label>
              <select
                id="config-week_day"
                value={form.week_day ?? ''}
                onChange={(e) => setField('week_day', e.target.value)}
                disabled={saving}
                className={selectClassName}
                required
              >
                <option value="">Select day</option>
                {WEEK_DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="config-exchange">Exchange</Label>
              <select
                id="config-exchange"
                value={form.exchange ?? ''}
                onChange={(e) => handleExchangeChange(e.target.value)}
                disabled={saving}
                className={selectClassName}
                required
              >
                <option value="">Select exchange</option>
                {EXCHANGES.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
            </div>

            {TIME_FIELDS.map((key) => {
              const required = REQUIRED_TIME_FIELD_SET.has(key)
              const error = required
                ? fieldErrors[key as RequiredTimeField]
                : undefined
              return (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`config-${key}`}>
                    {TIME_FIELD_LABELS[key]}
                    {required ? (
                      <span className="text-destructive ml-0.5">*</span>
                    ) : null}
                  </Label>
                  <TimeInput24
                    id={`config-${key}`}
                    value={form[key] ?? ''}
                    invalid={Boolean(error)}
                    onChange={(value) => setTimeField(key, value, required)}
                    onBlur={
                      required
                        ? () => handleTimeBlur(key as RequiredTimeField)
                        : undefined
                    }
                    disabled={saving}
                  />
                  {error ? (
                    <p className="text-destructive text-xs" role="alert">
                      {error}
                    </p>
                  ) : null}
                </div>
              )
            })}

            {NUMERIC_FIELDS.map(({ key, label, placeholder }) => {
              const error = fieldErrors[key]
              return (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`config-${key}`}>{label}</Label>
                  <Input
                    id={`config-${key}`}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={form[key] ?? ''}
                    onChange={(e) => setNumericField(key, e.target.value)}
                    onBlur={() => handleNumericBlur(key)}
                    placeholder={placeholder}
                    disabled={saving}
                    aria-invalid={Boolean(error)}
                    className={cn(error && 'border-destructive')}
                  />
                  {error ? (
                    <p className="text-destructive text-xs" role="alert">
                      {error}
                    </p>
                  ) : null}
                </div>
              )
            })}

            {BOOL_FIELDS.map(({ key, label }) => (
              <div key={key} className="space-y-2 sm:col-span-2">
                <Label>{label}</Label>
                <RunToggle
                  checked={isRunOn(form[key])}
                  disabled={saving}
                  onCheckedChange={(checked) =>
                    setField(key, runFromChecked(checked))
                  }
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                saving ||
                !form.week_day?.trim() ||
                !form.exchange?.trim() ||
                formHasErrors
              }
            >
              {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
