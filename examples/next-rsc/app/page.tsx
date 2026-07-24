// NO "use client" — this is a React Server Component.
//
// It renders every STATELESS atom directly on the server. If any of these
// atoms regressed into needing a client boundary (a hook/context added without
// a `"use client"` directive, or the build dropping per-file directives),
// `next build` would fail while prerendering this route. That failure is the
// whole point of this harness — the Vite saas-demo cannot catch it.
//
// The stateless atoms are imported via their #80 deep-import subpaths, so this
// also proves those subpaths resolve (with types) under the Next.js resolver.
import { Badge } from '@code-sherpas/pharos-react/Badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@code-sherpas/pharos-react/Card';
import { Input } from '@code-sherpas/pharos-react/Input';
import { Separator } from '@code-sherpas/pharos-react/Separator';
import { Textarea } from '@code-sherpas/pharos-react/Textarea';
import { Spinner } from '@code-sherpas/pharos-react/Spinner';
// A client atom referenced from a Server Component is fine *because* it carries
// its own `"use client"` — Next treats it as a client boundary. If Button lost
// its directive, its hook would run during prerender and the build would fail.
import { Button } from '@code-sherpas/pharos-react/Button';
import { ClientPanel } from './ClientPanel';

export default function Page() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24, display: 'grid', gap: 24 }}>
      <h1>Pharos RSC harness</h1>

      {/* Stateless atoms rendered on the server. */}
      <section aria-label="Server-rendered stateless atoms" style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge variant="success">Server</Badge>
          <Badge variant="outline">Stateless</Badge>
          <Spinner aria-label="Loading" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Server Component</CardTitle>
            <CardDescription>Rendered without a client boundary.</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'grid', gap: 12 }}>
            <label htmlFor="name">Name</label>
            <Input id="name" placeholder="Ada Lovelace" />
            <label htmlFor="bio">Bio</label>
            <Textarea id="bio" placeholder="Tell us about yourself…" />
          </CardContent>
          <Separator />
          <CardFooter>
            {/* A client atom used from the server tree (a client boundary). */}
            <Button>Save</Button>
          </CardFooter>
        </Card>
      </section>

      {/* Client atoms live behind a client boundary. */}
      <ClientPanel />
    </main>
  );
}
