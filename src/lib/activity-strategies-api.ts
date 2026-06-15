import { apiRequest } from './auth-api'

export type ActivityStrategyOption = {
  id: string
  strategy_name: string
}

export type ActivityStrategiesResponse = {
  strategies: ActivityStrategyOption[]
}

export async function fetchActivityStrategies(): Promise<
  ActivityStrategyOption[]
> {
  const data = await apiRequest<ActivityStrategiesResponse>(
    '/api/activity-strategies'
  )
  return data.strategies ?? []
}
