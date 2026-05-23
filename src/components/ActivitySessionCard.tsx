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
            { label: 'Scan window', value: `${item.high_price_start_time ?? '—'} – ${item.high_price_end_time ?? '—'}` },
          ]}
        />

        {item.buyOrderDetails.map((buy, i) => (
          <DetailGrid
            key={buy.id}
            title={`Buy order${item.buyOrderDetails.length > 1 ? ` ${i + 1}` : ''}`}
            rows={[
              { label: 'User', value: buy.user },
              { label: 'Type', value: buy.type },
              { label: 'Order ID', value: buy.order_id },
              { label: 'Status', value: buy.o_status },
              { label: 'Quantity', value: buy.r_quantity },
              { label: 'Buy price', value: buy.r_buy_price },
              { label: 'Filled qty', value: buy.o_buyed_quantity },
              { label: 'Created', value: formatDate(buy.createdAt) },
            ]}
          />
        ))}

        {item.sellOrderDetails.map((sell, i) => (
          <DetailGrid
            key={sell.id}
            title={`Sell order${item.sellOrderDetails.length > 1 ? ` ${i + 1}` : ''}`}
            rows={[
              { label: 'User', value: sell.user },
              { label: 'Type', value: sell.type },
              { label: 'Mode', value: sell.mode },
              { label: 'Order ID', value: sell.order_id },
              { label: 'Status', value: sell.o_status },
              { label: 'Quantity', value: sell.r_quantity },
              { label: 'Target', value: sell.target_price },
              { label: 'Target trigger', value: sell.target_trigger_price },
              { label: 'Stop loss', value: sell.stop_loss_price },
              { label: 'SL trigger', value: sell.stop_loss_trigger_price },
              { label: 'Filled qty', value: sell.o_buyed_quantity },
              { label: 'Created', value: formatDate(sell.createdAt) },
            ]}
          />
        ))}

        {item.buyOrderDetails.length === 0 && item.sellOrderDetails.length === 0 ? (
          <p className="text-muted-foreground text-sm">No orders linked.</p>
        ) : null}
      </div>
    </details>
  )
}
