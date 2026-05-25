const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:5000'

export type ActivityStrategyOption = {
  id: string
  strategy_name: string
}

export type ActivityStrategiesResponse = {
  strategies: ActivityStrategyOption[]
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

export async function fetchActivityStrategies(): Promise<
  ActivityStrategyOption[]
> {
  const res = await fetch(`${API_BASE}/api/activity-strategies`)
  if (!res.ok) {
    throw new Error(await errorMessageFromResponse(res))
  }
  const data = (await res.json()) as ActivityStrategiesResponse
  return data.strategies ?? []
}
