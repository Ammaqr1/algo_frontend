import { ChevronDownIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { OrderHistoryItem } from '@/lib/order-history-api'

const EXIT_MODE_STYLES: Record<
  string,
  { label: string; className: string }
> = {
  target: {
    label: 'Target',
    className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  },
  'stop loss': {
    label: 'Stop loss',
    className: 'bg-red-500/15 text-red-700 dark:text-red-400',
  },
  other: {
    label: 'Exit / Other',
    className: 'bg-amber-500/15 text-amber-800 dark:text-amber-400',
  },
  no_buy: {
    label: 'No buy',
    className: 'bg-muted text-muted-foreground',
  },
  not_sold: {
    label: 'Buy · Not sold',
    className: 'bg-orange-500/15 text-orange-800 dark:text-orange-400',
  },
  unknown: {
    label: 'Unknown',
    className: 'bg-muted text-muted-foreground',
  },
}

function sessionUser(item: OrderHistoryItem): string {
  return (
    item.buyOrderDetails[0]?.user ??
    item.sellOrderDetails[0]?.user ??
    '—'
  )
}

function formatDate(value?: string): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function formatNumber(value: unknown, digits = 2): string {
  const n = parseNumber(value)
  if (n === null) return '—'
  return n.toFixed(digits)
}

function formatPct(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '—'
  return `${value.toFixed(2)}%`
}

function slippagePct(requested: number | null, filled: number | null): number | null {
  if (requested === null || filled === null || requested === 0) return null
  return ((filled - requested) / requested) * 100
}

function buySlippage(buy: OrderHistoryItem['buyOrderDetails'][number]) {
  const requested = parseNumber(buy.r_buy_price)
  const filled = parseNumber(buy.filled_price)
  const diff = requested !== null && filled !== null ? filled - requested : null
  return { requested, filled, diff, pct: slippagePct(requested, filled) }
}

function sellRequestedPrice(
  sell: OrderHistoryItem['sellOrderDetails'][number]
): number | null {
  const mode = (sell.mode ?? '').toUpperCase()
  if (mode.includes('TARGET')) return parseNumber(sell.target_price)
  if (mode.includes('STOP')) return parseNumber(sell.stop_loss_price)
  if (mode.includes('EXIT')) return parseNumber(sell.target_trigger_price)
  return parseNumber(sell.target_price) ?? parseNumber(sell.stop_loss_price)
}

function sellSlippage(sell: OrderHistoryItem['sellOrderDetails'][number]) {
  const requested = sellRequestedPrice(sell)
  const filled = parseNumber(sell.filled_price)
  const diff = requested !== null && filled !== null ? filled - requested : null
  return { requested, filled, diff, pct: slippagePct(requested, filled) }
}

function orderFlowRows(orderFlow: unknown): Array<[string, unknown]> {
  if (!orderFlow || typeof orderFlow !== 'object') return []
  const entries = Object.entries(orderFlow as Record<string, unknown>)
  return entries.sort((a, b) => Number(a[0]) - Number(b[0]))
}

function DetailGrid({
  title,
  rows,
}: {
  title: string
  rows: { label: string; value: string | number | null | undefined }[]
}) {
  const visible = rows.filter(
    (r) => r.value !== null && r.value !== undefined && r.value !== ''
  )
  if (visible.length === 0) return null
  return (
    <div className="space-y-2">
      <h4 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {title}
      </h4>
      <dl className="grid gap-2 sm:grid-cols-2">
        {visible.map(({ label, value }) => (
          <div
            key={label}
            className="border-border/60 bg-muted/30 rounded-lg border px-3 py-2"
          >
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

type ActivitySessionCardProps = {
  item: OrderHistoryItem
  defaultOpen?: boolean
}

export function ActivitySessionCard({
  item,
  defaultOpen = false,
}: ActivitySessionCardProps) {
  const modeStyle =
    EXIT_MODE_STYLES[item.exitMode] ?? EXIT_MODE_STYLES.unknown
  const user = sessionUser(item)
  const dateLabel = formatDate(item.createdAt ?? item.started_time)
  const buyTotalRequested = item.buyOrderDetails.reduce(
    (sum, buy) => sum + (buySlippage(buy).requested ?? 0),
    0
  )
  const buyTotalFilled = item.buyOrderDetails.reduce(
    (sum, buy) => sum + (buySlippage(buy).filled ?? 0),
    0
  )
  const sellTotalRequested = item.sellOrderDetails.reduce(
    (sum, sell) => sum + (sellSlippage(sell).requested ?? 0),
    0
  )
  const sellTotalFilled = item.sellOrderDetails.reduce(
    (sum, sell) => sum + (sellSlippage(sell).filled ?? 0),
    0
  )
  const buyTotalPct = slippagePct(
    buyTotalRequested > 0 ? buyTotalRequested : null,
    buyTotalFilled > 0 ? buyTotalFilled : null
  )
  const sellTotalPct = slippagePct(
    sellTotalRequested > 0 ? sellTotalRequested : null,
    sellTotalFilled > 0 ? sellTotalFilled : null
  )
  const totalRequested = buyTotalRequested + sellTotalRequested
  const totalFilled = buyTotalFilled + sellTotalFilled
  const totalPct = slippagePct(
    totalRequested > 0 ? totalRequested : null,
    totalFilled > 0 ? totalFilled : null
  )

  return (
    <details
      className="group border-border bg-card ring-foreground/10 rounded-xl border ring-1"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <ChevronDownIcon className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-md px-2 py-0.5 text-xs font-medium',
                modeStyle.className
              )}
            >
              {modeStyle.label}
            </span>
            <span className="text-sm font-medium">{user}</span>
            {item.exchange ? (
              <span className="text-muted-foreground text-xs">
                {item.exchange}
              </span>
            ) : null}
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">{dateLabel}</p>
        </div>
        <span className="text-muted-foreground hidden text-xs sm:inline">
          {item.buyOrderDetails.length} buy · {item.sellOrderDetails.length}{' '}
          sell
        </span>
      </summary>

      <div className="border-border space-y-6 border-t px-4 py-4">
        <DetailGrid
          title="Session"
          rows={[
            { label: 'Started', value: item.started_time },
            { label: 'ATM time', value: item.at_the_money_time },
            { label: 'ATM price', value: item.at_the_money_price },
            { label: 'Exchange', value: item.exchange },
            { label: 'Expiry', value: item.expiry_date },
            { label: 'CE instrument', value: item.ce_ik },
            { label: 'PE instrument', value: item.pe_ik },
            { label: 'High CE', value: item.high_price_ce },
            { label: 'High CE time', value: item.high_price_time_ce },
            { label: 'High PE', value: item.high_price_pe },
            { label: 'High PE time', value: item.high_price_time_pe },
            {
              label: 'Scan window',
              value: `${item.high_price_start_time ?? '—'} – ${item.high_price_end_time ?? '—'}`,
            },
          ]}
        />

        {item.buyOrderDetails.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Buy orders
            </h4>
            <div className="border-border/60 bg-muted/20 overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="bg-muted/60 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Order ID</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                    <th className="px-3 py-2 text-left font-medium">Qty</th>
                    <th className="px-3 py-2 text-left font-medium">Requested</th>
                    <th className="px-3 py-2 text-left font-medium">Filled</th>
                    <th className="px-3 py-2 text-left font-medium">Diff</th>
                    <th className="px-3 py-2 text-left font-medium">Slippage %</th>
                    <th className="px-3 py-2 text-left font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {item.buyOrderDetails.map((buy) => {
                    const slip = buySlippage(buy)
                    return (
                      <tr key={buy.id} className="border-border/50 border-t">
                        <td className="px-3 py-2 font-mono text-xs">
                          {buy.order_id ?? '—'}
                        </td>
                        <td className="px-3 py-2">{buy.o_status ?? '—'}</td>
                        <td className="px-3 py-2">{buy.r_quantity ?? '—'}</td>
                        <td className="px-3 py-2 tabular-nums">
                          {formatNumber(slip.requested)}
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          {formatNumber(slip.filled)}
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          {formatNumber(slip.diff)}
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          {formatPct(slip.pct)}
                        </td>
                        <td className="px-3 py-2">{formatDate(buy.createdAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-xs">
              Buy slippage total:{' '}
              <span className="font-medium tabular-nums">
                {formatPct(buyTotalPct)}
              </span>
            </p>
          </div>
        ) : null}

        {item.sellOrderDetails.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Sell orders
            </h4>
            <div className="border-border/60 bg-muted/20 overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[1180px] text-sm">
                <thead className="bg-muted/60 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Order ID</th>
                    <th className="px-3 py-2 text-left font-medium">Mode</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                    <th className="px-3 py-2 text-left font-medium">Qty</th>
                    <th className="px-3 py-2 text-left font-medium">Requested</th>
                    <th className="px-3 py-2 text-left font-medium">Filled</th>
                    <th className="px-3 py-2 text-left font-medium">Diff</th>
                    <th className="px-3 py-2 text-left font-medium">Slippage %</th>
                    <th className="px-3 py-2 text-left font-medium">Target / SL</th>
                    <th className="px-3 py-2 text-left font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {item.sellOrderDetails.map((sell) => {
                    const slip = sellSlippage(sell)
                    return (
                      <tr
                        key={sell.id}
                        className="border-border/50 border-t align-top"
                      >
                        <td className="px-3 py-2 font-mono text-xs">
                          {sell.order_id ?? '—'}
                        </td>
                        <td className="px-3 py-2">{sell.mode ?? '—'}</td>
                        <td className="px-3 py-2">{sell.o_status ?? '—'}</td>
                        <td className="px-3 py-2">{sell.r_quantity ?? '—'}</td>
                        <td className="px-3 py-2 tabular-nums">
                          {formatNumber(slip.requested)}
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          {formatNumber(slip.filled)}
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          {formatNumber(slip.diff)}
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          {formatPct(slip.pct)}
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          T {formatNumber(sell.target_price)} / SL{' '}
                          {formatNumber(sell.stop_loss_price)}
                        </td>
                        <td className="px-3 py-2">
                          {formatDate(sell.createdAt)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-xs">
              Sell slippage total:{' '}
              <span className="font-medium tabular-nums">
                {formatPct(sellTotalPct)}
              </span>
            </p>
          </div>
        ) : null}

        <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Total slippage: </span>
          <span className="font-medium tabular-nums">{formatPct(totalPct)}</span>
        </div>

        {item.sellOrderDetails.map((sell, i) => {
          const flowRows = orderFlowRows(sell.order_flow)
          if (!flowRows.length) return null
          const flowTitle =
            item.sellOrderDetails.length > 1
              ? `Order flow ${i + 1}`
              : 'Order flow'
          return (
            <details
              key={`flow-${sell.id}`}
              className="group/flow border-border/60 bg-muted/20 rounded-lg border"
            >
              <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
                <ChevronDownIcon className="text-muted-foreground size-4 shrink-0 transition-transform group-open/flow:rotate-180" />
                <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {flowTitle}
                </span>
                <span className="text-muted-foreground text-xs">
                  ({flowRows.length} step{flowRows.length === 1 ? '' : 's'})
                </span>
              </summary>
              <div className="border-border/60 space-y-2 border-t p-2">
                {flowRows.map(([step, payload]) => (
                  <div
                    key={step}
                    className="border-border/50 rounded-md border bg-background px-3 py-2"
                  >
                    <div className="text-muted-foreground mb-1 text-xs font-semibold">
                      Step {step}
                    </div>
                    <pre className="overflow-x-auto text-xs whitespace-pre-wrap">
                      {JSON.stringify(payload, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </details>
          )
        })}

        {item.buyOrderDetails.length === 0 &&
        item.sellOrderDetails.length === 0 ? (
          <p className="text-muted-foreground text-sm">No orders linked.</p>
        ) : null}
      </div>
    </details>
  )
}
