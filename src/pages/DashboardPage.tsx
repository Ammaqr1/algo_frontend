import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { clearSession, getStoredUser } from '@/lib/auth-api'

export function DashboardPage() {
  const navigate = useNavigate()
  const user = getStoredUser()

  function handleSignOut() {
    clearSession()
    navigate('/', { replace: true })
  }

  return (
    <div className="bg-background flex min-h-svh flex-col">
      <header className="border-border flex items-center justify-between border-b px-4 py-3 md:px-6">
        <Link
          to="/dashboard"
          className="font-heading text-foreground text-lg font-semibold tracking-tight"
        >
          Algo
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground hidden text-sm sm:inline">
            {user?.email}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 py-8 md:px-6">
        <div className="mx-auto w-full max-w-6xl flex-1">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-medium tracking-tight">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {user?.name
                ? `Welcome back, ${user.name}.`
                : 'Welcome back. Trading tools will appear here as you connect them.'}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Portfolio</CardTitle>
                <CardDescription>
                  Summary and P&amp;L will show here once connected.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-2xl font-medium tabular-nums">
                  —
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Strategies</CardTitle>
                <CardDescription>
                  Run and monitor your algorithmic strategies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">No strategies yet.</p>
              </CardContent>
            </Card>
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Activity</CardTitle>
                <CardDescription>Recent orders and signals.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Nothing to show yet.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
