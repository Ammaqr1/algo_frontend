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
import { TIME_FIELDS, toTimeInputValue } from '@/lib/time-utils'
import type { StrategyConfig, StrategyConfigInput } from '@/lib/strategies-api'

export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
] as const

export const EXCHANGES = ['NSE', 'BSE'] as const

export const EMPTY_STRATEGY_CONFIG_FORM: StrategyConfigInput = {
  week_day: '',
  at_time_money: '',
  start_time: '',
  end_time: '',
  end_entry_time: '',
  exchange: '',
  target_price: '',
  stop_loss_price: '',
  target_trigger_price_percentage: '',
  stoploss_trigger_price_percentage: '',
  run: 'on',
}

const TEXT_FIELDS: {
  key: keyof StrategyConfigInput
  label: string
  placeholder?: string
}[] = [
  { key: 'target_price', label: 'Target price', placeholder: '20' },
  { key: 'stop_loss_price', label: 'Stop loss', placeholder: '7' },
  {
    key: 'target_trigger_price_percentage',
    label: 'Target trigger %',
    placeholder: '19.9',
  },
  {
    key: 'stoploss_trigger_price_percentage',
    label: 'Stoploss trigger %',
    placeholder: '6.9',
  },
]

const TIME_FIELD_LABELS: Record<(typeof TIME_FIELDS)[number], string> = {
  at_time_money: 'ATM time',
  start_time: 'Start time',
  end_time: 'End time',
  end_entry_time: 'Entry end',
}

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
    run: config.run ?? 'on',
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

  useEffect(() => {
    if (open) {
      setForm(
        mode === 'edit' && initial
          ? configToForm(initial)
          : { ...EMPTY_STRATEGY_CONFIG_FORM }
      )
    }
  }, [open, mode, initial])

  function setField(key: keyof StrategyConfigInput, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
                onChange={(e) => setField('exchange', e.target.value)}
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

            {TIME_FIELDS.map((key) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`config-${key}`}>{TIME_FIELD_LABELS[key]}</Label>
                <TimeInput24
                  id={`config-${key}`}
                  value={form[key] ?? ''}
                  onChange={(value) => setField(key, value)}
                  disabled={saving}
                />
              </div>
            ))}

            {TEXT_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`config-${key}`}>{label}</Label>
                <Input
                  id={`config-${key}`}
                  value={form[key] ?? ''}
                  onChange={(e) => setField(key, e.target.value)}
                  placeholder={placeholder}
                  disabled={saving}
                />
              </div>
            ))}

            <div className="space-y-2 sm:col-span-2">
              <Label>Active</Label>
              <RunToggle
                checked={isRunOn(form.run)}
                disabled={saving}
                onCheckedChange={(checked) =>
                  setField('run', runFromChecked(checked))
                }
              />
            </div>
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
                saving || !form.week_day?.trim() || !form.exchange?.trim()
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
