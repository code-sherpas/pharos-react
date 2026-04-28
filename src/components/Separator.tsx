import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';
import styles from './Separator.module.css';

/**
 * Visual or semantic divider between two regions. Renders a thin line in
 * either orientation. Two contracts coexist behind the same component:
 *
 * - **Decorative** (default, `decorative={true}`) — the line is purely
 *   visual chrome. Marked `role="none"` so assistive tech ignores it,
 *   the same way shadcn / Radix Separator do.
 * - **Semantic** (`decorative={false}`) — the line announces a logical
 *   partition (e.g. between groups in a menu). Marked `role="separator"`
 *   and, for vertical separators, `aria-orientation="vertical"` per the
 *   ARIA APG (the spec defaults `aria-orientation` to "horizontal" for
 *   role=separator, so we emit the attribute only when it differs).
 *
 * The resting border tone is `--pharos-color-neutral-200` (Decision D12:
 * subtle borders for non-interactive surfaces). WCAG 1.4.11 does not
 * apply to decorative separators or to the boundaries of non-interactive
 * containers; the system reserves the stronger `neutral-500` tone for
 * interactive controls (Input, Button secondary, Badge outline — D10).
 */
export interface SeparatorProps extends ComponentPropsWithoutRef<'div'> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export function Separator({
  orientation = 'horizontal',
  decorative = true,
  className,
  ...rest
}: SeparatorProps) {
  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-orientation={!decorative && orientation === 'vertical' ? 'vertical' : undefined}
      data-pharos-orientation={orientation}
      className={cn(styles.separator, styles[orientation], className)}
      {...rest}
    />
  );
}

Separator.displayName = 'Separator';
