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
 * members out as a list or a grid, the segmented view switch.
 */
type Layout = 'list' | 'grid';

export function TeamPage() {
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [layout, setLayout] = useState<Layout>('list');
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
          {members.map((m) => (
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
