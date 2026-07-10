import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@code-sherpas/pharos-react';

const ROLES = { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' };

/**
 * A centered confirmation/short-form Dialog. Like NewProjectSheet, it embeds a
 * Select so the harness proves a listbox opened from INSIDE a centered modal
 * still stacks above the panel (the nested-overlay z-index case, in the Dialog
 * shape this time).
 */
export function InviteDialog() {
  const [role, setRole] = useState('editor');

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm">Invite teammate</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite teammate</DialogTitle>
          <DialogDescription>Send an invite to join your team.</DialogDescription>
        </DialogHeader>

        <div className="field">
          <label htmlFor="invite-email">Email</label>
          <Input id="invite-email" type="email" placeholder="teammate@company.com" />
        </div>

        <div className="field">
          <label id="invite-role-label">Role</label>
          <Select items={ROLES} value={role} onValueChange={(v) => setRole(v ?? '')}>
            <SelectTrigger aria-labelledby="invite-role-label">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <DialogClose render={<Button intent="ghost">Cancel</Button>} />
          <DialogClose render={<Button>Send invite</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
