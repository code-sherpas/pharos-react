import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  Button,
  Spinner,
} from '@code-sherpas/pharos-react';
import { requestBilling, type Billing } from '../api';

/**
 * Three parts of the Settings page that each have nothing to show, for a
 * different reason, and say which: Billing could not be loaded (a
 * `destructive` Alert with «Retry»), Connected apps is empty (plain text that
 * says how it fills), and the Audit log is not for this person (an `info`
 * Alert that says who can see it). They look and read differently: a red bar,
 * a circled «!» and role="alert"; no notice at all; a blue bar, an «i» and
 * role="status".
 */
export function WorkspaceSections() {
  return (
    <div className="workspace-sections">
      <BillingSection />
      <ConnectedAppsSection />
      <AuditLogSection />
    </div>
  );
}

type BillingState =
  | { status: 'loading' }
  | { status: 'failed'; attempts: number }
  | { status: 'retrying'; attempts: number }
  | { status: 'loaded'; billing: Billing };

/**
 * Loads the billing; the demo backend fails the first two attempts. A failure
 * keeps the same Alert on screen and changes its text — «Trying again…», then
 * how many attempts failed — so the person sees each outcome and a screen
 * reader announces it in the region, while the focus stays on «Retry». Once
 * it loads, the Alert goes and the focus moves to the section's heading, the
 * start of what just appeared, rather than falling to the page.
 */
function BillingSection() {
  const [attempt, setAttempt] = useState(1);
  const [state, setState] = useState<BillingState>({ status: 'loading' });
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(
    function loadBilling() {
      let current = true;
      void requestBilling(attempt).then(function show(outcome) {
        if (!current) return;
        setState(
          outcome.kind === 'loaded'
            ? { status: 'loaded', billing: outcome.billing }
            : { status: 'failed', attempts: attempt },
        );
      });
      return function ignoreALateAnswer() {
        current = false;
      };
    },
    [attempt],
  );

  useEffect(
    function focusWhatARetryLoaded() {
      if (state.status === 'loaded' && attempt > 1) heading.current?.focus();
    },
    [state.status, attempt],
  );

  function retry() {
    // Unavailable the focusable way while a retry is on its way.
    if (state.status !== 'failed') return;
    setState({ status: 'retrying', attempts: state.attempts });
    setAttempt(attempt + 1);
  }

  return (
    <section aria-labelledby="billing-heading" aria-busy={state.status === 'loading'}>
      <h2 id="billing-heading" ref={heading} tabIndex={-1}>
        Billing
      </h2>
      {state.status === 'loading' && (
        <p className="section-loading">
          <Spinner size="sm" srLabel="Loading billing…" />
          <span aria-hidden="true">Loading billing…</span>
        </p>
      )}
      {(state.status === 'failed' || state.status === 'retrying') && (
        <Alert variant="destructive">
          <AlertTitle render={<h3 />}>Billing couldn’t be loaded</AlertTitle>
          <AlertDescription>
            <BillingFailure state={state} />
          </AlertDescription>
          <AlertAction>
            <Button
              intent="secondary"
              size="sm"
              aria-disabled={state.status === 'retrying' || undefined}
              onClick={retry}
            >
              Retry
            </Button>
          </AlertAction>
        </Alert>
      )}
      {state.status === 'loaded' && (
        <dl className="billing-facts">
          <div>
            <dt>Plan</dt>
            <dd>{state.billing.plan}</dd>
          </div>
          <div>
            <dt>Seats in use</dt>
            <dd>
              {state.billing.seatsUsed} of {state.billing.seatsTotal}
            </dd>
          </div>
        </dl>
      )}
    </section>
  );
}

/** What the failure says now: the first time, a retry on its way, or how many failed. */
function BillingFailure({ state }: { state: { status: 'failed' | 'retrying'; attempts: number } }) {
  if (state.status === 'retrying') return <>Trying again…</>;
  if (state.attempts === 1) {
    return <>Your plan and seats aren’t shown. The rest of your settings can still be saved.</>;
  }
  return (
    <>
      Still couldn’t load it after {state.attempts} attempts. The rest of your settings can still be
      saved.
    </>
  );
}

/** Empty, and says how it fills: not a failure, so no notice. */
function ConnectedAppsSection() {
  return (
    <section aria-labelledby="apps-heading">
      <h2 id="apps-heading">Connected apps</h2>
      <p className="section-empty">No apps are connected to this workspace yet.</p>
      <p className="hint-text">Connect one from the app’s own settings and it appears here.</p>
    </section>
  );
}

/** Not for this person: says so, why, and who can see it. Not a failure either. */
function AuditLogSection() {
  return (
    <section aria-labelledby="audit-heading">
      <h2 id="audit-heading">Audit log</h2>
      <Alert variant="info">
        <AlertTitle render={<h3 />}>You can’t see the audit log</AlertTitle>
        <AlertDescription>
          Only workspace admins can. Ask one of them if you need something from it.
        </AlertDescription>
      </Alert>
    </section>
  );
}
