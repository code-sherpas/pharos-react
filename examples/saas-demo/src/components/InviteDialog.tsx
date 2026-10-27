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
  useToast,
} from '@code-sherpas/pharos-react';

const ROLES = { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' };

/**
 * A centered confirmation/short-form Dialog. Like NewProjectSheet, it embeds a
 * Select so the harness proves a listbox opened from INSIDE a centered modal
 * still stacks above the panel (the nested-overlay z-index case, in the Dialog
 * shape this time). "Copy invite link" raises a toast while the modal is open,
 * which must paint above it (D29: toast 1700 > modal 1400).
 */
export function InviteDialog() {
  const [role, setRole] = useState('editor');
  const [email, setEmail] = useState('');
  const toast = useToast();
  // Unavailable until there is an address, the focusable way (aria-disabled):
  // it keeps its place in the tab order and says why it cannot be pressed.
  const canSend = email.trim() !== '';

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
          <Input
            id="invite-email"
            type="email"
            placeholder="teammate@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          {!canSend && (
            <p id="invite-email-hint" className="hint-text">
              Add an email to send the invite.
            </p>
          )}
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
          <Button
            intent="secondary"
            onClick={() => toast.add({ title: 'Invite link copied.', variant: 'success' })}
          >
            Copy invite link
          </Button>
          <DialogClose render={<Button intent="ghost">Cancel</Button>} />
          <DialogClose
            render={
              <Button
                aria-disabled={!canSend}
                aria-describedby={canSend ? undefined : 'invite-email-hint'}
              >
                Send invite
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
