import { useState } from 'react';
import { TopBar } from './components/TopBar';
import { DashboardPage } from './pages/Dashboard';
import { TeamPage } from './pages/Team';
import { SettingsPage } from './pages/Settings';
import { ReportPage } from './pages/Report';
import { TaxonomyPage } from './pages/Taxonomy';
import { MemberPage, MemberProjectsPage } from './pages/Member';
import { MEMBERS, canOpenMemberPages } from './data';
import type { TeamView } from './components/TeamLink';

export type Page = 'dashboard' | 'team' | 'report' | 'taxonomy' | 'settings';

/**
 * The signed-in application shell: a persistent top bar (composing Avatar +
 * DropdownMenu, IconButton and Popover) over a state-driven page area. Routing
 * stays a local `useState` on purpose — the harness exercises component
 * composition, not a router.
 *
 * Team has inner screens — a member's page and a member's projects — each with
 * a Breadcrumb back up. Who may open a member's page follows the signed-in
 * person's role: a viewer reaches only their own projects, from the account
 * menu, and sees the member level of that breadcrumb as text.
 */
export function Shell({ user, onSignOut }: { user: string; onSignOut: () => void }) {
  const [page, setPage] = useState<Page>('dashboard');
  const [teamView, setTeamView] = useState<TeamView>({ kind: 'list' });
  // Set when the person goes up to the list from an inner screen, so focus
  // lands on its heading; the top bar keeps focus where it is, as before.
  const [focusTeamHeading, setFocusTeamHeading] = useState(false);
  const signedInMember = MEMBERS.find((member) => member.email === user);
  // Someone signed in outside the team fixture is treated as an admin.
  const canOpenMember = canOpenMemberPages(signedInMember?.role ?? 'Admin');

  function navigate(next: Page) {
    setPage(next);
    setTeamView({ kind: 'list' });
    setFocusTeamHeading(false);
  }

  function navigateInsideTeam(view: TeamView) {
    setPage('team');
    setTeamView(view);
    setFocusTeamHeading(view.kind === 'list');
  }

  function openOwnProjects() {
    if (signedInMember) navigateInsideTeam({ kind: 'projects', memberId: signedInMember.id });
  }

  const viewedMember =
    teamView.kind === 'list'
      ? undefined
      : MEMBERS.find((member) => member.id === teamView.memberId);

  return (
    <div className="shell">
      <TopBar
        user={user}
        page={page}
        onNavigate={navigate}
        onOpenOwnProjects={signedInMember ? openOwnProjects : undefined}
        onSignOut={onSignOut}
      />
      {/*
       * The Report page owns its row: its <main> and, beside it, the
       * SidePanel's <aside>, edge to edge under the top bar — the way an
       * application lays out a contextual panel. The other pages sit in the
       * shared centred <main>.
       */}
      {page === 'report' ? (
        <ReportPage />
      ) : page === 'taxonomy' ? (
        <TaxonomyPage />
      ) : (
        <main className="shell-main">
          {page === 'dashboard' && <DashboardPage user={user} />}
          {page === 'team' && teamView.kind === 'member' && viewedMember && (
            <MemberPage member={viewedMember} onNavigate={navigateInsideTeam} />
          )}
          {page === 'team' && teamView.kind === 'projects' && viewedMember && (
            <MemberProjectsPage
              member={viewedMember}
              canOpenMember={canOpenMember}
              onNavigate={navigateInsideTeam}
            />
          )}
          {page === 'team' && (teamView.kind === 'list' || !viewedMember) && (
            <TeamPage
              canOpenMember={canOpenMember}
              focusHeadingOnArrival={focusTeamHeading}
              onNavigate={navigateInsideTeam}
            />
          )}
          {page === 'settings' && <SettingsPage />}
        </main>
      )}
    </div>
  );
}
