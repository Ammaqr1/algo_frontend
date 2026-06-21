import { apiRequest } from './auth-api'

export type ScheduleDayInfo = {
  weekday: string
  date: string
  label: string
}

export type ScheduledStrategyItem = {
  configId: string
  week_day?: string | null
  exchange?: string | null
  at_time_money?: string | null
  start_time?: string | null
  end_time?: string | null
  end_entry_time?: string | null
  run?: string | null
  run_today?: string | null
  paper_trade?: string | null
  sessionId?: string | null
  sessionName?: string | null
  typeId?: string | null
  typeName?: string | null
  matchReason: 'week_day' | 'run_today'
}

export type ScheduledStrategyGroup = {
  typeId?: string | null
  typeName: string
  today: ScheduledStrategyItem[]
  tomorrow: ScheduledStrategyItem[]
}

export type RunningSchedule = {
  today: ScheduleDayInfo
  tomorrow: ScheduleDayInfo
  groups: ScheduledStrategyGroup[]
}

export async function fetchRunningSchedule(): Promise<RunningSchedule> {
  return apiRequest<RunningSchedule>('/api/scheduled-strategies')
}
