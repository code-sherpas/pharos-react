import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@code-sherpas/pharos-react';
import { MEMBERS, PROJECT_TOPICS, initials } from '../data';
import { InviteDialog } from '../components/InviteDialog';

interface DashboardPageProps {
  user: string;
}

/**
 * Overview screen: stat Cards with status Badges, the projects' topic tags in
 * the brand accent (content identity, not state), and an AvatarGroup of the
 * team. Keeps the user email visible (the auth smoke test asserts it).
 */
export function DashboardPage({ user }: DashboardPageProps) {
  return (
    <section className="dashboard">
      <div className="page-head">
        <h1>Dashboard</h1>
        <InviteDialog />
      </div>
      <p>
        Welcome back, <strong>{user}</strong>.
      </p>

      <div className="card-grid">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Active this quarter</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="stat">3</span> <Badge variant="success">On track</Badge>
            <ul className="project-topics" aria-label="Project topics">
              <li>
                <Badge variant="accent">Q3 plan</Badge>
              </li>
              {PROJECT_TOPICS.map((topic) => (
                <li key={topic}>
                  <Badge variant="accent-soft">{topic}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open tasks</CardTitle>
            <CardDescription>Across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="stat">12</span> <Badge variant="warning">4 due soon</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
            <CardDescription>{MEMBERS.length} members</CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarGroup max={3}>
              {MEMBERS.map((m) => (
                <Avatar key={m.id} aria-label={m.name}>
                  <AvatarFallback>{initials(m.name)}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
          </CardContent>
        </Card>
      </div>

      <Separator />
      <p>Everything your team is shipping, in one place.</p>
    </section>
  );
}
