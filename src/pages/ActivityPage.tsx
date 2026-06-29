import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ActivitySessionCard } from '@/components/ActivitySessionCard'
import { DatePicker, todayYmd } from '@/components/DatePicker'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { fetchActivityUsers } from '@/lib/activity-users-api'
import {
  fetchOrderHistory,
  type OrderHistoryItem,
} from '@/lib/order-history-api'
import {
  fetchActivityStrategies,
  type ActivityStrategyOption,
} from '@/lib/activity-strategies-api'

const EXIT_MODE_OPTIONS = [
  { value: '', label: 'All outcomes' },
  { value: 'target', label: 'Target' },
  { value: 'stop loss', label: 'Stop loss' },
  { value: 'other', label: 'Exit / Other' },
  { value: 'no_buy', label: 'No buy' },
  { value: 'not_sold', label: 'Buy · Not sold' },
]

function defaultDateRange(): { from: string; to: string } {
  const today = todayYmd()
  return { from: today, to: today }
}

const selectClassName =
  'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3'

export function ActivityPage() {
  const defaults = defaultDateRange()
  const [dateFrom, setDateFrom] = useState(defaults.from)
  const [dateTo, setDateTo] = useState(defaults.to)
  const [userOptions, setUserOptions] = useState<string[]>(['testing'])
  const [userName, setUserName] = useState('testing')
  const [strategies, setStrategies] = useState<ActivityStrategyOption[]>([])
  const [strategyId, setStrategyId] = useState('')
  const [mode, setMode] = useState('')
  const [exchange, setExchange] = useState('')

  const [items, setItems] = useState<OrderHistoryItem[]>([])
  const [total, setTotal] = useState(0)
  const [limit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOrderHistory({
        date_from: dateFrom,
        date_to: dateTo,
        user_name: userName.trim() || undefined,
        stratergy_id: strategyId.trim() || undefined,
        mode: mode || undefined,
        exchange: exchange || undefined,
        limit,
        offset,
      })
      setItems(data.items)
      setTotal(data.total)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load order history.'
      )
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo, userName, strategyId, mode, exchange, limit, offset])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    fetchActivityUsers()
      .then((users) => {
        if (users.length > 0) {
          setUserOptions(users)
          setUserName((current) =>
            current && users.includes(current) ? current : users[0]
          )
        }
      })
      .catch(() => {
        /* keep hardcoded testing fallback */
      })
  }, [])

  useEffect(() => {
    fetchActivityStrategies()
      .then(setStrategies)
      .catch(() => {
        /* dropdown stays empty except "All strategies" */
      })
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (offset === 0) void load()
    else setOffset(0)
  }

  const canPrev = offset > 0
  const canNext = offset + limit < total

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
        <div className="mx-auto w-full max-w-4xl flex-1">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-medium tracking-tight">
              Activity
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Order sessions with buy and sell details. Click a row to expand.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="border-border bg-card ring-foreground/10 mb-6 grid gap-4 rounded-xl border p-4 ring-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div className="space-y-2">
              <Label htmlFor="date-from">From</Label>
              <DatePicker
                id="date-from"
                value={dateFrom}
                onChange={setDateFrom}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to">To</Label>
              <DatePicker id="date-to" value={dateTo} onChange={setDateTo} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-name">User</Label>
              <select
                id="user-name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className={selectClassName}
              >
                <option value="">All users</option>
                {userOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="strategy-filter">Strategy</Label>
              <select
                id="strategy-filter"
                value={strategyId}
                onChange={(e) => setStrategyId(e.target.value)}
                className={selectClassName}
              >
                <option value="">All strategies</option>
                {strategies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.strategy_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode-filter">Outcome</Label>
              <select
                id="mode-filter"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className={selectClassName}
              >
                {EXIT_MODE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exchange-filter">Exchange</Label>
              <select
                id="exchange-filter"
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
                className={selectClassName}
              >
                <option value="">All</option>
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
              </select>
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button type="submit" className="w-full">
                Apply filters
              </Button>
            </div>
          </form>

          {error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {loading ? (
            <p className="text-muted-foreground text-sm">Loading activity…</p>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No sessions found for these filters.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <ActivitySessionCard
                  key={item.id}
                  item={item}
                  defaultOpen={index === 0}
                />
              ))}
            </div>
          )}

          {!loading && total > 0 ? (
            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm">
                Showing {offset + 1}–{Math.min(offset + limit, total)} of{' '}
                {total}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canPrev}
                  onClick={() => setOffset((o) => Math.max(0, o - limit))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canNext}
                  onClick={() => setOffset((o) => o + limit)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
