import { cn } from '@/lib/utils'

export function isRunOn(run: string | null | undefined): boolean {
  if (!run) return false
  const v = run.trim().toLowerCase()
  return v === 'on' || v === 'true' || v === '1' || v === 'yes'
}

export function runFromChecked(checked: boolean): 'on' | 'off' {
  return checked ? 'on' : 'off'
}

type RunToggleProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  showLabel?: boolean
}

export function RunToggle({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  showLabel = true,
}: RunToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label ?? (checked ? 'Active' : 'Inactive')}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
          'focus-visible:ring-ring/50 focus-visible:ring-3 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-primary' : 'bg-input'
        )}
      >
        <span
          className={cn(
            'pointer-events-none block size-5 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
      {showLabel ? (
        <span className="text-muted-foreground text-xs">
          {checked ? 'Active' : 'Inactive'}
        </span>
      ) : null}
    </div>
  )
}
