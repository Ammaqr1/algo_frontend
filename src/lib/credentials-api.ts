import { apiRequest } from './auth-api'

export type CredentialSummary = {
  id: string
  user?: string | null
  last_updated_api_secrets?: string | null
  mode?: string | null
  verifiedToday: boolean
}

export type CreateCredentialInput = {
  user: string
  api_key: string
  api_secrets: string
  phone_no: string
  totp_bar_code: string
  pin_code: string
}

export async function fetchCredentials(): Promise<CredentialSummary[]> {
  const data = await apiRequest<{ credentials: CredentialSummary[] }>(
    '/api/credentials'
  )
  return data.credentials ?? []
}

export async function createCredential(
  input: CreateCredentialInput
): Promise<CredentialSummary> {
  return apiRequest<CredentialSummary>('/api/credentials', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function setCredentialMode(
  id: string,
  mode: 'on' | 'off'
): Promise<CredentialSummary> {
  return apiRequest<CredentialSummary>(
    `/api/credentials/${encodeURIComponent(id)}/mode`,
    {
      method: 'PATCH',
      body: JSON.stringify({ mode }),
    }
  )
}
