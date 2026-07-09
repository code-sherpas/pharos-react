import { useState } from 'react';
import { LoginPage } from './pages/Login';
import { Shell } from './Shell';

/**
 * Consumer harness entry: Login → the signed-in Shell (top bar + Dashboard /
 * Team / Settings pages). Auth is a local boolean on purpose — the harness
 * tests component composition, not a router.
 */
export function App() {
  const [user, setUser] = useState<string | null>(null);

  return user ? (
    <Shell user={user} onSignOut={() => setUser(null)} />
  ) : (
    <LoginPage onSuccess={(email) => setUser(email)} />
  );
}
