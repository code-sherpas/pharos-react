import { useState, type FormEvent } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Spinner,
} from '@code-sherpas/pharos-react';

interface LoginPageProps {
  onSuccess: (email: string) => void;
}

/**
 * Composes Card (+ slots), Input (with `aria-invalid` error state, D10),
 * Button and Spinner (inside the Button while submitting). This is the F0
 * flow the Playwright smoke test drives end-to-end.
 */
export function LoginPage({ onSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) {
      setError('Enter both your email and password.');
      return;
    }
    setError(null);
    setSubmitting(true);
    // Simulate an auth round-trip so the loading state is observable.
    window.setTimeout(() => onSuccess(email), 400);
  }

  const invalid = error != null;

  return (
    <main className="centered">
      <Card variant="elevated" className="login-card">
        <form onSubmit={handleSubmit} noValidate>
          <CardHeader>
            {/*
             * CardTitle renders a <div> by design (atoms don't impose the
             * document outline). The consumer assigns the heading semantics —
             * here role="heading" + aria-level so the login page has a proper
             * H1 for assistive tech and tests.
             */}
            <CardTitle role="heading" aria-level={1}>
              Welcome back
            </CardTitle>
            <CardDescription>Sign in to your Nimbus workspace.</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="field">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                aria-invalid={invalid || undefined}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                aria-invalid={invalid || undefined}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="error-text" role="alert">
                {error}
              </p>
            )}
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? (
                <>
                  <Spinner size="sm" srLabel="Signing in…" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
