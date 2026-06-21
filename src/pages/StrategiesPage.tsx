import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardAction,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getStoredUser } from '@/lib/auth-api'
import {
  createStrategyType,
  deleteStrategyType,
  fetchStrategyTypes,
  strategyTypePath,
  updateStrategyType,
  type StrategyType,
} from '@/lib/strategies-api'

export function StrategiesPage() {
  const navigate = useNavigate()
  const [strategyTypes, setStrategyTypes] = useState<StrategyType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editingType, setEditingType] = useState<StrategyType | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingType, setDeletingType] = useState<StrategyType | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadStrategyTypes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchStrategyTypes()
      setStrategyTypes(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load strategy types.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStrategyTypes()
  }, [loadStrategyTypes])

  function openCreateDialog() {
    setNewName('')
    setCreateOpen(true)
    setError(null)
  }

  function openEditDialog(type: StrategyType) {
    setEditingType(type)
    setEditName(type.stratergiesType)
    setEditOpen(true)
    setError(null)
  }

  function closeCreateDialog() {
    setCreateOpen(false)
    setNewName('')
  }

  function closeEditDialog() {
    setEditOpen(false)
    setEditingType(null)
    setEditName('')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return

    setCreating(true)
    setError(null)
    try {
      const user = getStoredUser()
      const created = await createStrategyType({
        stratergiesType: name,
        createdby: user?.name ?? user?.email ?? null,
      })
      setStrategyTypes((prev) => [created, ...prev])
      closeCreateDialog()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create strategy type.'
      )
    } finally {
      setCreating(false)
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingType) return
    const name = editName.trim()
    if (!name) return

    setSaving(true)
    setError(null)
    try {
      const updated = await updateStrategyType(editingType.id, {
        stratergiesType: name,
      })
      setStrategyTypes((prev) =>
        prev.map((s) => (s.id === editingType.id ? updated : s))
      )
      closeEditDialog()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update strategy type.'
      )
    } finally {
      setSaving(false)
    }
  }

  function openDeleteDialog(type: StrategyType) {
    setDeletingType(type)
    setDeleteOpen(true)
    setError(null)
  }

  function closeDeleteDialog() {
    setDeleteOpen(false)
    setDeletingType(null)
  }

  async function handleConfirmDelete() {
    if (!deletingType) return

    setDeleting(true)
    setError(null)
    try {
      await deleteStrategyType(deletingType.id)
      setStrategyTypes((prev) =>
        prev.filter((s) => s.id !== deletingType.id)
      )
      if (editingType?.id === deletingType.id) closeEditDialog()
      closeDeleteDialog()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete strategy type.'
      )
    } finally {
      setDeleting(false)
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
                Strategies
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Choose a strategy type to view sessions and configs.
              </p>
            </div>
            <Button type="button" onClick={openCreateDialog}>
              <PlusIcon data-icon="inline-start" />
              New strategy type
            </Button>
          </div>

          {error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {loading ? (
            <p className="text-muted-foreground text-sm">Loading strategy types…</p>
          ) : strategyTypes.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">No strategy types yet</CardTitle>
                <CardDescription>
                  Click &quot;New strategy type&quot; to create your first one.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {strategyTypes.map((type) => (
                <Card
                  key={type.id}
                  role="button"
                  tabIndex={0}
                  className="min-h-44 cursor-pointer transition-colors hover:bg-muted/30"
                  onClick={() => navigate(strategyTypePath(type))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(strategyTypePath(type))
                    }
                  }}
                >
                  <CardHeader className="px-5 py-6">
                    <CardTitle className="text-lg pr-2">
                      {type.stratergiesType}
                    </CardTitle>
                    {type.createdAt ? (
                      <CardDescription>
                        Created{' '}
                        {new Date(type.createdAt).toLocaleDateString()}
                      </CardDescription>
                    ) : null}
                    {type.createdby ? (
                      <CardDescription>By {type.createdby}</CardDescription>
                    ) : null}
                    <CardAction>
                      <div
                        className="flex items-center gap-0.5"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${type.stratergiesType}`}
                          onClick={() => openEditDialog(type)}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          aria-label={`Delete ${type.stratergiesType}`}
                          disabled={deleting && deletingType?.id === type.id}
                          onClick={() => openDeleteDialog(type)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </CardAction>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) setNewName('')
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New strategy type</DialogTitle>
            <DialogDescription>
              Enter a name for your strategy type.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-strategy-type-name">Name</Label>
              <Input
                id="create-strategy-type-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Nifty morning"
                disabled={creating}
                autoFocus
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={creating}
                onClick={closeCreateDialog}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating || !newName.trim()}>
                {creating ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) {
            setEditingType(null)
            setEditName('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit strategy type</DialogTitle>
            <DialogDescription>
              Update the name for this strategy type.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleSaveEdit(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-strategy-type-name">Name</Label>
              <Input
                id="edit-strategy-type-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={saving}
                autoFocus
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={closeEditDialog}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !editName.trim()}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog()
          else setDeleteOpen(true)
        }}
      >
        <DialogContent showCloseButton={!deleting}>
          <DialogHeader>
            <DialogTitle>Delete strategy type?</DialogTitle>
            <DialogDescription>
              This will permanently delete{' '}
              <span className="font-medium text-foreground">
                {deletingType?.stratergiesType}
              </span>
              {' '}and all linked sessions. This action cannot be undone.
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
