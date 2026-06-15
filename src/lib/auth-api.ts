export const API_BASE =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_PROD_API_URL;

export const AUTH_TOKEN_KEY = "access_token";
export const AUTH_USER_KEY = "auth_user";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
};

export type AuthSuccess = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
};

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

async function errorMessageFromResponse(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
    ) {
      return (data as { error: string }).error;
    }
  } catch {
    /* ignore */
  }
  return res.statusText || "Request failed";
}

function isTokenExpired(token: string): boolean {
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return true;
    const payload = JSON.parse(
      atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: number };
    if (typeof payload.exp !== "number") return true;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function authHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body != null) {
    headers.set("Content-Type", "application/json");
  }
  const token = getStoredToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

export async function authFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: authHeaders(init),
  });

  if (res.status === 401) {
    clearSession();
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/sign-in") &&
      !window.location.pathname.startsWith("/sign-up")
    ) {
      window.location.assign("/sign-in");
    }
    throw new AuthError(await errorMessageFromResponse(res), 401);
  }

  return res;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await authFetch(path, init);
  if (!res.ok) {
    throw new Error(await errorMessageFromResponse(res));
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthSuccess> {
  const res = await fetch(`${API_BASE}/api/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(await errorMessageFromResponse(res));
  }
  return res.json() as Promise<AuthSuccess>;
}

export async function signupRequest(
  email: string,
  password: string,
  name: string | null,
): Promise<AuthSuccess> {
  const res = await fetch(`${API_BASE}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) {
    throw new Error(await errorMessageFromResponse(res));
  }
  return res.json() as Promise<AuthSuccess>;
}

export function persistSession(data: AuthSuccess): void {
  localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = getStoredToken();
  const user = getStoredUser();
  if (!token || !user) return false;
  if (isTokenExpired(token)) {
    clearSession();
    return false;
  }
  return true;
}
