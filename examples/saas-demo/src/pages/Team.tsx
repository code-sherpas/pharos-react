import { useRef, useState, type MouseEvent } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ToggleGroup,
  ToggleGroupItem,
  useToast,
} from '@code-sherpas/pharos-react';
import { MoreHorizontal } from 'lucide-react';
import { requestRemoval } from '../api';
import { MEMBERS, ROLE_TONE, initials, type Member } from '../data';

/**
 * A member list with a per-row DropdownMenu (kebab IconButton). The canonical
 * "row actions" composition, and the harness's check that a menu opened deep
 * in a list still works — including a destructive action that mutates the
 * list. Removing asks first in an AlertDialog — opened from the menu item, so
 * it is controlled rather than given a trigger. The removal is a request that
 * takes time: the confirmation stays open and pending until it answers, says so
 * in a status region, shows the error and offers Retry if it fails
 * (Katherine Johnson's first removal does), and is then confirmed by a toast that can undo
 * it. A ToggleGroup above it lays the
 * members out as a list or a grid, the segmented view switch, next to a role
 * filter: a Select whose trigger is a narrow pill as wide as its value, the
 * filter-bar composition whose list must still fit its options on one line.
 */
type Layout = 'list' | 'grid';
type RoleFilter = 'any' | Member['role'];

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: 'any', label: 'Any role' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Editor', label: 'Editor' },
  { value: 'Viewer', label: 'Viewer' },
];

export function TeamPage() {
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [layout, setLayout] = useState<Layout>('list');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('any');
  // Kept after closing so the title does not empty out during the exit motion.
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removalFailed, setRemovalFailed] = useState(false);
  // The row's kebab, where focus goes back when the confirmation is cancelled.
  const removalTrigger = useRef<HTMLElement | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const toast = useToast();

  function askToRemove(member: Member) {
    removalTrigger.current = document.getElementById(`actions-${member.id}`);
    setMemberToRemove(member);
    setRemovalFailed(false);
    setConfirmingRemoval(true);
  }

  /**
   * Keeps the confirmation open while the request travels; closes it once the
   * member is removed, or leaves it open with the error so it can be retried.
   */
  async function confirmRemoval(event: MouseEvent) {
    event.preventDefault();
    if (!memberToRemove) return;
    setRemovalFailed(false);
    setRemoving(true);
    const outcome = await requestRemoval(memberToRemove);
    setRemoving(false);
    if (outcome === 'failed') {
      setRemovalFailed(true);
      return;
    }
    remove(memberToRemove);
    setConfirmingRemoval(false);
  }

  /** Back to the kebab; if its row was removed, to the page heading. */
  function focusAfterRemoval(): HTMLElement | null {
    const trigger = removalTrigger.current;
    return trigger?.isConnected ? trigger : heading.current;
  }

  function remove(member: Member) {
    setMembers((current) => current.filter((m) => m.id !== member.id));
    toast.add({
      title: `${member.name} removed from the team.`,
      action: {
        children: 'Undo',
        onClick: () => setMembers((current) => [...current, member]),
      },
    });
  }

  function resend(member: Member) {
    toast.add({ title: `Invite resent to ${member.email}.`, variant: 'success' });
  }

  return (
    <section>
      <div className="page-head">
        <h1 ref={heading} tabIndex={-1}>
          Team
        </h1>
        <Select
          value={roleFilter}
          onValueChange={function filterByRole(next) {
            setRoleFilter((next ?? 'any') as RoleFilter);
          }}
          items={ROLE_FILTERS}
        >
          <SelectTrigger aria-label="Role" size="sm" className="filter-pill">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_FILTERS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ToggleGroup
          aria-label="Layout"
          size="sm"
          value={[layout]}
          onValueChange={function showLayout(next) {
            setLayout(next[0] as Layout);
          }}
        >
          <ToggleGroupItem value="list">List</ToggleGroupItem>
          <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <Card>
        <ul className="member-list" data-layout={layout}>
          {members
            .filter((m) => roleFilter === 'any' || m.role === roleFilter)
            .map((m) => (
              <li key={m.id} className="member-row">
                <Avatar size="sm" aria-label={m.name}>
                  <AvatarFallback>{initials(m.name)}</AvatarFallback>
                </Avatar>
                <div className="member-id">
                  <span className="member-name">{m.name}</span>
                  <span className="member-email">{m.email}</span>
                </div>
                <Badge variant={ROLE_TONE[m.role]}>{m.role}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <IconButton
                        id={`actions-${m.id}`}
                        size="sm"
                        aria-label={`Actions for ${m.name}`}
                      >
                        <MoreHorizontal size={16} aria-hidden="true" />
                      </IconButton>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => resend(m)}>Resend invite</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => askToRemove(m)}>
                      Remove from team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
        </ul>
      </Card>
      <AlertDialog open={confirmingRemoval} onOpenChange={setConfirmingRemoval} pending={removing}>
        <AlertDialogContent finalFocus={focusAfterRemoval}>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {memberToRemove?.name} from the team?</AlertDialogTitle>
            <AlertDialogDescription>
              They lose access to every project in Nimbus straight away.
            </AlertDialogDescription>
            {/* Always rendered, so the text is announced when it arrives. */}
            <p role="status" className="hint-text">
              {removing ? `Removing ${memberToRemove?.name}…` : ''}
            </p>
            <p role="alert" className="error-text">
              {removalFailed
                ? `${memberToRemove?.name} could not be removed. Check your connection and retry.`
                : ''}
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* Labels that say what each does, not «Cancel» / «Remove»: at 320px
             * they no longer fit side by side, and the footer wraps them. */}
            <AlertDialogCancel>Keep {memberToRemove?.name} on the team</AlertDialogCancel>
            <AlertDialogAction intent="destructive" onClick={confirmRemoval}>
              {removalFailed ? 'Retry' : `Remove ${memberToRemove?.name}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
