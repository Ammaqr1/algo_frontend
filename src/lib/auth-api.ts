const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:5000'

export const AUTH_TOKEN_KEY = 'access_token'
export const AUTH_USER_KEY = 'auth_user'

export type AuthUser = {
  id: string
  email: string
  name: string | null
}

export type AuthSuccess = {
  access_token: string
  token_type: string
  expires_in: number
  user: AuthUser
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

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthSuccess> {
  console.log(`${API_BASE}/api/signin`)
  const res = await fetch(`${API_BASE}/api/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    throw new Error(await errorMessageFromResponse(res))
  }
  return res.json() as Promise<AuthSuccess>
}

export async function signupRequest(
  email: string,
  password: string,
  name: string | null,
): Promise<AuthSuccess> {
  const res = await fetch(`${API_BASE}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })
  if (!res.ok) {
    throw new Error(await errorMessageFromResponse(res))
  }
  return res.json() as Promise<AuthSuccess>
}

export function persistSession(data: AuthSuccess): void {
  localStorage.setItem(AUTH_TOKEN_KEY, data.access_token)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user))
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getStoredToken() && getStoredUser())
}
