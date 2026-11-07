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

/** Asks the backend to remove `member` from the team. Never rejects: a failure is an outcome. */
export function requestRemoval(member: Member): Promise<RemovalOutcome> {
  const attempt = (attempts.get(member.id) ?? 0) + 1;
  attempts.set(member.id, attempt);
  const outcome: RemovalOutcome = FAILS_ONCE.has(member.id) && attempt === 1 ? 'failed' : 'removed';
  return new Promise(function answerLater(resolve) {
    function answer() {
      resolve(outcome);
    }
    const held = heldRequests();
    if (held?.held) held.waiting.push(answer);
    else setTimeout(answer, REQUEST_MS);
  });
}
