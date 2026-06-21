import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'
import {
  fetchRunningSchedule,
  type RunningSchedule,
  type ScheduledStrategyItem,
} from '@/lib/scheduled-strategies-api'
import { sessionDetailPath, strategyTypePath } from '@/lib/strategies-api'
import { formatTime24 } from '@/lib/time-utils'

function ScheduleItemCard({ item }: { item: ScheduledStrategyItem }) {
  const canLink =
    item.typeId &&
    item.typeName &&
    item.sessionId &&
    item.sessionName

  const inner = (
    <div className="border-border bg-muted/20 space-y-1 rounded-lg border px-3 py-2 text-sm">
      <div className="font-medium">
        {item.sessionName ?? 'Unknown session'}
        {item.week_day ? (
          <span className="text-muted-foreground font-normal">
            {' '}
            · {item.week_day}
          </span>
        ) : null}
      </div>
      <div className="text-muted-foreground text-xs">
        {item.exchange ? `${item.exchange} · ` : null}
        ATM {formatTime24(item.at_time_money)} · Start{' '}
        {formatTime24(item.start_time)} · End {formatTime24(item.end_time)}
      </div>
      {item.matchReason === 'run_today' ? (
        <span className="bg-primary/10 text-primary inline-block rounded px-1.5 py-0.5 text-xs font-medium">
          Run today
        </span>
      ) : null}
    </div>
  )

  if (!canLink) return inner

  return (
    <Link
      to={sessionDetailPath(
        { id: item.sessionId!, strategy_name: item.sessionName! },
        { id: item.typeId!, stratergiesType: item.typeName! }
      )}
      className="block transition-opacity hover:opacity-80"
    >
      {inner}
    </Link>
  )
}

function ScheduleColumn({
  items,
  emptyLabel,
}: {
  items: ScheduledStrategyItem[]
  emptyLabel: string
}) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm italic">{emptyLabel}</p>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ScheduleItemCard key={item.configId} item={item} />
      ))}
    </div>
  )
}

export function SchedulePage() {
  const [schedule, setSchedule] = useState<RunningSchedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchRunningSchedule()
      setSchedule(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load running schedule.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const totalToday =
    schedule?.groups.reduce((n, g) => n + g.today.length, 0) ?? 0
  const totalTomorrow =
    schedule?.groups.reduce((n, g) => n + g.tomorrow.length, 0) ?? 0

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-border bg-background/75 supports-[backdrop-filter]:bg-background/60 flex items-center justify-between border-b px-4 py-3 backdrop-blur-md md:px-6">
        <Link
          to="/dashboard"
          className="font-heading text-foreground text-lg font-semibold tracking-tight"
        >
          Algo
        </Link>
        <Link
          to="/dashboard"
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Back to dashboard
        </Link>
      </header>

      <main className="flex flex-1 flex-col px-4 py-8 md:px-6">
        <div className="mx-auto w-full max-w-6xl flex-1">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-medium tracking-tight">
              Running schedule
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Active configs for today and tomorrow, grouped by strategy type.
              Today includes weekday matches and run-today overrides.
            </p>
          </div>

          {error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {loading ? (
            <p className="text-muted-foreground text-sm">Loading schedule…</p>
          ) : schedule ? (
            <>
              <div className="text-muted-foreground mb-6 flex flex-wrap gap-4 text-sm">
                <span>
                  Today ({schedule.today.label}):{' '}
                  <span className="text-foreground font-medium tabular-nums">
                    {totalToday}
                  </span>
                </span>
                <span>
                  Tomorrow ({schedule.tomorrow.label}):{' '}
                  <span className="text-foreground font-medium tabular-nums">
                    {totalTomorrow}
                  </span>
                </span>
              </div>

              {schedule.groups.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No active strategies scheduled for today or tomorrow.
                </p>
              ) : (
                <div className="ring-foreground/10 overflow-hidden rounded-xl ring-1">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[40rem] border-collapse text-sm">
                      <thead>
                        <tr className="border-border bg-muted/50 border-b">
                          <th className="text-muted-foreground px-4 py-3 text-left font-medium whitespace-nowrap">
                            Strategy type
                          </th>
                          <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                            {schedule.today.label}
                          </th>
                          <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                            {schedule.tomorrow.label}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.groups.map((group) => (
                          <tr
                            key={group.typeId ?? group.typeName}
                            className="border-border hover:bg-muted/20 border-b align-top last:border-0"
                          >
                            <td className="px-4 py-4 font-medium whitespace-nowrap">
                              {group.typeId ? (
                                <Link
                                  to={strategyTypePath({
                                    id: group.typeId,
                                    stratergiesType: group.typeName,
                                  })}
                                  className="text-primary hover:underline"
                                >
                                  {group.typeName}
                                </Link>
                              ) : (
                                group.typeName
                              )}
                              <div className="text-muted-foreground mt-1 text-xs font-normal">
                                {group.today.length} today ·{' '}
                                {group.tomorrow.length} tomorrow
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <ScheduleColumn
                                items={group.today}
                                emptyLabel="None scheduled"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <ScheduleColumn
                                items={group.tomorrow}
                                emptyLabel="None scheduled"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </main>
    </div>
  )
}
