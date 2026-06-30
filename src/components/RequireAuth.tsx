import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useValidatedSession } from '@/hooks/useValidatedSession'

type RequireAuthProps = {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()
  const { state } = useValidatedSession()

  if (state === 'loading') {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center px-4 py-12 text-sm">
        Checking session…
      </div>
    )
  }

  if (state === 'invalid') {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
