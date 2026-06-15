import { apiRequest } from './auth-api'

export type ActivityUsersResponse = {
  users: string[]
}

export async function fetchActivityUsers(): Promise<string[]> {
  const data = await apiRequest<ActivityUsersResponse>('/api/activity-users')
  return data.users ?? []
}
