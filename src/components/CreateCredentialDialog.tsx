import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
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
import type { CreateCredentialInput } from '@/lib/credentials-api'

const EMPTY_FORM: CreateCredentialInput = {
  user: '',
  api_key: '',
  api_secrets: '',
  phone_no: '',
  totp_bar_code: '',
  pin_code: '',
}

type CreateCredentialDialogProps = {
  open: boolean
  saving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CreateCredentialInput) => void | Promise<void>
}

export function CreateCredentialDialog({
  open,
  saving,
  onOpenChange,
  onSubmit,
}: CreateCredentialDialogProps) {
  const [form, setForm] = useState<CreateCredentialInput>(EMPTY_FORM)

  useEffect(() => {
    if (open) setForm(EMPTY_FORM)
  }, [open])

  function setField(key: keyof CreateCredentialInput, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    void onSubmit(form)
  }

  const canSubmit =
    form.user.trim() &&
    form.api_key.trim() &&
    form.api_secrets.trim() &&
    form.phone_no.trim() &&
    form.totp_bar_code.trim() &&
    form.pin_code.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add credentials</DialogTitle>
          <DialogDescription>
            Saves a new broker credential row. Sensitive fields are encrypted
            before storage.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cred-user">User / account name</Label>
            <Input
              id="cred-user"
              value={form.user}
              onChange={(e) => setField('user', e.target.value)}
              autoComplete="off"
              disabled={saving}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cred-api-key">API key</Label>
            <Input
              id="cred-api-key"
              value={form.api_key}
              onChange={(e) => setField('api_key', e.target.value)}
              autoComplete="off"
              disabled={saving}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cred-api-secret">API secret</Label>
            <Input
              id="cred-api-secret"
              type="password"
              value={form.api_secrets}
              onChange={(e) => setField('api_secrets', e.target.value)}
              autoComplete="new-password"
              disabled={saving}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cred-phone">Phone number</Label>
            <Input
              id="cred-phone"
              value={form.phone_no}
              onChange={(e) => setField('phone_no', e.target.value)}
              autoComplete="off"
              disabled={saving}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cred-totp">TOTP secret</Label>
            <Input
              id="cred-totp"
              type="password"
              value={form.totp_bar_code}
              onChange={(e) => setField('totp_bar_code', e.target.value)}
              autoComplete="new-password"
              disabled={saving}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cred-pin">PIN</Label>
            <Input
              id="cred-pin"
              type="password"
              value={form.pin_code}
              onChange={(e) => setField('pin_code', e.target.value)}
              autoComplete="new-password"
              disabled={saving}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !canSubmit}>
              {saving ? 'Saving…' : 'Save credentials'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
