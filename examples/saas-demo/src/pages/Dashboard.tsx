import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Separator,
} from '@code-sherpas/pharos-react';

interface DashboardPageProps {
  user: string;
}

/**
 * Minimal post-login screen for F0 — enough to assert a successful auth flow
 * and to compose a few more atoms (Badge, Separator). Grows into the real app
 * shell (Avatar menu, IconButton, Popover, DropdownMenu) in F1.
 */
export function DashboardPage({ user }: DashboardPageProps) {
  return (
    <main className="dashboard">
      <h1>Dashboard</h1>
      <p>
        Signed in as <strong>{user}</strong> <Badge variant="success">Active</Badge>
      </p>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Everything your team is shipping.</CardDescription>
        </CardHeader>
        <CardContent>You have 3 active projects.</CardContent>
      </Card>
    </main>
  );
}
