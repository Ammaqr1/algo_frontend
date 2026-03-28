import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { isAuthenticated } from '@/lib/auth-api'

type RequireAuthProps = {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
