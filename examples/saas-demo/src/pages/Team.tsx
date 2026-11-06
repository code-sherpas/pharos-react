import { useState } from 'react';
import {
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
import { MEMBERS, ROLE_TONE, initials, type Member } from '../data';

/**
 * A member list with a per-row DropdownMenu (kebab IconButton). The canonical
 * "row actions" composition, and the harness's check that a menu opened deep
 * in a list still works — including a destructive action that mutates the
 * list, confirmed by a toast that can undo it. A ToggleGroup above it lays the
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
  const toast = useToast();

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
        <h1>Team</h1>
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
                      <IconButton size="sm" aria-label={`Actions for ${m.name}`}>
                        <MoreHorizontal size={16} aria-hidden="true" />
                      </IconButton>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => resend(m)}>Resend invite</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => remove(m)}>
                      Remove from team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
        </ul>
      </Card>
    </section>
  );
}
