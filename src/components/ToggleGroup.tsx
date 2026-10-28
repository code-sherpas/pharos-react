'use client';

import type { ComponentProps } from 'react';
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import styles from './ToggleGroup.module.css';

const toggleGroupVariants = cva(styles.group, {
  variants: {
    size: {
      sm: styles.sizeSm,
      md: styles.sizeMd,
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

/**
 * Two to five options shown side by side, where choosing one changes what the
 * surrounding view shows at once — a list shown as List / Grid. The shadcn
 * **ToggleGroup** contract (D25: the artifact's SegmentedControl under its
 * canonical name), over Base UI's `ToggleGroup`: a `role="group"` of toggle
 * buttons with `aria-pressed`, one tab stop and arrow keys to move between
 * them; Enter or Space presses the focused one.
 *
 * In the default single mode one item always stays pressed: pressing the
 * pressed item again is ignored, so the view always has an answer. With
 * `multiple`, any number can be pressed, none included.
 *
 * Like the other form atoms (D11) it owns no label: name the group with
 * `aria-label` or `aria-labelledby`. The value is always an array, as in
 * Base UI: `value={[view]}` and `onValueChange={(v) => setView(v[0])}`.
 *
 * @example
 * <ToggleGroup aria-label="View" value={[view]} onValueChange={(v) => setView(v[0])}>
 *   <ToggleGroupItem value="list">List</ToggleGroupItem>
 *   <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
 * </ToggleGroup>
 */
export interface ToggleGroupProps
  extends ComponentProps<typeof BaseToggleGroup>, VariantProps<typeof toggleGroupVariants> {}

export function ToggleGroup({
  size,
  multiple = false,
  onValueChange,
  className,
  ...rest
}: ToggleGroupProps) {
  const resolvedSize = size ?? 'md';
  return (
    <BaseToggleGroup
      data-pharos-slot="toggle-group"
      data-pharos-size={resolvedSize}
      multiple={multiple}
      onValueChange={function keepOnePressed(groupValue, eventDetails) {
        if (!multiple && groupValue.length === 0) {
          eventDetails.cancel();
          return;
        }
        onValueChange?.(groupValue, eventDetails);
      }}
      className={cn(toggleGroupVariants({ size: resolvedSize }), className)}
      {...rest}
      // Base UI sets aria-orientation, which ARIA does not allow on
      // role="group" (axe: aria-allowed-attr). The arrow keys work without it.
      aria-orientation={undefined}
    />
  );
}

ToggleGroup.displayName = 'ToggleGroup';

/**
 * One option of a `ToggleGroup`. Wraps Base UI's `Toggle` and requires a
 * `value` unique within the group. Its text names it; an icon-only item needs
 * an `aria-label`.
 */
export interface ToggleGroupItemProps extends ComponentProps<typeof BaseToggle> {}

export function ToggleGroupItem({ className, ...rest }: ToggleGroupItemProps) {
  return (
    <BaseToggle
      data-pharos-slot="toggle-group-item"
      className={cn(styles.item, className)}
      {...rest}
    />
  );
}

ToggleGroupItem.displayName = 'ToggleGroupItem';

export { toggleGroupVariants };
