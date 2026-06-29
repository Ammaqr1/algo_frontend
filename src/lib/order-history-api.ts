import { apiRequest } from './auth-api'

export type ExitMode =
  | 'target'
  | 'stop loss'
  | 'other'
  | 'no_buy'
  | 'not_sold'
  | 'unknown'

export type BuyOrderDetail = {
  id: string
  createdAt?: string
  updatedAt?: string
  dataForOrderExecutionId?: string | null
  user?: string
  type?: string
  order_id?: string
  r_quantity?: string
  r_buy_price?: string
  r_ltq?: string | null
  o_status?: string
  o_buyed_quantity?: string
  m_quantity?: string | null
  m_price?: string | null
  m_result?: string | null
  m_buyed_quantity?: string | null
}

export type SellOrderDetail = {
  id: string
  createdAt?: string
  updatedAt?: string
  dataForOrderExecutionId?: string | null
  user?: string | null
  type?: string
  order_id?: string
  r_quantity?: string
  r_ltq?: string | null
  mode?: string
  stop_loss_price?: number
  stop_loss_trigger_price?: number
  target_price?: number
  target_trigger_price?: number
  o_status?: string
  o_buyed_quantity?: number
  m_quantity?: number | null
  m_price?: number | null
  m_result?: string | null
  m_buyed_quantity?: number | null
}

export type OrderHistoryItem = {
  id: string
  createdAt?: string
  updatedAt?: string
  started_time?: string
  at_the_money_time?: string
  at_the_money_price?: string
  exchange?: string
  expiry_date?: string
  ce_ik?: string
  pe_ik?: string
  high_price_ce?: string
  high_price_time_ce?: string
  high_price_pe?: string
  high_price_time_pe?: string
  high_price_start_time?: string
  high_price_end_time?: string
  strategyId?: string | null
  credentialId?: string | null
  buyOrderDetails: BuyOrderDetail[]
  sellOrderDetails: SellOrderDetail[]
  exitMode: ExitMode
  strategy?: Record<string, unknown>
  credentail?: Record<string, unknown>
}

export type OrderHistoryResponse = {
  items: OrderHistoryItem[]
  total: number
  limit: number
  offset: number
}

export type OrderHistoryFilters = {
  date_from: string
  date_to: string
  user_name?: string
  strategy_name?: string
  stratergy_id?: string
  mode?: string
  exchange?: string
  limit?: number
  offset?: number
}

export async function fetchOrderHistory(
  filters: OrderHistoryFilters
): Promise<OrderHistoryResponse> {
  const params = new URLSearchParams({
    date_from: filters.date_from,
    date_to: filters.date_to,
    limit: String(filters.limit ?? 20),
    offset: String(filters.offset ?? 0),
  })
  if (filters.user_name) params.set('user_name', filters.user_name)
  if (filters.stratergy_id) params.set('stratergy_id', filters.stratergy_id)
  else if (filters.strategy_name)
    params.set('strategy_name', filters.strategy_name)
  if (filters.mode) params.set('mode', filters.mode)
  if (filters.exchange) params.set('exchange', filters.exchange)

  return apiRequest<OrderHistoryResponse>(`/api/order-history?${params}`)
}
