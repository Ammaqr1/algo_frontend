const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:5000'

export type StrategyGroup = {
  id: string
  strategy_name: string
  createdAt?: string
  updatedAt?: string
  createdby?: string | null
}

export type StrategyConfig = {
  id: string
  strategy_name?: string | null
  week_day?: string | null
  at_time_money?: string | null
  start_time?: string | null
  end_time?: string | null
  end_entry_time?: string | null
  exchange?: string | null
  target_price?: string | null
  stop_loss_price?: string | null
  target_trigger_price_percentage?: string | null
  stoploss_trigger_price_percentage?: string | null
  run?: string | null
  stratergies_id?: string | null
  createdAt?: string
  updatedAt?: string
}

export type StrategyGroupDetail = StrategyGroup & {
  strategy: StrategyConfig[]
}

export type CreateStrategyInput = {
  strategy_name: string
  createdby?: string | null
}

export type UpdateStrategyInput = {
  strategy_name?: string
  createdby?: string | null
}

export type StrategyConfigInput = {
  strategy_name?: string | null
  week_day?: string | null
  at_time_money?: string | null
  start_time?: string | null
  end_time?: string | null
  end_entry_time?: string | null
  exchange?: string | null
  target_price?: string | null
  stop_loss_price?: string | null
  target_trigger_price_percentage?: string | null
  stoploss_trigger_price_percentage?: string | null
  run?: string | null
}

async function errorMessageFromResponse(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json()
    if (
      data &&
      typeof data === 'object' &&
      'error' in data &&
      typeof (data as { error: unknown }).error === 'string'
    ) {
      return (data as { error: string }).error
    }
  } catch {
    /* ignore */
  }
  return res.statusText || 'Request failed'
}

async function apiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    throw new Error(await errorMessageFromResponse(res))
  }
  if (res.status === 204) {
    return undefined as T
  }
  return res.json() as Promise<T>
}

export async function fetchStrategies(): Promise<StrategyGroup[]> {
  return apiRequest<StrategyGroup[]>('/api/strategies')
}

export async function fetchStrategyById(id: string): Promise<StrategyGroupDetail> {
  return apiRequest<StrategyGroupDetail>(
    `/api/strategies/${encodeURIComponent(id)}`
  )
}

export async function createStrategy(
  input: CreateStrategyInput
): Promise<StrategyGroup> {
  return apiRequest<StrategyGroup>('/api/strategies', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateStrategy(
  id: string,
  input: UpdateStrategyInput
): Promise<StrategyGroup> {
  return apiRequest<StrategyGroup>(`/api/strategies/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function deleteStrategy(id: string): Promise<void> {
  await apiRequest<void>(`/api/strategies/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function createStrategyConfig(
  stratergyId: string,
  input: StrategyConfigInput
): Promise<StrategyConfig> {
  return apiRequest<StrategyConfig>(
    `/api/stratergies/${encodeURIComponent(stratergyId)}/configs`,
    { method: 'POST', body: JSON.stringify(input) }
  )
}

export async function updateStrategyConfig(
  configId: string,
  input: StrategyConfigInput
): Promise<StrategyConfig> {
  return apiRequest<StrategyConfig>(
    `/api/strategy-configs/${encodeURIComponent(configId)}`,
    { method: 'PATCH', body: JSON.stringify(input) }
  )
}

export async function deleteStrategyConfig(configId: string): Promise<void> {
  await apiRequest<void>(
    `/api/strategy-configs/${encodeURIComponent(configId)}`,
    { method: 'DELETE' }
  )
}

export async function setStrategyConfigRun(
  configId: string,
  run: 'on' | 'off'
): Promise<StrategyConfig> {
  return apiRequest<StrategyConfig>(
    `/api/strategy-configs/${encodeURIComponent(configId)}/run`,
    { method: 'PATCH', body: JSON.stringify({ run }) }
  )
}

export async function toggleStrategyConfigRun(
  configId: string
): Promise<StrategyConfig> {
  return apiRequest<StrategyConfig>(
    `/api/strategy-configs/${encodeURIComponent(configId)}/toggle-run`,
    { method: 'POST' }
  )
}
