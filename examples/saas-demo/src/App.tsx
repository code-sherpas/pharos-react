import { useState } from 'react';
import { ToastProvider, Toaster } from '@code-sherpas/pharos-react';
import { LoginPage } from './pages/Login';
import { Shell } from './Shell';

/**
 * Consumer harness entry: Login → the signed-in Shell (top bar + Dashboard /
 * Team / Settings pages). Auth is a local boolean on purpose — the harness
 * tests component composition, not a router. One ToastProvider and one Toaster
 * for the whole app, the way a consumer mounts them at its root.
 */
export function App() {
  const [user, setUser] = useState<string | null>(null);

  return (
    <ToastProvider>
      {user ? (
        <Shell user={user} onSignOut={() => setUser(null)} />
      ) : (
        <LoginPage onSuccess={(email) => setUser(email)} />
      )}
      {/* Below the top bar while there is one: it publishes where it ends. */}
      <Toaster
        position="top-center"
        offset="calc(var(--nimbus-topbar-bottom, 0px) + var(--pharos-spacing-4))"
        label="Notifications"
        closeLabel="Close"
      />
    </ToastProvider>
  );
}
