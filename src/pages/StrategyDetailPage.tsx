import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'

import { RunToggle, isRunOn } from '@/components/RunToggle'
import { StrategyConfigFormDialog } from '@/components/StrategyConfigFormDialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  createStrategyConfig,
  deleteStrategyConfig,
  fetchStrategyById,
  setStrategyConfigRun,
  updateStrategyConfig,
  type StrategyConfig,
  type StrategyConfigInput,
  type StrategyGroupDetail,
} from '@/lib/strategies-api'
import { TIME_FIELDS, formatTime24 } from '@/lib/time-utils'

const TABLE_COLUMNS: {
  key: keyof StrategyConfig
  label: string
  cell?: (row: StrategyConfig) => string
}[] = [
  { key: 'week_day', label: 'Week day' },
  { key: 'exchange', label: 'Exchange' },
  {
    key: 'at_time_money',
    label: 'ATM time',
    cell: (row) => formatTime24(row.at_time_money),
  },
  {
    key: 'start_time',
    label: 'Start',
    cell: (row) => formatTime24(row.start_time),
  },
  {
    key: 'end_time',
    label: 'End',
    cell: (row) => formatTime24(row.end_time),
  },
  {
    key: 'end_entry_time',
    label: 'Entry end',
    cell: (row) => formatTime24(row.end_entry_time),
  },
  { key: 'target_price', label: 'Target' },
  { key: 'stop_loss_price', label: 'Stop loss' },
]

function cellValue(row: StrategyConfig, key: keyof StrategyConfig): string {
  if ((TIME_FIELDS as readonly string[]).includes(key)) {
    return formatTime24(row[key] as string | null | undefined)
  }
  const val = row[key]
  if (val === null || val === undefined || val === '') return '—'
  return String(val)
}

export function StrategyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [detail, setDetail] = useState<StrategyGroupDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingConfig, setEditingConfig] = useState<StrategyConfig | null>(
    null
  )
  const [saving, setSaving] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingConfig, setDeletingConfig] = useState<StrategyConfig | null>(
    null
  )
  const [deleting, setDeleting] = useState(false)
  const [togglingRunId, setTogglingRunId] = useState<string | null>(null)

  const loadDetail = useCallback(async () => {
    if (!id) {
      setError('Strategy id is missing.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchStrategyById(id)
      setDetail(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load strategy.'
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void loadDetail()
  }, [loadDetail])

  const configs = detail?.strategy ?? []

  function openCreateForm() {
    setFormMode('create')
    setEditingConfig(null)
    setFormOpen(true)
    setError(null)
  }

  function openEditForm(config: StrategyConfig) {
    setFormMode('edit')
    setEditingConfig(config)
    setFormOpen(true)
    setError(null)
  }

  function openDeleteDialog(config: StrategyConfig) {
    setDeletingConfig(config)
    setDeleteOpen(true)
    setError(null)
  }

  function closeDeleteDialog() {
    setDeleteOpen(false)
    setDeletingConfig(null)
  }

  async function handleFormSubmit(values: StrategyConfigInput) {
    if (!id) return
    setSaving(true)
    setError(null)
    try {
      if (formMode === 'create') {
        await createStrategyConfig(id, values)
      } else if (editingConfig) {
        await updateStrategyConfig(editingConfig.id, values)
      }
      setFormOpen(false)
      setEditingConfig(null)
      await loadDetail()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save config row.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleRun(config: StrategyConfig, checked: boolean) {
    const nextRun = checked ? 'on' : 'off'
    setTogglingRunId(config.id)
    setError(null)
    try {
      const updated = await setStrategyConfigRun(config.id, nextRun)
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              strategy: prev.strategy.map((s) =>
                s.id === config.id ? updated : s
              ),
            }
          : prev
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update run status.'
      )
    } finally {
      setTogglingRunId(null)
    }
  }

  async function handleConfirmDelete() {
    if (!deletingConfig) return
    setDeleting(true)
    setError(null)
    try {
      await deleteStrategyConfig(deletingConfig.id)
      closeDeleteDialog()
      await loadDetail()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete config row.'
      )
    } finally {
      setDeleting(false)
    }
  }

  const deleteLabel =
    deletingConfig?.week_day
      ? `${deletingConfig.week_day} config`
      : 'this config row'

  return (
    <div className="bg-background flex min-h-svh flex-col">
      <header className="border-border flex items-center justify-between border-b px-4 py-3 md:px-6">
        <Link
          to="/dashboard"
          className="font-heading text-foreground text-lg font-semibold tracking-tight"
        >
          Algo
        </Link>
        <Link
          to="/dashboard/strategies"
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Back to strategies
        </Link>
      </header>

      <main className="flex flex-1 flex-col px-4 py-8 md:px-6">
        <div className="mx-auto w-full max-w-6xl flex-1">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading strategy…</p>
          ) : error && !detail ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : detail ? (
            <>
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="font-heading text-3xl font-medium tracking-tight">
                    {detail.strategy_name}
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {configs.length === 0
                      ? 'No config rows yet.'
                      : `${configs.length} config row${configs.length === 1 ? '' : 's'}`}
                    {detail.createdby ? ` · By ${detail.createdby}` : null}
                  </p>
                </div>
                <Button type="button" onClick={openCreateForm}>
                  <PlusIcon data-icon="inline-start" />
                  Add config
                </Button>
              </div>

              {error ? (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              {configs.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">No configs</CardTitle>
                    <CardDescription>
                      Add a config row to define schedule and trading parameters.
                    </CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <div className="ring-foreground/10 overflow-hidden rounded-xl ring-1">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[60rem] border-collapse text-sm">
                      <thead>
                        <tr className="border-border bg-muted/50 border-b">
                          {TABLE_COLUMNS.map((col) => (
                            <th
                              key={col.key}
                              className="text-muted-foreground px-4 py-3 text-left font-medium whitespace-nowrap"
                            >
                              {col.label}
                            </th>
                          ))}
                          <th className="text-muted-foreground px-4 py-3 text-left font-medium whitespace-nowrap">
                            Active
                          </th>
                          <th className="text-muted-foreground px-4 py-3 text-right font-medium whitespace-nowrap">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {configs.map((row) => (
                          <tr
                            key={row.id}
                            className="border-border hover:bg-muted/30 border-b last:border-0"
                          >
                            {TABLE_COLUMNS.map((col) => (
                              <td
                                key={col.key}
                                className="px-4 py-3 whitespace-nowrap"
                              >
                                {col.cell
                                  ? col.cell(row)
                                  : cellValue(row, col.key)}
                              </td>
                            ))}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <RunToggle
                                checked={isRunOn(row.run)}
                                disabled={togglingRunId === row.id}
                                label={`Toggle ${row.week_day ?? 'config'}`}
                                onCheckedChange={(checked) =>
                                  void handleToggleRun(row, checked)
                                }
                              />
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-0.5">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Edit config"
                                  onClick={() => openEditForm(row)}
                                >
                                  <PencilIcon />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-destructive hover:text-destructive"
                                  aria-label="Delete config"
                                  onClick={() => openDeleteDialog(row)}
                                >
                                  <Trash2Icon />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </main>

      <StrategyConfigFormDialog
        open={formOpen}
        mode={formMode}
        initial={editingConfig}
        saving={saving}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingConfig(null)
        }}
        onSubmit={handleFormSubmit}
      />

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog()
          else setDeleteOpen(true)
        }}
      >
        <DialogContent showCloseButton={!deleting}>
          <DialogHeader>
            <DialogTitle>Delete config row?</DialogTitle>
            <DialogDescription>
              This will permanently delete{' '}
              <span className="font-medium text-foreground">{deleteLabel}</span>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={closeDeleteDialog}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => void handleConfirmDelete()}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
