import { Link, Navigate } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/button'
import { isAuthenticated } from '@/lib/auth-api'
import { cn } from '@/lib/utils'

export function HomePage() {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-12">
      <h1 className="font-heading text-4xl font-medium tracking-tight md:text-5xl">
        Algo
      </h1>
      <p className="text-muted-foreground max-w-md text-center text-base">
        Sign in or create an account to continue.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link
          to="/sign-in"
          className={cn(buttonVariants({ size: 'lg' }))}
        >
          Sign in
        </Link>
        <Link
          to="/sign-up"
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
        >
          Sign up
        </Link>
      </div>
    </div>
  )
}
