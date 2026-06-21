import { apiRequest } from './auth-api'

export type StrategyType = {
  id: string
  stratergiesType: string
  createdAt?: string
  updatedAt?: string
  createdby?: string | null
}

export type StrategyTypeDetail = StrategyType & {
  stratergies: StrategyGroup[]
}

export type CreateStrategyTypeInput = {
  stratergiesType: string
  createdby?: string | null
}

export type UpdateStrategyTypeInput = {
  stratergiesType?: string
  createdby?: string | null
}

export type StrategyGroup = {
  id: string
  strategy_name: string
  stratergiesTypeId?: string | null
  stratergiesTypeName?: string | null
  createdAt?: string
  updatedAt?: string
  createdby?: string | null
}

export function strategyTypePath(type: {
  stratergiesType: string
  id: string
}): string {
  return `/dashboard/strategies/${encodeURIComponent(type.stratergiesType)}/${encodeURIComponent(type.id)}`
}

export function sessionDetailPath(
  group: StrategyGroup,
  type: { stratergiesType: string; id: string }
): string {
  return `/dashboard/strategies/${encodeURIComponent(type.stratergiesType)}/${encodeURIComponent(type.id)}/${encodeURIComponent(group.strategy_name)}/${encodeURIComponent(group.id)}`
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
  run_today?: string | null
  c_a_n?: string | null
  can_p?: string | null
  d_n_s?: string | null
  d_n_s_trigger?: string | null
  d_n_s_target?: string | null
  paper_trade?: string | null
  stratergies_id?: string | null
  createdAt?: string
  updatedAt?: string
}

export type StrategyGroupDetail = StrategyGroup & {
  strategy: StrategyConfig[]
}

export type CreateStrategyInput = {
  strategy_name: string
  stratergiesTypeId?: string
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
  run_today?: string | null
  c_a_n?: string | null
  can_p?: string | null
  d_n_s?: string | null
  d_n_s_trigger?: string | null
  d_n_s_target?: string | null
  paper_trade?: string | null
}

export async function fetchStrategyTypes(): Promise<StrategyType[]> {
  return apiRequest<StrategyType[]>('/api/strategy-types')
}

export async function fetchStrategyTypeById(
  id: string
): Promise<StrategyTypeDetail> {
  return apiRequest<StrategyTypeDetail>(
    `/api/strategy-types/${encodeURIComponent(id)}`
  )
}

export async function createStrategyType(
  input: CreateStrategyTypeInput
): Promise<StrategyType> {
  return apiRequest<StrategyType>('/api/strategy-types', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateStrategyType(
  id: string,
  input: UpdateStrategyTypeInput
): Promise<StrategyType> {
  return apiRequest<StrategyType>(
    `/api/strategy-types/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    }
  )
}

export async function deleteStrategyType(id: string): Promise<void> {
  await apiRequest<void>(`/api/strategy-types/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function fetchStrategiesByTypeId(
  typeId: string
): Promise<StrategyGroup[]> {
  return apiRequest<StrategyGroup[]>(
    `/api/strategy-types/${encodeURIComponent(typeId)}/strategies`
  )
}

export async function createStrategyForType(
  typeId: string,
  input: Omit<CreateStrategyInput, 'stratergiesTypeId'>
): Promise<StrategyGroup> {
  return apiRequest<StrategyGroup>(
    `/api/strategy-types/${encodeURIComponent(typeId)}/strategies`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  )
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
