import { useState } from 'react';
import { TopBar } from './components/TopBar';
import { DashboardPage } from './pages/Dashboard';
import { TeamPage } from './pages/Team';
import { SettingsPage } from './pages/Settings';
import { ReportPage } from './pages/Report';

export type Page = 'dashboard' | 'team' | 'report' | 'settings';

/**
 * The signed-in application shell: a persistent top bar (composing Avatar +
 * DropdownMenu, IconButton and Popover) over a state-driven page area. Routing
 * stays a local `useState` on purpose — the harness exercises component
 * composition, not a router.
 */
export function Shell({ user, onSignOut }: { user: string; onSignOut: () => void }) {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <div className="shell">
      <TopBar user={user} page={page} onNavigate={setPage} onSignOut={onSignOut} />
      {/*
       * The Report page owns its row: its <main> and, beside it, the
       * SidePanel's <aside>, edge to edge under the top bar — the way an
       * application lays out a contextual panel. The other pages sit in the
       * shared centred <main>.
       */}
      {page === 'report' ? (
        <ReportPage />
      ) : (
        <main className="shell-main">
          {page === 'dashboard' && <DashboardPage user={user} />}
          {page === 'team' && <TeamPage />}
          {page === 'settings' && <SettingsPage />}
        </main>
      )}
    </div>
  );
}
