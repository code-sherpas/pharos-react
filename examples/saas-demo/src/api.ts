// A stand-in for the demo's backend. Not part of Pharos: it gives the
// confirmations something that takes time, and sometimes fails, to wait for.

import type { Member } from './data';

/** How long a request takes, long enough to see (and test) the pending state. */
export const REQUEST_MS = 1500;

/** Members whose first removal fails, as a dropped connection would. */
const FAILS_ONCE = new Set<Member['id']>(['4']);
const attempts = new Map<Member['id'], number>();

/** What became of a removal request. */
export type RemovalOutcome = 'removed' | 'failed';

/** Asks the backend to remove `member` from the team. Never rejects: a failure is an outcome. */
export function requestRemoval(member: Member): Promise<RemovalOutcome> {
  const attempt = (attempts.get(member.id) ?? 0) + 1;
  attempts.set(member.id, attempt);
  const outcome: RemovalOutcome = FAILS_ONCE.has(member.id) && attempt === 1 ? 'failed' : 'removed';
  return new Promise(function answerLater(resolve) {
    setTimeout(resolve, REQUEST_MS, outcome);
  });
}
