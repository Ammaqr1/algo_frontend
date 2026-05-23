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
  createStrategy,
  deleteStrategy,
  fetchStrategies,
  updateStrategy,
  type StrategyGroup,
} from '@/lib/strategies-api'

export function StrategiesPage() {
  const navigate = useNavigate()
  const [strategies, setStrategies] = useState<StrategyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<StrategyGroup | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingGroup, setDeletingGroup] = useState<StrategyGroup | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadStrategies = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchStrategies()
      setStrategies(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load strategies.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStrategies()
  }, [loadStrategies])

  function openCreateDialog() {
    setNewName('')
    setCreateOpen(true)
    setError(null)
  }

  function openEditDialog(group: StrategyGroup) {
    setEditingGroup(group)
    setEditName(group.strategy_name)
    setEditOpen(true)
    setError(null)
  }

  function closeCreateDialog() {
    setCreateOpen(false)
    setNewName('')
  }

  function closeEditDialog() {
    setEditOpen(false)
    setEditingGroup(null)
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
      const created = await createStrategy({
        strategy_name: name,
        createdby: user?.name ?? user?.email ?? null,
      })
      setStrategies((prev) => [created, ...prev])
      closeCreateDialog()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create strategy.'
      )
    } finally {
      setCreating(false)
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingGroup) return
    const name = editName.trim()
    if (!name) return

    setSaving(true)
    setError(null)
    try {
      const updated = await updateStrategy(editingGroup.id, {
        strategy_name: name,
      })
      setStrategies((prev) =>
        prev.map((s) => (s.id === editingGroup.id ? updated : s))
      )
      closeEditDialog()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update strategy.'
      )
    } finally {
      setSaving(false)
    }
  }

  function openDeleteDialog(group: StrategyGroup) {
    setDeletingGroup(group)
    setDeleteOpen(true)
    setError(null)
  }

  function closeDeleteDialog() {
    setDeleteOpen(false)
    setDeletingGroup(null)
  }

  async function handleConfirmDelete() {
    if (!deletingGroup) return

    setDeleting(true)
    setError(null)
    try {
      await deleteStrategy(deletingGroup.id)
      setStrategies((prev) =>
        prev.filter((s) => s.id !== deletingGroup.id)
      )
      if (editingGroup?.id === deletingGroup.id) closeEditDialog()
      closeDeleteDialog()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete strategy.'
      )
    } finally {
      setDeleting(false)
    }
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
                Create, rename, and remove strategy groups.
              </p>
            </div>
            <Button type="button" onClick={openCreateDialog}>
              <PlusIcon data-icon="inline-start" />
              New strategy
            </Button>
          </div>

          {error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {loading ? (
            <p className="text-muted-foreground text-sm">Loading strategies…</p>
          ) : strategies.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">No strategies yet</CardTitle>
                <CardDescription>
                  Click &quot;New strategy&quot; to create your first one.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {strategies.map((group) => (
                <Card
                  key={group.id}
                  role="button"
                  tabIndex={0}
                  className="min-h-44 cursor-pointer transition-colors hover:bg-muted/30"
                  onClick={() =>
                    navigate(
                      `/dashboard/strategies/${encodeURIComponent(group.id)}`
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(
                        `/dashboard/strategies/${encodeURIComponent(group.id)}`
                      )
                    }
                  }}
                >
                  <CardHeader className="px-5 py-6">
                    <CardTitle className="text-lg pr-2">
                      {group.strategy_name}
                    </CardTitle>
                    {group.createdAt ? (
                      <CardDescription>
                        Created{' '}
                        {new Date(group.createdAt).toLocaleDateString()}
                      </CardDescription>
                    ) : null}
                    {group.createdby ? (
                      <CardDescription>By {group.createdby}</CardDescription>
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
                          aria-label={`Edit ${group.strategy_name}`}
                          onClick={() => openEditDialog(group)}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          aria-label={`Delete ${group.strategy_name}`}
                          disabled={deleting && deletingGroup?.id === group.id}
                          onClick={() => openDeleteDialog(group)}
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
            <DialogTitle>New strategy</DialogTitle>
            <DialogDescription>
              Enter a name for your strategy group.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-strategy-name">Name</Label>
              <Input
                id="create-strategy-name"
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
            setEditingGroup(null)
            setEditName('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit strategy</DialogTitle>
            <DialogDescription>
              Update the name for this strategy group.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleSaveEdit(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-strategy-name">Name</Label>
              <Input
                id="edit-strategy-name"
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
            <DialogTitle>Delete strategy?</DialogTitle>
            <DialogDescription>
              This will permanently delete{' '}
              <span className="font-medium text-foreground">
                {deletingGroup?.strategy_name}
              </span>
              . Linked config rows will be unlinked. This action cannot be
              undone.
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
