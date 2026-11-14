import type { ReactNode } from 'react';
import { StreamedShell } from './StreamedShell';

export default function StreamedLayout({ children }: { children: ReactNode }) {
  return <StreamedShell>{children}</StreamedShell>;
}
