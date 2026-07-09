import { useState } from 'react';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';

/**
 * F0 of the consumer harness: a two-screen flow (Login → Dashboard) that
 * exercises the currently shipped atoms as a real consumer would. Routing is a
 * local boolean on purpose — the harness tests component composition, not a
 * router. Later phases add the app shell, settings form, team list and overlay
 * stress pages (see AGENTS.md → "Consumer harness").
 */
export function App() {
  const [user, setUser] = useState<string | null>(null);

  return user ? <DashboardPage user={user} /> : <LoginPage onSuccess={(email) => setUser(email)} />;
}
