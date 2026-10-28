// Mock data for the SaaS demo. Not part of Pharos — just fixtures the
// consumer app composes the components around.

export interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
}

export const MEMBERS: Member[] = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@nimbus.io', role: 'Admin' },
  { id: '2', name: 'Alan Turing', email: 'alan@nimbus.io', role: 'Editor' },
  { id: '3', name: 'Grace Hopper', email: 'grace@nimbus.io', role: 'Viewer' },
  { id: '4', name: 'Katherine Johnson', email: 'katherine@nimbus.io', role: 'Editor' },
];

export const TIMEZONES = [
  'UTC',
  'Europe/Madrid',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
  // As long as the real-world labels that made options get cut off.
  '(GMT-06:00) America/Mexico_City — Central Standard Time (Mexico)',
];

/** Where a workspace keeps its data — chosen by its admin, read-only here. */
export const DATA_REGIONS = [
  'Europe (Frankfurt)',
  'United States (Virginia)',
  'Asia Pacific (Sydney)',
];

export const SKILLS = [
  'React',
  'TypeScript',
  'Design Systems',
  'Accessibility',
  'CSS',
  'Testing',
  'Node.js',
];

export const NOTIFICATIONS = [
  'Grace commented on “Q3 roadmap”.',
  'Alan invited you to “Design review”.',
  'Your export is ready to download.',
];

/** Topics of this quarter's projects — content identity, so accent Badges. */
export const PROJECT_TOPICS = ['Design', 'Platform', 'Growth'];

/** Badge tone per role — maps to Pharos Badge `variant` values. */
export const ROLE_TONE: Record<Member['role'], 'info' | 'success' | 'secondary'> = {
  Admin: 'info',
  Editor: 'success',
  Viewer: 'secondary',
};

export function initials(value: string): string {
  const parts = value.trim().split(/\s+/);
  return parts
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
