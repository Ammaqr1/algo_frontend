import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
  createStrategyForType,
  deleteStrategy,
  fetchStrategyTypeById,
  sessionDetailPath,
  updateStrategy,
  type StrategyGroup,
  type StrategyTypeDetail,
} from '@/lib/strategies-api'

function formatSessionDate(createdAt?: string): string | null {
  if (!createdAt) return null
  const date = new Date(createdAt)
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function StrategyTypeDetailPage() {
  const { id: typeId } = useParams<{ name?: string; id: string }>()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<StrategyTypeDetail | null>(null)
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

  const loadDetail = useCallback(async () => {
    if (!typeId) {
      setError('Strategy type id is missing.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchStrategyTypeById(typeId)
      setDetail(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load strategy type.'
      )
    } finally {
      setLoading(false)
    }
  }, [typeId])

  useEffect(() => {
    void loadDetail()
  }, [loadDetail])

  const sessions = detail?.stratergies ?? []

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
    if (!typeId) return
    const name = newName.trim()
    if (!name) return

    setCreating(true)
    setError(null)
    try {
      const user = getStoredUser()
      const created = await createStrategyForType(typeId, {
        strategy_name: name,
        createdby: user?.name ?? user?.email ?? null,
      })
      setDetail((prev) =>
        prev ? { ...prev, stratergies: [created, ...prev.stratergies] } : prev
      )
      closeCreateDialog()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create session.'
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
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              stratergies: prev.stratergies.map((s) =>
                s.id === editingGroup.id ? updated : s
              ),
            }
          : prev
      )
      closeEditDialog()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update session.'
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
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              stratergies: prev.stratergies.filter(
                (s) => s.id !== deletingGroup.id
              ),
            }
          : prev
      )
      if (editingGroup?.id === deletingGroup.id) closeEditDialog()
      closeDeleteDialog()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete session.'
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
          to="/dashboard/strategies"
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Back to strategy types
        </Link>
      </header>

      <main className="flex flex-1 flex-col px-4 py-8 md:px-6">
        <div className="mx-auto w-full max-w-6xl flex-1">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading sessions…</p>
          ) : error && !detail ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : detail ? (
            <>
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="font-heading text-3xl font-medium tracking-tight">
                    {detail.stratergiesType}
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {sessions.length === 0
                      ? 'No sessions yet.'
                      : `${sessions.length} session${sessions.length === 1 ? '' : 's'}`}
                    {detail.createdby ? ` · By ${detail.createdby}` : null}
                  </p>
                </div>
                <Button type="button" onClick={openCreateDialog}>
                  <PlusIcon data-icon="inline-start" />
                  New session
                </Button>
              </div>

              {error ? (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              {sessions.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">No sessions yet</CardTitle>
                    <CardDescription>
                      Click &quot;New session&quot; to add a strategy session.
                      The session timestamp is recorded automatically.
                    </CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {sessions.map((group) => (
                    <Card
                      key={group.id}
                      role="button"
                      tabIndex={0}
                      className="min-h-44 cursor-pointer transition-colors hover:bg-muted/30"
                      onClick={() =>
                        detail &&
                        navigate(
                          sessionDetailPath(group, {
                            stratergiesType: detail.stratergiesType,
                            id: detail.id,
                          })
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          if (detail) {
                            navigate(
                              sessionDetailPath(group, {
                                stratergiesType: detail.stratergiesType,
                                id: detail.id,
                              })
                            )
                          }
                        }
                      }}
                    >
                      <CardHeader className="px-5 py-6">
                        <CardTitle className="text-lg pr-2">
                          {group.strategy_name}
                        </CardTitle>
                        {group.createdAt ? (
                          <CardDescription>
                            Session {formatSessionDate(group.createdAt)}
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
                              disabled={
                                deleting && deletingGroup?.id === group.id
                              }
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
            </>
          ) : null}
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
            <DialogTitle>New session</DialogTitle>
            <DialogDescription>
              Enter a name for this strategy session. The session time is
              recorded automatically when created.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-session-name">Name</Label>
              <Input
                id="create-session-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. June 21 run"
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
            <DialogTitle>Edit session</DialogTitle>
            <DialogDescription>
              Update the name for this strategy session.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleSaveEdit(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-session-name">Name</Label>
              <Input
                id="edit-session-name"
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
            <DialogTitle>Delete session?</DialogTitle>
            <DialogDescription>
              This will permanently delete{' '}
              <span className="font-medium text-foreground">
                {deletingGroup?.strategy_name}
              </span>
              . Linked config rows will be removed. This action cannot be
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
