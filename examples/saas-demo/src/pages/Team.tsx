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
} from '@code-sherpas/pharos-react';
import { MoreHorizontal } from 'lucide-react';
import { MEMBERS, ROLE_TONE, initials, type Member } from '../data';

/**
 * A member list with a per-row DropdownMenu (kebab IconButton). The canonical
 * "row actions" composition, and the harness's check that a menu opened deep
 * in a list still works — including a destructive action that mutates the
 * list.
 */
export function TeamPage() {
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [notice, setNotice] = useState<string | null>(null);

  function remove(member: Member) {
    setMembers((current) => current.filter((m) => m.id !== member.id));
    setNotice(`${member.name} removed from the team.`);
  }

  function resend(member: Member) {
    setNotice(`Invite resent to ${member.email}.`);
  }

  return (
    <section>
      <h1>Team</h1>
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      <Card>
        <ul className="member-list">
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
