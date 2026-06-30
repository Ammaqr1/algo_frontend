import { useEffect, useState } from 'react'

import { type AuthUser, validateSession } from '@/lib/auth-api'

export type ValidatedSessionState = 'loading' | 'valid' | 'invalid'

export function useValidatedSession() {
  const [state, setState] = useState<ValidatedSessionState>('loading')
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    let cancelled = false

    void validateSession().then((validatedUser) => {
      if (cancelled) return
      setUser(validatedUser)
      setState(validatedUser ? 'valid' : 'invalid')
    })

    return () => {
      cancelled = true
    }
  }, [])

  return { state, user }
}
