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
      <main className="shell-main">
        {page === 'dashboard' && <DashboardPage user={user} />}
        {page === 'team' && <TeamPage />}
        {page === 'report' && <ReportPage />}
        {page === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}
