// A stand-in for the demo's backend. Not part of Pharos: it gives the
// confirmations something that takes time, and sometimes fails, to wait for.

import type { Member } from './data';

/** How long a request takes, long enough to see the pending state. */
export const REQUEST_MS = 1000;

/** Members whose first removal fails, as a dropped connection would. */
const FAILS_ONCE = new Set<Member['id']>(['4']);
const attempts = new Map<Member['id'], number>();

/**
 * Lets an e2e test hold the answers and release them itself, so it can look at
 * the pending state without racing a timer: set `window.demoRequests` to
 * `{ held: true, waiting: [] }` before the page loads, then call each function
 * in `waiting` to answer.
 */
interface HeldRequests {
  held: boolean;
  waiting: (() => void)[];
}

function heldRequests(): HeldRequests | undefined {
  return (window as Window & { demoRequests?: HeldRequests }).demoRequests;
}

/** What became of a removal request. */
export type RemovalOutcome = 'removed' | 'failed';

/**
 * Answers with `outcome` after `REQUEST_MS`, or when the e2e test releases it
 * (see `HeldRequests`).
 */
function answerLater<Outcome>(outcome: Outcome): Promise<Outcome> {
  return new Promise(function waitToAnswer(resolve) {
    function answer() {
      resolve(outcome);
    }
    const held = heldRequests();
    if (held?.held) held.waiting.push(answer);
    else setTimeout(answer, REQUEST_MS);
  });
}

/** Asks the backend to remove `member` from the team. Never rejects: a failure is an outcome. */
export function requestRemoval(member: Member): Promise<RemovalOutcome> {
  const attempt = (attempts.get(member.id) ?? 0) + 1;
  attempts.set(member.id, attempt);
  const outcome: RemovalOutcome = FAILS_ONCE.has(member.id) && attempt === 1 ? 'failed' : 'removed';
  return answerLater(outcome);
}

/** The workspace's billing, as the Settings page shows it. */
export interface Billing {
  plan: string;
  seatsUsed: number;
  seatsTotal: number;
}

/** What became of a request for the billing: loaded, or failed to load. */
export type BillingOutcome = { kind: 'loaded'; billing: Billing } | { kind: 'failed' };

/** How many attempts at loading the billing fail, as a flaky service would. */
const BILLING_FAILS_FOR = 2;

/**
 * Asks the backend for the workspace's billing. `attempt` counts from 1: the
 * first `BILLING_FAILS_FOR` fail, so the page can show a section that could
 * not be loaded, a retry that fails again, and one that works. Never rejects:
 * a failure is an outcome.
 */
export function requestBilling(attempt: number): Promise<BillingOutcome> {
  const outcome: BillingOutcome =
    attempt <= BILLING_FAILS_FOR
      ? { kind: 'failed' }
      : {
          kind: 'loaded',
          billing: { plan: 'Team', seatsUsed: 8, seatsTotal: 10 },
        };
  return answerLater(outcome);
}
