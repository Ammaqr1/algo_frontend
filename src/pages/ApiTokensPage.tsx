import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2Icon, PlusIcon } from 'lucide-react'

import { CreateCredentialDialog } from '@/components/CreateCredentialDialog'
import { RunToggle, isRunOn, runFromChecked } from '@/components/RunToggle'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  createCredential,
  fetchCredentials,
  setCredentialMode,
  type CreateCredentialInput,
  type CredentialSummary,
} from '@/lib/credentials-api'

function formatLastUpdated(value?: string | null): string {
  if (!value?.trim()) return '—'
  const text = value.trim()
  const iso = text.match(/^(\d{4}-\d{2}-\d{2})/)
  if (iso) {
    const date = new Date(`${iso[1]}T12:00:00`)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, { dateStyle: 'medium' })
    }
  }
  return text
}

export function ApiTokensPage() {
  const [credentials, setCredentials] = useState<CredentialSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const loadCredentials = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCredentials()
      setCredentials(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load API tokens.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCredentials()
  }, [loadCredentials])

  async function handleModeToggle(credential: CredentialSummary, checked: boolean) {
    setTogglingId(credential.id)
    setError(null)
    try {
      const updated = await setCredentialMode(
        credential.id,
        runFromChecked(checked)
      )
      setCredentials((prev) =>
        prev.map((c) => (c.id === credential.id ? updated : c))
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update mode.'
      )
    } finally {
      setTogglingId(null)
    }
  }

  async function handleCreate(values: CreateCredentialInput) {
    setCreating(true)
    setError(null)
    try {
      const created = await createCredential({
        user: values.user.trim(),
        api_key: values.api_key.trim(),
        api_secrets: values.api_secrets.trim(),
        phone_no: values.phone_no.trim(),
        totp_bar_code: values.totp_bar_code.trim(),
        pin_code: values.pin_code.trim(),
      })
      setCredentials((prev) => [created, ...prev])
      setCreateOpen(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save credentials.'
      )
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-border bg-background/75 supports-[backdrop-filter]:bg-background/60 flex items-center justify-between border-b px-4 py-3 backdrop-blur-md md:px-6">
        <Link
          to="/dashboard"
          className="font-heading text-foreground text-lg font-semibold tracking-tight"
        >
          Algo
        </Link>
        <Link
          to="/dashboard"
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Back to dashboard
        </Link>
      </header>

      <main className="flex flex-1 flex-col px-4 py-8 md:px-6">
        <div className="mx-auto w-full max-w-6xl flex-1">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-medium tracking-tight">
                API tokens
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                API key will update every Monday to Friday except market holidays
                at 8:00 AM.
              </p>
            </div>
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              Add credentials
            </Button>
          </div>

          {error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {loading ? (
            <p className="text-muted-foreground text-sm">Loading tokens…</p>
          ) : credentials.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">No tokens found</CardTitle>
                <CardDescription>
                  Click &quot;Add credentials&quot; to save your first broker
                  account.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="ring-foreground/10 overflow-hidden rounded-xl ring-1">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[32rem] border-collapse bg-card text-sm">
                  <thead>
                    <tr className="border-border bg-muted/50 border-b">
                      <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                        User
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                        Last updated
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                        Mode
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {credentials.map((row) => (
                      <tr
                        key={row.id}
                        className="border-border hover:bg-muted/30 border-b last:border-0"
                      >
                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                          {row.user?.trim() || '—'}
                        </td>
                        <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                          {formatLastUpdated(row.last_updated_api_secrets)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <RunToggle
                            checked={isRunOn(row.mode)}
                            disabled={togglingId === row.id}
                            label={`Toggle mode for ${row.user ?? 'user'}`}
                            onCheckedChange={(checked) =>
                              void handleModeToggle(row, checked)
                            }
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.verifiedToday ? (
                            <span className="text-emerald-600 inline-flex items-center gap-1.5 text-xs font-medium dark:text-emerald-400">
                              <CheckCircle2Icon className="size-4 shrink-0" />
                              Verified today
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <CreateCredentialDialog
        open={createOpen}
        saving={creating}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
    </div>
  )
}
